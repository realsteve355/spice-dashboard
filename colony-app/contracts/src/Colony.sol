// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./GToken.sol";
import "./SToken.sol";
import "./VToken.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

interface IColonyRegistry {
    function getFeeForColony(address colony) external view returns (uint256);
    function protocolTreasury()             external view returns (address);
    function getFeeSplit(address colony, uint256 amount)
        external view returns (uint256 protocolAmt, uint256 founderAmt, address founderWallet);
}

// Minimal interface — Colony only needs to call mint() on OToken
interface IOToken {
    function mint(address to, string calldata name, uint8 orgType) external returns (uint256);
}

// AToken interface — Colony is the sole state-changer; all mutations relay through here
interface IAToken {
    // Obligation settlement (called at advanceEpoch)
    function activeObligationIds() external view returns (uint256[] memory);
    function getObligation(uint256 liabilityId) external view returns (
        address obligor,
        address creditor,
        uint256 monthlyAmountS,
        uint256 totalEpochs,
        uint256 epochsPaid,
        uint256 collateralId,
        bool    defaulted
    );
    function collateralFor(uint256 liabilityId) external view returns (uint256);
    function markObligationPaid(uint256 liabilityId) external returns (bool completed);
    function markObligationDefaulted(uint256 liabilityId, address creditor) external;

    // Equity
    function issueEquity(
        address company,
        address holder,
        uint256 stakeBps,
        uint256[] calldata vestingEpochs,
        uint256[] calldata trancheBps
    ) external returns (uint256 assetId, uint256 liabilityId);
    function forfeitUnvested(uint256 assetId) external returns (uint256 forfeitedBps);
    function cancelEquity(uint256 assetId, uint256 bps) external;
    function transferEquity(uint256 assetId, address to, uint256 bps) external returns (uint256 newAssetId);
    function claimVestedTranches(uint256 assetId, uint256 currentEpoch) external returns (uint256 newlyVestedBps);

    // Assets
    function registerAsset(
        address holder,
        uint256 valueSTokens,
        uint256 weightKg,
        bool    hasAI,
        uint256 depreciationBps,
        uint256 currentEpoch
    ) external returns (uint256 id);
    function transferAsset(uint256 id, address to, uint256 newValueS) external;
    function getTokenHolder(uint256 id) external view returns (address);

    // Obligations (citizen / company initiated)
    function issueObligation(
        address creditor,
        address obligor,
        uint256 monthlyAmountS,
        uint256 totalEpochs,
        uint256 collateralId,
        uint256 maxMonthlyS
    ) external returns (uint256 assetId, uint256 liabilityId);
}

// Minimal interface for Colony to call CompanyImplementation.redeemDirectorShares()
interface ICompanyImpl {
    function redeemDirectorShares(address exDirector) external;
}

/**
 * @title Colony
 * @notice The Fisc — entry point for all colony economic actions.
 *
 * Core citizen operations:
 *   join()               — register as citizen; receive G-token + first UBI
 *   claimUbi()           — claim monthly UBI (1000 S per epoch)
 *   saveToV(amount)      — convert S → V (max 200/month)
 *   redeemV(amount)      — convert V → S (1:1, any time)
 *   send(to, amount)     — send S-tokens; accrues protocol infrastructure fee
 *   settleProtocol()     — MCC Fisc forwards accrued ETH fee to protocol treasury
 *
 * A-token relay — Colony is the sole state-changer for AToken. All equity and
 * asset mutations flow through Colony, which validates caller authority before
 * forwarding to AToken. Citizens and companies interact with AToken only through
 * Colony.
 *
 * Epoch settlement — advanceEpoch() now settles all active obligation A-tokens
 * before advancing the epoch. Obligors with sufficient S pay creditors; secured
 * obligors who cannot pay have their collateral transferred to the creditor.
 *
 * Infrastructure fee:
 *   Each send() increments pendingProtocolFee by registry.feePerTx() (ETH wei).
 *   No ETH is taken from citizens per transaction — it accumulates as a colony
 *   obligation, visible as a line item on the monthly MCC infrastructure bill.
 *   The MCC Fisc calls settleProtocol() monthly to pay the protocol treasury.
 */
