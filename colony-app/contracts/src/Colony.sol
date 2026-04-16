// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./GToken.sol";
import "./SToken.sol";
import "./VToken.sol";

interface IColonyRegistry {
    function getFeeForColony(address colony) external view returns (uint256);
    function protocolTreasury()             external view returns (address);
}

// Minimal interface — Colony only needs to call mint() on OToken
interface IOToken {
    function mint(address to, string calldata name, uint8 orgType) external returns (uint256);
}

/**
 * @title Colony
 * @notice The Fisc — entry point for all colony economic actions.
 *
 *   join()              — register as citizen, receive G-token + first UBI
 *   claimUbi()          — claim monthly UBI (1000 S per epoch)
 *   saveToV(amount)     — convert S → V (max 200/month)
 *   redeemV(amount)     — convert V → S (1:1, any time)
 *   send(to,amount)     — send S-tokens; accrues protocol infrastructure fee
 *   settleProtocol()    — MCC Fisc forwards accrued ETH fee to protocol treasury
 *
 * Infrastructure fee:
 *   Each send() increments pendingProtocolFee by registry.feePerTx() (ETH wei).
 *   No ETH is taken from citizens per transaction — it accumulates as a colony
 *   obligation, visible as a line item on the monthly MCC infrastructure bill.
 *   The MCC Fisc calls settleProtocol() monthly to pay the protocol treasury.
 */
