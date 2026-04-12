// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./GToken.sol";
import "./SToken.sol";
import "./VToken.sol";

interface IColonyRegistry {
    function getFeeForColony(address colony) external view returns (uint256);
    function protocolTreasury()             external view returns (address);
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

    string  public colonyName;
    address public founder;
    address public registry;           // ColonyRegistry — address(0) if not registered

    uint256 public pendingProtocolFee; // ETH wei accrued since last settlement

    mapping(address => bool)   public isCitizen;
    mapping(address => string) public citizenName;
    address[] public citizens;

    event CitizenJoined(address indexed citizen, uint256 gTokenId, string name);
    event NameUpdated(address indexed citizen, string name);
    event UbiClaimed(address indexed citizen, uint256 amount, uint256 epoch);
    event Saved(address indexed citizen, uint256 amount);
    event Redeemed(address indexed citizen, uint256 amount);
    event Sent(address indexed from, address indexed to, uint256 amount, string note);
    event ProtocolFeeSettled(uint256 amount, address treasury);

    /**
     * @param _name     Colony display name
     * @param _ticker   Token ticker (e.g. "SFC")
     * @param _registry ColonyRegistry address — pass address(0) if deploying without registry
     */
    constructor(string memory _name, string memory _ticker, address _registry) {
        colonyName = _name;
        founder    = msg.sender;
        registry   = _registry;

        gToken = new GToken(_name, _ticker);
        sToken = new SToken(_ticker);
        vToken = new VToken(_ticker);
    }

    modifier onlyCitizen() {
        require(isCitizen[msg.sender], "Colony: not a citizen");
        _;
    }

    /**
     * @notice Join the colony. Mints a G-token and issues first UBI immediately.
     *         Can only join once. Name is stored on-chain and may be updated later.
     */
    function join(string calldata name) external {
        require(!isCitizen[msg.sender], "Colony: already a citizen");
        require(bytes(name).length > 0,  "Colony: name required");
        require(bytes(name).length <= 64, "Colony: name too long");

        isCitizen[msg.sender] = true;
        citizenName[msg.sender] = name;
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
        require(bytes(name).length > 0,  "Colony: name required");
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
     *         Accrues a small ETH infrastructure fee (set by ColonyRegistry).
     *         The fee is NOT taken from the sender — it accumulates as a colony
     *         obligation on pendingProtocolFee, settled monthly by the MCC Fisc.
     */
    function send(address to, uint256 amount, string calldata note) external onlyCitizen {
        require(sToken.balanceOf(msg.sender) >= amount, "Colony: insufficient S balance");
        sToken.colonyTransfer(msg.sender, to, amount);

        // Accrue protocol infrastructure fee (no ETH taken here — tracked for monthly settlement)
        if (registry != address(0)) {
            uint256 fee = IColonyRegistry(registry).getFeeForColony(address(this));
            if (fee > 0) pendingProtocolFee += fee;
        }

        emit Sent(msg.sender, to, amount, note);
    }

    /**
     * @notice MCC Fisc settles the accumulated protocol infrastructure fee.
     *         Caller must send exactly pendingProtocolFee in ETH.
     *         Called monthly as part of the billing cycle.
     */
    function settleProtocol() external payable {
        require(msg.sender == founder, "Colony: only founder");
        require(registry != address(0), "Colony: no registry");
        uint256 amount = pendingProtocolFee;
        require(amount > 0, "Colony: nothing to settle");
        require(msg.value >= amount, "Colony: insufficient ETH");

        pendingProtocolFee = 0;

        address treasury = IColonyRegistry(registry).protocolTreasury();
        (bool ok,) = treasury.call{value: amount}("");
        require(ok, "Colony: transfer failed");

        // Refund overpayment
        if (msg.value > amount) {
            (bool r,) = msg.sender.call{value: msg.value - amount}("");
            require(r, "Colony: refund failed");
        }

        emit ProtocolFeeSettled(amount, treasury);
    }

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