contract Colony is Initializable {

    // ── Core tokens ───────────────────────────────────────────────────────────

    GToken public gToken;
    SToken public sToken;
    VToken public vToken;
    address public oToken;        // OToken — set via setOToken() after deploy
    address public aToken;        // AToken — set via setAToken() after deploy

    // ── Config ────────────────────────────────────────────────────────────────

    string  public colonyName;
    address public founder;
    address public registry;       // ColonyRegistry — address(0) if not registered
    address public companyFactory; // CompanyFactory — address(0) until set

    uint256 public pendingProtocolFee;

    // ── Citizens ──────────────────────────────────────────────────────────────

    mapping(address => bool)   public isCitizen;
    mapping(address => string) public citizenName;
    address[] public citizens;

    // Company wallets registered by CompanyFactory — may call Colony.send() etc.
    mapping(address => bool) public isCompanyWallet;

    // ── Events ────────────────────────────────────────────────────────────────

    event CitizenJoined(address indexed citizen, uint256 gTokenId, string name);
    event NameUpdated(address indexed citizen, string name);
    event UbiClaimed(address indexed citizen, uint256 amount, uint256 epoch);
    event Saved(address indexed citizen, uint256 amount);
    event Redeemed(address indexed citizen, uint256 amount);
    event Sent(address indexed from, address indexed to, uint256 amount, string note);
    event ProtocolFeeSettled(uint256 amount, address treasury);
    event FounderSharePaid(address indexed colony, uint256 amount, address indexed founderWallet);
    event CompanyWalletRegistered(address indexed wallet);
    event VDividendPaid(address indexed from, address indexed to, uint256 amount);
    event ObligationSettled(uint256 indexed liabilityId, address obligor, address creditor, uint256 amount);
    event ObligationDefaulted(uint256 indexed liabilityId, address obligor);
    event EquityIssued(address indexed company, address indexed holder, uint256 assetId, uint256 stakeBps);
    event EquityTransferred(uint256 indexed fromAssetId, uint256 indexed toAssetId, address from, address to, uint256 bps);
    event EquityForfeited(uint256 indexed assetId, uint256 forfeitedBps);
    event EquityCancelled(uint256 indexed assetId, uint256 bps);
    event VestedTranchesClaimed(uint256 indexed assetId, uint256 newlyVestedBps);
    event AssetRegistered(uint256 indexed id, address indexed holder, uint256 valueSTokens);
    event AssetTransferred(uint256 indexed id, address from, address to, uint256 newValueS);
    event ObligationCreated(uint256 indexed assetId, uint256 indexed liabilityId, address creditor, address obligor);

    /**
     * @dev Locks the implementation contract so it cannot be initialized directly.
     *      All colonies are deployed as BeaconProxy instances — call initialize() on
     *      the proxy, not the implementation.
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize a new colony proxy. Called exactly once via BeaconProxy
     *         constructor when a new colony is deployed.
     *
     * @param _name     Colony display name
     * @param _registry ColonyRegistry address (pass address(0) to skip fee tracking)
     * @param _gToken   Pre-deployed GToken address (ownership transferred to Colony after)
     * @param _sToken   Pre-deployed SToken address
     * @param _vToken   Pre-deployed VToken address
     *
     * Tokens are deployed separately so each contract is independently verifiable
     * on Basescan. After initialize(), call transferOwnership(colonyAddr) on each
     * token, then setOToken(), setAToken(), and setCompanyFactory().
     */
    function initialize(
        string memory _name,
        address _registry,
        address _gToken,
        address _sToken,
        address _vToken
    ) external initializer {
        colonyName = _name;
        founder    = msg.sender;
        registry   = _registry;
        gToken     = GToken(_gToken);
        sToken     = SToken(_sToken);
        vToken     = VToken(_vToken);
    }

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyCitizen() {
        require(isCitizen[msg.sender], "Colony: not a citizen");
        _;
    }

    modifier onlyCitizenOrCompany() {
        require(isCitizen[msg.sender] || isCompanyWallet[msg.sender], "Colony: not authorized");
        _;
    }

    modifier requireAToken() {
        require(aToken != address(0), "Colony: AToken not set");
        _;
    }

    // ── One-time wiring ───────────────────────────────────────────────────────

    /**
     * @notice Set the OToken address. Founder only. Call once after OToken
     *         ownership has been transferred to this Colony contract.
     */
    function setOToken(address _oToken) external {
        require(msg.sender == founder, "Colony: only founder");
        require(oToken == address(0),  "Colony: OToken already set");
        require(_oToken != address(0), "Colony: zero address");
        oToken = _oToken;
    }

    /**
     * @notice Set the AToken address. Founder only. Call once after AToken
     *         has been deployed with this Colony as its colony address.
     */
    function setAToken(address _aToken) external {
        require(msg.sender == founder, "Colony: only founder");
        require(aToken == address(0),  "Colony: AToken already set");
        require(_aToken != address(0), "Colony: zero address");
        aToken = _aToken;
    }

    /**
     * @notice Set or update the CompanyFactory address. Founder only.
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

        isCitizen[msg.sender]   = true;
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
     * @notice Convert S-tokens to V-tokens. Max 200 S per month for citizens.
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
        require(msg.sender == founder,  "Colony: only founder");
        require(registry != address(0), "Colony: no registry");
        uint256 amount = pendingProtocolFee;
        require(amount > 0,             "Colony: nothing to settle");
        require(msg.value >= amount,    "Colony: insufficient ETH");

        pendingProtocolFee = 0;

        IColonyRegistry reg = IColonyRegistry(registry);
        (uint256 protocolAmt, uint256 founderAmt, address founderWallet) =
            reg.getFeeSplit(address(this), amount);

        address treasury = reg.protocolTreasury();

        // Send founder share (if any)
        if (founderAmt > 0 && founderWallet != address(0) && founderWallet != address(this)) {
            (bool fok,) = founderWallet.call{value: founderAmt}("");
            require(fok, "Colony: founder transfer failed");
            emit FounderSharePaid(address(this), founderAmt, founderWallet);
        } else {
            // No valid founder wallet — route everything to protocol
            protocolAmt = amount;
        }

        (bool ok,) = treasury.call{value: protocolAmt}("");
        require(ok, "Colony: transfer failed");

        if (msg.value > amount) {
            (bool r,) = msg.sender.call{value: msg.value - amount}("");
            require(r, "Colony: refund failed");
        }

        emit ProtocolFeeSettled(protocolAmt, treasury);
    }

    // ── Company wallet support ────────────────────────────────────────────────

    /**
     * @notice Register a company wallet so it can call Colony.send() and equity
     *         operations. Only CompanyFactory can call — triggered inside deployCompany().
     */
    function registerCompanyWallet(address wallet) external {
        require(msg.sender == companyFactory, "Colony: only factory");
        isCompanyWallet[wallet] = true;
        emit CompanyWalletRegistered(wallet);
    }

    /**
     * @notice Mint an O-token for a newly deployed company.
     *         Only CompanyFactory can call. Colony is the OToken owner (minter).
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
        require(isCompanyWallet[msg.sender],            "Colony: not a company wallet");
        require(sToken.balanceOf(msg.sender) >= amount, "Colony: insufficient S balance");
        sToken.burn(msg.sender, amount);
        vToken.mintCompany(msg.sender, amount);
        emit Saved(msg.sender, amount);
    }

    /**
     * @notice Transfer V-tokens from a company wallet to an equity holder (dividend).
     *         Called by CompanyImplementation.declareDividend() and redeemDirectorShares().
     */
    function transferVDividend(address to, uint256 amount) external {
        require(isCompanyWallet[msg.sender],             "Colony: not a company wallet");
        require(vToken.balanceOf(msg.sender) >= amount,  "Colony: insufficient V balance");
        vToken.colonyTransfer(msg.sender, to, amount);
        emit VDividendPaid(msg.sender, to, amount);
    }

    // ── A-token relay — equity ────────────────────────────────────────────────

    /**
     * @notice Issue equity for a company. Company wallet or CompanyFactory may call.
     *         All equity state is stored in AToken; no equity data is held in Colony.
     *
     * @param company        Company wallet address (must be registered)
     * @param holder         Shareholder wallet
     * @param stakeBps       Stake in basis points
     * @param vestingEpochs  Epoch at which each tranche unlocks (empty = immediate full vest)
     * @param trancheBps     Bps per tranche; must sum to stakeBps if non-empty
     */
    function issueEquity(
        address   company,
        address   holder,
        uint256   stakeBps,
        uint256[] calldata vestingEpochs,
        uint256[] calldata trancheBps
    ) external requireAToken returns (uint256 assetId, uint256 liabilityId) {
        require(
            isCompanyWallet[msg.sender] || msg.sender == companyFactory,
            "Colony: not a company wallet or factory"
        );
        require(isCompanyWallet[company], "Colony: company not registered");

        (assetId, liabilityId) = IAToken(aToken).issueEquity(
            company, holder, stakeBps, vestingEpochs, trancheBps
        );
        emit EquityIssued(company, holder, assetId, stakeBps);
    }

    /**
     * @notice Issue founding equity. Called by CompanyFactory only.
     *         Identical to issueEquity but validates only factory access,
     *         not company wallet access — the company may not be wired yet.
     */
    function issueFoundingEquity(
        address   company,
        address   holder,
        uint256   stakeBps,
        uint256[] calldata vestingEpochs,
        uint256[] calldata trancheBps
    ) external requireAToken returns (uint256 assetId, uint256 liabilityId) {
        require(msg.sender == companyFactory, "Colony: only factory");
        require(company != address(0),        "Colony: zero company");

        (assetId, liabilityId) = IAToken(aToken).issueEquity(
            company, holder, stakeBps, vestingEpochs, trancheBps
        );
        emit EquityIssued(company, holder, assetId, stakeBps);
    }

    /**
     * @notice Forfeit all unvested tranches for a participant.
     *         Called by CompanyImplementation.forfeitShares() on behalf of a company wallet.
     *         Vested shares remain with the holder permanently.
     *
     * @param assetId  The participant's EQUITY_ASSET token ID
     * @return forfeitedBps Basis points cancelled
     */
    function forfeitEquity(uint256 assetId) external requireAToken returns (uint256 forfeitedBps) {
        require(isCompanyWallet[msg.sender], "Colony: not a company wallet");
        forfeitedBps = IAToken(aToken).forfeitUnvested(assetId);
        emit EquityForfeited(assetId, forfeitedBps);
    }

    /**
     * @notice Cancel vested equity (company buyback).
     *         Called by CompanyImplementation.buybackShares() and redeemDirectorShares().
     *         Colony handles the S or V payment separately — this records the cancellation.
     *
     * @param assetId  The holder's EQUITY_ASSET token ID
     * @param bps      Vested basis points to cancel
     */
    function cancelEquity(uint256 assetId, uint256 bps) external requireAToken {
        require(isCompanyWallet[msg.sender], "Colony: not a company wallet");
        IAToken(aToken).cancelEquity(assetId, bps);
        emit EquityCancelled(assetId, bps);
    }

    /**
     * @notice Transfer vested equity to another wallet.
     *         Citizens call directly — only vested bps may be transferred.
     *         Colony validates the caller is the token holder before forwarding.
     *
     * @param assetId  Source EQUITY_ASSET token ID
     * @param to       Recipient wallet
     * @param bps      Vested basis points to transfer
     * @return newAssetId New fully-vested EQUITY_ASSET token for the recipient
     */
    function transferEquity(
        uint256 assetId,
        address to,
        uint256 bps
    ) external requireAToken onlyCitizen returns (uint256 newAssetId) {
        require(IAToken(aToken).getTokenHolder(assetId) == msg.sender, "Colony: not the token holder");
        newAssetId = IAToken(aToken).transferEquity(assetId, to, bps);
        emit EquityTransferred(assetId, newAssetId, msg.sender, to, bps);
    }

    /**
     * @notice Claim all available vested tranches for an equity token.
     *         Colony validates caller is the token holder.
     *
     * @param assetId  EQUITY_ASSET token ID
     * @return newlyVestedBps Basis points newly unlocked
     */
    function claimVestedTranches(uint256 assetId) external requireAToken onlyCitizen returns (uint256 newlyVestedBps) {
        require(IAToken(aToken).getTokenHolder(assetId) == msg.sender, "Colony: not the token holder");
        newlyVestedBps = IAToken(aToken).claimVestedTranches(assetId, sToken.currentEpoch());
        emit VestedTranchesClaimed(assetId, newlyVestedBps);
    }

    // ── A-token relay — physical assets ───────────────────────────────────────

    /**
     * @notice Register a physical asset or land parcel for the caller.
     *         Registration threshold: value > 500 S, weight > 50 kg, or autonomous AI.
     *
     * @param valueSTokens    Declared value in S-token equivalent (18 dec)
     * @param weightKg        Weight in kg; 0 if not applicable
     * @param hasAI           True if asset has autonomous AI capability
     * @param depreciationBps Per-epoch linear depreciation rate in bps; 0 = none
     * @return id  New unilateral A-token ID
     */
    function registerAsset(
        uint256 valueSTokens,
        uint256 weightKg,
        bool    hasAI,
        uint256 depreciationBps
    ) external requireAToken onlyCitizenOrCompany returns (uint256 id) {
        id = IAToken(aToken).registerAsset(
            msg.sender, valueSTokens, weightKg, hasAI, depreciationBps, sToken.currentEpoch()
        );
        emit AssetRegistered(id, msg.sender, valueSTokens);
    }

    /**
     * @notice Transfer a unilateral asset token to a new holder.
     *         Caller must be the current holder. Tokens in escrow cannot be transferred.
     *
     * @param id        Asset token ID
     * @param to        New holder
     * @param newValueS Agreed transfer price (becomes the new declared value)
     */
    function transferAsset(uint256 id, address to, uint256 newValueS) external requireAToken onlyCitizenOrCompany {
        require(IAToken(aToken).getTokenHolder(id) == msg.sender, "Colony: not the asset owner");
        IAToken(aToken).transferAsset(id, to, newValueS);
        emit AssetTransferred(id, msg.sender, to, newValueS);
    }

    // ── A-token relay — obligations ───────────────────────────────────────────

    /**
     * @notice Create a bilateral fixed-obligation pair.
     *         The caller must be either the creditor or the obligor.
     *
     *         For citizen obligors (unsecured): UBI cap is enforced — existing
     *         unsecured obligations + this obligation must not exceed 1000 S/month.
     *         For company obligors or secured obligations: no UBI cap applies.
     *
     * @param creditor        Holds the OBLIGATION_ASSET — receives payments
     * @param obligor         Holds the OBLIGATION_LIABILITY — makes payments
     * @param monthlyAmountS  S-tokens per epoch (18 dec)
     * @param totalEpochs     Number of payment periods
     * @param collateralId    0 = unsecured; asset A-token ID = secured
     */
    function issueObligation(
        address creditor,
        address obligor,
        uint256 monthlyAmountS,
        uint256 totalEpochs,
        uint256 collateralId
    ) external requireAToken onlyCitizenOrCompany returns (uint256 assetId, uint256 liabilityId) {
        require(
            msg.sender == creditor || msg.sender == obligor,
            "Colony: caller must be creditor or obligor"
        );
        // UBI cap: 1000 S/month for citizen obligors (unsecured only; AToken enforces)
        uint256 maxMonthlyS = (isCitizen[obligor] && collateralId == 0) ? 1000 * 1e18 : 0;
        (assetId, liabilityId) = IAToken(aToken).issueObligation(
            creditor, obligor, monthlyAmountS, totalEpochs, collateralId, maxMonthlyS
        );
        emit ObligationCreated(assetId, liabilityId, creditor, obligor);
    }

    // ── Governance ────────────────────────────────────────────────────────────

    /**
     * @notice Trigger MCC board term-end equity redemption for an ex-director.
     *         Colony (as governance authority) calls CompanyImplementation.redeemDirectorShares().
     *         The company contract holds onlyColony — only this function may trigger it.
     *
     * @param companyWallet  The company (typically the MCC) performing the redemption
     * @param exDirector     The departing director's wallet
     */
    function redeemDirectorShares(address companyWallet, address exDirector) external {
        require(msg.sender == founder,           "Colony: only founder");
        require(isCompanyWallet[companyWallet],  "Colony: not a registered company");
        ICompanyImpl(companyWallet).redeemDirectorShares(exDirector);
    }

    // ── Epoch management ──────────────────────────────────────────────────────

    /**
     * @notice Advance epoch (monthly reset). Founder only.
     *
     * Obligation settlement runs before the epoch advances. Active obligation
     * liability tokens are iterated and payments are attempted:
     *
     *   — If obligor has sufficient S: transfer to creditor; mark epoch paid.
     *   — If obligor lacks S AND obligation is secured: transfer escrowed
     *     collateral to creditor; mark defaulted.
     *   — If obligor lacks S AND obligation is unsecured: epoch missed
     *     (no action — arrears tracking is deferred to Phase 2).
     *
     * UBI is not auto-distributed here. Citizens call claimUbi() at their
     * own pace after epoch advances.
     */
    function advanceEpoch() external {
        require(msg.sender == founder, "Colony: only founder");

        // ── 1. Settle all active obligation A-tokens ─────────────────────────
        if (aToken != address(0)) {
            // Memory copy — safe to iterate while AToken storage is modified
            uint256[] memory obligationIds = IAToken(aToken).activeObligationIds();

            for (uint256 i = 0; i < obligationIds.length; i++) {
                uint256 liabilityId = obligationIds[i];

                (
                    address obligor,
                    address creditor,
                    uint256 monthlyAmountS,
                    ,   // totalEpochs
                    ,   // epochsPaid
                    uint256 collateralId,
                    bool defaulted
                ) = IAToken(aToken).getObligation(liabilityId);

                if (defaulted) continue;

                if (sToken.balanceOf(obligor) >= monthlyAmountS) {
                    // Normal settlement: transfer S, mark epoch paid
                    sToken.colonyTransfer(obligor, creditor, monthlyAmountS);
                    IAToken(aToken).markObligationPaid(liabilityId);
                    emit ObligationSettled(liabilityId, obligor, creditor, monthlyAmountS);
                } else if (collateralId > 0) {
                    // Secured + insufficient S: seize collateral
                    IAToken(aToken).markObligationDefaulted(liabilityId, creditor);
                    emit ObligationDefaulted(liabilityId, obligor);
                }
                // Unsecured + insufficient S: missed payment — no action (Phase 2)
            }
        }

        // ── 2. Advance epoch ─────────────────────────────────────────────────
        sToken.advanceEpoch();
        vToken.advanceEpoch();
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    /// @notice Current colony epoch (delegated to SToken).
    function currentEpoch() external view returns (uint256) {
        return sToken.currentEpoch();
    }

    /// @notice Returns citizen count.
    function citizenCount() external view returns (uint256) {
        return citizens.length;
    }

    receive() external payable {}
}