contract Colony {
    GToken public gToken;
    SToken public sToken;
    VToken public vToken;
    address public oToken;              // OToken address — set via setOToken() after deploy

    string  public colonyName;
    address public founder;
    address public registry;            // ColonyRegistry — address(0) if not registered
    address public companyFactory;      // CompanyFactory — address(0) until set

    uint256 public pendingProtocolFee;  // ETH wei accrued since last settlement

    mapping(address => bool)   public isCitizen;
    mapping(address => string) public citizenName;
    address[] public citizens;

    // Company wallets registered by CompanyFactory — may send S-tokens
    mapping(address => bool) public isCompanyWallet;

    event CitizenJoined(address indexed citizen, uint256 gTokenId, string name);
    event NameUpdated(address indexed citizen, string name);
    event UbiClaimed(address indexed citizen, uint256 amount, uint256 epoch);
    event Saved(address indexed citizen, uint256 amount);
    event Redeemed(address indexed citizen, uint256 amount);
    event Sent(address indexed from, address indexed to, uint256 amount, string note);
    event ProtocolFeeSettled(uint256 amount, address treasury);
    event CompanyWalletRegistered(address indexed wallet);
    event VDividendPaid(address indexed from, address indexed to, uint256 amount);

    /**
     * @param _name     Colony display name
     * @param _registry ColonyRegistry address — pass address(0) if deploying without registry
     * @param _gToken   Pre-deployed GToken address (ownership must be transferred to Colony after)
     * @param _sToken   Pre-deployed SToken address
     * @param _vToken   Pre-deployed VToken address
     *
     * Tokens are deployed separately in the deploy script to keep Colony's constructor
     * gas cost low and each contract independently verifiable on Basescan.
     * After deploying Colony, call transferOwnership(colonyAddr) on each token contract,
     * then call setOToken() and setCompanyFactory().
     */
    constructor(
        string memory _name,
        address _registry,
        address _gToken,
        address _sToken,
        address _vToken
    ) {
        colonyName = _name;
        founder    = msg.sender;
        registry   = _registry;
        gToken     = GToken(_gToken);
        sToken     = SToken(_sToken);
        vToken     = VToken(_vToken);
    }

    modifier onlyCitizen() {
        require(isCitizen[msg.sender], "Colony: not a citizen");
        _;
    }

    modifier onlyCitizenOrCompany() {
        require(isCitizen[msg.sender] || isCompanyWallet[msg.sender], "Colony: not authorized");
        _;
    }

    // ── One-time wiring ───────────────────────────────────────────────────────

    /**
     * @notice Set the OToken address. Founder only. Call once after OToken ownership
     *         has been transferred to this Colony contract.
     */
    function setOToken(address _oToken) external {
        require(msg.sender == founder,    "Colony: only founder");
        require(oToken == address(0),     "Colony: OToken already set");
        require(_oToken != address(0),    "Colony: zero address");
        oToken = _oToken;
    }

    /**
     * @notice Set or update the CompanyFactory address. Founder only.
     *         May be called again to point to a new factory (e.g. after an
     *         upgrade to the beacon proxy pattern).
     */
    function setCompanyFactory(address _factory) external {
        require(msg.sender == founder,  "Colony: only founder");
        require(_factory != address(0), "Colony: zero address");
        companyFactory = _factory;
    }

    // ── Citizen actions ───────────────────────────────────────────────────────

    /**
     * @notice Join the colony. Mints a G-token and issues first UBI immediately.
     *         Can only join once. Name is stored on-chain and may be updated later.
     */
    function join(string calldata name) external {
        require(!isCitizen[msg.sender], "Colony: already a citizen");
        require(bytes(name).length > 0,   "Colony: name required");
        require(bytes(name).length <= 64, "Colony: name too long");

        isCitizen[msg.sender]    = true;
        citizenName[msg.sender]  = name;
        citizens.push(msg.sender);

        uint256 tokenId = gToken.mint(msg.sender);
        sToken.issueUbi(msg.sender);

        emit CitizenJoined(msg.sender, tokenId, name);
        emit UbiClaimed(msg.sender, 1000 * 1e18, sToken.currentEpoch());
    }

    /**
     * @notice Update your display name at any time.
     */
    function setName(string calldata name) external onlyCitizen {
        require(bytes(name).length > 0,   "Colony: name required");
        require(bytes(name).length <= 64, "Colony: name too long");
        citizenName[msg.sender] = name;
        emit NameUpdated(msg.sender, name);
    }

    /**
     * @notice Claim UBI for the current epoch (call once per month after epoch advances).
     */
    function claimUbi() external onlyCitizen {
        sToken.issueUbi(msg.sender);
        emit UbiClaimed(msg.sender, 1000 * 1e18, sToken.currentEpoch());
    }

    /**
     * @notice Convert S-tokens to V-tokens. Max 200 S per month.
     */
    function saveToV(uint256 amount) external onlyCitizen {
        require(sToken.balanceOf(msg.sender) >= amount, "Colony: insufficient S balance");
        sToken.burn(msg.sender, amount);
        vToken.mint(msg.sender, amount);
        emit Saved(msg.sender, amount);
    }

    /**
     * @notice Redeem V-tokens back to S-tokens at 1:1.
     */
    function redeemV(uint256 amount) external onlyCitizen {
        require(vToken.balanceOf(msg.sender) >= amount, "Colony: insufficient V balance");
        vToken.burn(msg.sender, amount);
        sToken.issueUbiRaw(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
    }

    /**
     * @notice Send S-tokens to another address with an optional note.
     *         Citizens and registered company wallets may call.
     *         Accrues a small ETH infrastructure fee (tracked for monthly settlement).
     */
    function send(address to, uint256 amount, string calldata note) external onlyCitizenOrCompany {
        require(sToken.balanceOf(msg.sender) >= amount, "Colony: insufficient S balance");
        sToken.colonyTransfer(msg.sender, to, amount);

        if (registry != address(0)) {
            uint256 fee = IColonyRegistry(registry).getFeeForColony(address(this));
            if (fee > 0) pendingProtocolFee += fee;
        }

        emit Sent(msg.sender, to, amount, note);
    }

    /**
     * @notice MCC Fisc settles the accumulated protocol infrastructure fee.
     *         Caller must send exactly pendingProtocolFee in ETH. Called monthly.
     */
    function settleProtocol() external payable {
        require(msg.sender == founder,    "Colony: only founder");
        require(registry != address(0),   "Colony: no registry");
        uint256 amount = pendingProtocolFee;
        require(amount > 0,               "Colony: nothing to settle");
        require(msg.value >= amount,      "Colony: insufficient ETH");

        pendingProtocolFee = 0;

        address treasury = IColonyRegistry(registry).protocolTreasury();
        (bool ok,) = treasury.call{value: amount}("");
        require(ok, "Colony: transfer failed");

        if (msg.value > amount) {
            (bool r,) = msg.sender.call{value: msg.value - amount}("");
            require(r, "Colony: refund failed");
        }

        emit ProtocolFeeSettled(amount, treasury);
    }

    // ── Company wallet support ────────────────────────────────────────────────

    /**
     * @notice Register a company wallet so it can send S-tokens via send().
     *         Only CompanyFactory can call — triggered inside deployCompany().
     */
    function registerCompanyWallet(address wallet) external {
        require(msg.sender == companyFactory, "Colony: only factory");
        isCompanyWallet[wallet] = true;
        emit CompanyWalletRegistered(wallet);
    }

    /**
     * @notice Mint an O-token for a newly deployed company.
     *         Only CompanyFactory can call. Colony is the OToken owner (minter).
     * @param to      Founding secretary — receives the O-token
     * @param name    Company name
     * @param orgType OToken.OrgType enum value (0=Company,1=MCC,2=Cooperative,3=Civic)
     */
    function mintOrgToken(
        address to,
        string calldata name,
        uint8 orgType
    ) external returns (uint256) {
        require(msg.sender == companyFactory, "Colony: only factory");
        require(oToken != address(0),         "Colony: OToken not set");
        return IOToken(oToken).mint(to, name, orgType);
    }

    /**
     * @notice Convert a company's S-tokens to V-tokens. No monthly cap.
     *         Called by CompanyImplementation.convertToV().
     */
    function saveToVCompany(uint256 amount) external {
        require(isCompanyWallet[msg.sender],             "Colony: not a company wallet");
        require(sToken.balanceOf(msg.sender) >= amount,  "Colony: insufficient S balance");
        sToken.burn(msg.sender, amount);
        vToken.mintCompany(msg.sender, amount);
        emit Saved(msg.sender, amount);
    }

    /**
     * @notice Transfer V-tokens from a company wallet to an equity holder (dividend).
     *         Called by CompanyImplementation.distributeVDividend().
     */
    function transferVDividend(address to, uint256 amount) external {
        require(isCompanyWallet[msg.sender],            "Colony: not a company wallet");
        require(vToken.balanceOf(msg.sender) >= amount, "Colony: insufficient V balance");
        vToken.colonyTransfer(msg.sender, to, amount);
        emit VDividendPaid(msg.sender, to, amount);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    /**
     * @notice Advance epoch (monthly reset). Founder only for now.
     */
    function advanceEpoch() external {
        require(msg.sender == founder, "Colony: only founder");
        sToken.advanceEpoch();
        vToken.advanceEpoch();
    }

    /**
     * @notice Returns citizen count.
     */
    function citizenCount() external view returns (uint256) {
        return citizens.length;
    }

    receive() external payable {}
}
