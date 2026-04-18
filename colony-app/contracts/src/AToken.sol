// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title AToken
 * @notice Fisc economic claims registry.
 *
 * Every significant ownership right and financial obligation in the colony
 * is recorded here as an A-token. Colony is the sole caller for all
 * state-changing functions — citizens and companies reach AToken only
 * through Colony.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Form 1 — UNILATERAL                                                │
 * │  A physical asset or land parcel owned outright. One token, one     │
 * │  holder, no counterparty. Value = last transfer price. Optional     │
 * │  monthly depreciation schedule.                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  Form 2 — EQUITY pair                                               │
 * │  Company share. Fisc creates two tokens simultaneously:             │
 * │    EQUITY_ASSET  — held by shareholder, records stake in bps        │
 * │    EQUITY_LIABILITY — held by company, records distribution ob.     │
 * │  Vesting schedule: 1–N monthly tranches. Unvested shares receive    │
 * │  dividends but cannot be transferred. Vested shares are permanent   │
 * │  and freely transferable.                                           │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  Form 3 — OBLIGATION pair                                           │
 * │  Bilateral fixed-payment agreement. Fisc creates two tokens:        │
 * │    OBLIGATION_ASSET    — creditor's payment entitlement             │
 * │    OBLIGATION_LIABILITY — obligor's payment schedule                │
 * │  Colony settles at each epoch advance, before UBI issuance.         │
 * │  Secured: obligor pledges an asset A-token to Fisc escrow;          │
 * │    transferred to creditor on default.                              │
 * │  Unsecured: UBI cap enforced at creation for citizen obligors.      │
 * └─────────────────────────────────────────────────────────────────────┘
 */
contract AToken {

    // ── Types ─────────────────────────────────────────────────────────────────

    enum Form {
        UNILATERAL,            // 0  physical asset / land parcel
        EQUITY_ASSET,          // 1  shareholder's stake token
        EQUITY_LIABILITY,      // 2  company's aggregate distribution obligation
        OBLIGATION_ASSET,      // 3  creditor's payment entitlement
        OBLIGATION_LIABILITY   // 4  obligor's payment schedule
    }

    struct Token {
        Form    form;
        address holder;
        address counterparty;   // address(0) for UNILATERAL and EQUITY_LIABILITY
        uint256 linkedId;       // paired token ID (Form 2/3); 0 otherwise
        bool    active;
    }

    struct AssetData {
        uint256 valueSTokens;       // declared / last-transfer price (18 dec)
        uint256 weightKg;
        bool    hasAutonomousAI;
        uint256 depreciationBps;    // per-epoch linear depreciation; 0 = none
        uint256 registrationEpoch;
    }

    struct VestingData {
        uint256   totalStakeBps;    // original issued stake
        uint256   vestedBps;        // cumulative unlocked bps
        address   company;          // company wallet address
        uint256[] vestingEpochs;    // epoch at which each tranche unlocks
        uint256[] trancheBps;       // bps per tranche; must sum to totalStakeBps
        uint256   nextTranche;      // index of next tranche to check
    }

    struct ObligationData {
        uint256 monthlyAmountS;     // S-tokens due per epoch (18 dec)
        uint256 totalEpochs;
        uint256 epochsPaid;
        uint256 collateralId;       // 0 = unsecured
        bool    defaulted;
    }

    // ── State ─────────────────────────────────────────────────────────────────

    address public colony;
    uint256 public nextId;

    mapping(uint256 => Token)          public tokens;
    mapping(uint256 => AssetData)      public assetData;
    mapping(uint256 => VestingData)    public vestingData;    // EQUITY_ASSET only
    mapping(uint256 => ObligationData) public obligationData; // OBLIGATION_LIABILITY only

    // Holder index: address → active token IDs
    mapping(address => uint256[])                        private _held;
    mapping(address => mapping(uint256 => uint256))      private _heldIdx;

    // Company equity index: company wallet → all EQUITY_ASSET IDs issued for it.
    // Includes forfeited/cancelled (checked via tokens[id].active in reads).
    mapping(address => uint256[])                        private _companyEquity;
    mapping(address => mapping(uint256 => bool))         private _inCompanyEquity;

    // Active obligation liability IDs — iterated by Colony at epoch settlement.
    uint256[]                          private _activeObligations;
    mapping(uint256 => uint256)        private _activeObligIdx; // id → index in array

    // Escrow: collateral assetId → obligation liability ID (0 if free)
    mapping(uint256 => uint256) public escrowedFor;    // collateralId → liabilityId
    mapping(uint256 => uint256) public collateralFor;  // liabilityId → collateralId

    // ── Events ────────────────────────────────────────────────────────────────

    event AssetRegistered(uint256 indexed id, address indexed holder, uint256 valueSTokens);
    event AssetTransferred(uint256 indexed id, address indexed from, address indexed to, uint256 newValue);

    event EquityIssued(
        uint256 indexed assetId,
        uint256 indexed liabilityId,
        address indexed company,
        address         holder,
        uint256         stakeBps,
        bool            hasVesting
    );
    event TrancheClaimed(uint256 indexed assetId, uint256 trancheIndex, uint256 bps);
    event UnvestedForfeited(uint256 indexed assetId, address indexed holder, uint256 bps);
    event EquityTransferred(
        uint256 indexed fromAssetId,
        uint256 indexed toAssetId,
        address indexed from,
        address         to,
        uint256         bps
    );
    event EquityCancelled(uint256 indexed assetId, uint256 bps);

    event ObligationIssued(
        uint256 indexed assetId,
        uint256 indexed liabilityId,
        address         creditor,
        address         obligor,
        uint256         monthlyAmountS,
        uint256         totalEpochs,
        bool            secured
    );
    event ObligationEpochSettled(uint256 indexed liabilityId, uint256 epochNumber, uint256 amountS);
    event ObligationCompleted(uint256 indexed liabilityId);
    event ObligationDefaulted(uint256 indexed liabilityId, uint256 collateralId, address creditor);

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address _colony) {
        require(_colony != address(0), "AToken: zero colony");
        colony = _colony;
    }

    // ── Access control ────────────────────────────────────────────────────────

    modifier onlyColony() {
        require(msg.sender == colony, "AToken: only Colony");
        _;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Form 1 — Unilateral asset
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Register a physical asset or land parcel on-chain.
     *         Registration threshold: value > 500 S, weight > 50 kg, or autonomous AI.
     *         Colony calls on behalf of citizen or company.
     *
     * @param holder           Owner wallet
     * @param valueSTokens     Declared value in S-token equivalent (18 dec)
     * @param weightKg         Weight in kg; 0 if not applicable
     * @param hasAI            True if asset has autonomous AI capability
     * @param depreciationBps  Per-epoch linear depreciation rate in bps; 0 = none
     * @param currentEpoch     Current colony epoch (from SToken.currentEpoch)
     */
    function registerAsset(
        address holder,
        uint256 valueSTokens,
        uint256 weightKg,
        bool    hasAI,
        uint256 depreciationBps,
        uint256 currentEpoch
    ) external onlyColony returns (uint256 id) {
        require(holder != address(0),                                  "AToken: zero holder");
        require(valueSTokens > 500 * 1e18 || weightKg > 50 || hasAI, "AToken: below registration threshold");

        id = _mint(Form.UNILATERAL, holder, address(0), 0);
        assetData[id] = AssetData({
            valueSTokens:      valueSTokens,
            weightKg:          weightKg,
            hasAutonomousAI:   hasAI,
            depreciationBps:   depreciationBps,
            registrationEpoch: currentEpoch
        });
        emit AssetRegistered(id, holder, valueSTokens);
    }

    /**
     * @notice Transfer a unilateral asset token to a new holder.
     *         Colony calls on behalf of the current holder.
     *         Tokens in escrow cannot be transferred.
     *
     * @param id           Asset token ID
     * @param to           New holder
     * @param newValueS    Agreed transfer price — becomes the new declared value
     */
    function transferAsset(uint256 id, address to, uint256 newValueS) external onlyColony {
        Token storage t = tokens[id];
        require(t.active,                  "AToken: inactive");
        require(t.form == Form.UNILATERAL, "AToken: not an asset token");
        require(escrowedFor[id] == 0,      "AToken: token is in escrow");
        require(to != address(0),          "AToken: zero recipient");

        address from = t.holder;
        _transfer(id, from, to);
        assetData[id].valueSTokens = newValueS;
        emit AssetTransferred(id, from, to, newValueS);
    }

    /**
     * @notice Current declared value of a unilateral asset, with linear
     *         depreciation applied (per-epoch, approximate).
     */
    function currentAssetValue(uint256 id, uint256 currentEpoch) external view returns (uint256) {
        Token storage t = tokens[id];
        require(t.form == Form.UNILATERAL, "AToken: not an asset token");
        AssetData storage a = assetData[id];
        if (a.depreciationBps == 0 || currentEpoch <= a.registrationEpoch) {
            return a.valueSTokens;
        }
        uint256 epochsElapsed = currentEpoch - a.registrationEpoch;
        uint256 totalDepBps   = epochsElapsed * a.depreciationBps;
        if (totalDepBps >= 10000) return 0;
        return a.valueSTokens * (10000 - totalDepBps) / 10000;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Form 2 — Paired equity
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Issue an equity pair for a company.
     *         Creates an EQUITY_ASSET token for the shareholder.
     *         The company's EQUITY_LIABILITY token is created on first issuance
     *         and reused for all subsequent share issuances.
     *
     * @param company       Company wallet address
     * @param holder        Shareholder wallet
     * @param stakeBps      Total stake in basis points
     * @param vestingEpochs Epoch index when each tranche vests (empty = immediate full vest)
     * @param trancheBps    Basis points per tranche; must sum to stakeBps if set
     */
    function issueEquity(
        address   company,
        address   holder,
        uint256   stakeBps,
        uint256[] calldata vestingEpochs,
        uint256[] calldata trancheBps
    ) external onlyColony returns (uint256 assetId, uint256 liabilityId) {
        require(company != address(0),                          "AToken: zero company");
        require(holder  != address(0),                          "AToken: zero holder");
        require(stakeBps > 0,                                   "AToken: zero stake");
        require(vestingEpochs.length == trancheBps.length,      "AToken: schedule length mismatch");

        if (vestingEpochs.length > 0) {
            uint256 sum = 0;
            for (uint256 i = 0; i < trancheBps.length; i++) sum += trancheBps[i];
            require(sum == stakeBps, "AToken: tranche bps must sum to stakeBps");
        }

        liabilityId = _findOrCreateEquityLiability(company);
        assetId     = _mint(Form.EQUITY_ASSET, holder, company, liabilityId);

        bool hasVesting = vestingEpochs.length > 0;
        vestingData[assetId] = VestingData({
            totalStakeBps: stakeBps,
            vestedBps:     hasVesting ? 0 : stakeBps,
            company:       company,
            vestingEpochs: vestingEpochs,
            trancheBps:    trancheBps,
            nextTranche:   0
        });

        _indexCompanyEquity(company, assetId);
        emit EquityIssued(assetId, liabilityId, company, holder, stakeBps, hasVesting);
    }

    /**
     * @notice Claim all available vested tranches for an equity token.
     *         Colony calls on behalf of the token holder.
     *
     * @param assetId      EQUITY_ASSET token ID
     * @param currentEpoch Current colony epoch (from SToken.currentEpoch)
     * @return newlyVestedBps Basis points newly unlocked in this call
     */
    function claimVestedTranches(
        uint256 assetId,
        uint256 currentEpoch
    ) external onlyColony returns (uint256 newlyVestedBps) {
        Token storage t = tokens[assetId];
        require(t.active,                    "AToken: inactive");
        require(t.form == Form.EQUITY_ASSET, "AToken: not an equity asset token");

        VestingData storage v = vestingData[assetId];
        while (
            v.nextTranche < v.vestingEpochs.length &&
            v.vestingEpochs[v.nextTranche] <= currentEpoch
        ) {
            uint256 bps = v.trancheBps[v.nextTranche];
            v.vestedBps    += bps;
            newlyVestedBps += bps;
            emit TrancheClaimed(assetId, v.nextTranche, bps);
            v.nextTranche++;
        }
    }

    /**
     * @notice Forfeit all unvested tranches for a participant's equity token.
     *         Colony calls on behalf of the company secretary when a participant leaves.
     *         Vested shares are unaffected and remain with the holder.
     *
     * @param assetId  EQUITY_ASSET token ID
     * @return forfeitedBps Basis points cancelled — available for reallocation
     */
    function forfeitUnvested(uint256 assetId) external onlyColony returns (uint256 forfeitedBps) {
        Token storage t = tokens[assetId];
        require(t.active,                    "AToken: inactive");
        require(t.form == Form.EQUITY_ASSET, "AToken: not an equity asset token");

        VestingData storage v = vestingData[assetId];
        forfeitedBps = v.totalStakeBps - v.vestedBps;
        if (forfeitedBps == 0) return 0;

        // Shrink to vested amount only; clear remaining schedule
        v.totalStakeBps = v.vestedBps;
        delete v.vestingEpochs;
        delete v.trancheBps;
        v.nextTranche = type(uint256).max; // sentinel: no further tranches

        if (v.totalStakeBps == 0) _deactivate(assetId);

        emit UnvestedForfeited(assetId, t.holder, forfeitedBps);
    }

    /**
     * @notice Transfer a portion of vested equity to another wallet.
     *         Only vested basis points may be transferred. Unvested shares
     *         cannot be transferred — only forfeited.
     *         Colony calls on behalf of the holder.
     *
     * @param assetId  Source EQUITY_ASSET token ID
     * @param to       Recipient wallet
     * @param bps      Basis points to transfer (must be ≤ vestedBps)
     * @return newAssetId  New fully-vested EQUITY_ASSET token for the recipient
     */
    function transferEquity(
        uint256 assetId,
        address to,
        uint256 bps
    ) external onlyColony returns (uint256 newAssetId) {
        Token storage t = tokens[assetId];
        require(t.active,                    "AToken: inactive");
        require(t.form == Form.EQUITY_ASSET, "AToken: not an equity asset token");
        require(to != address(0),            "AToken: zero recipient");
        require(to != t.holder,              "AToken: self-transfer");

        VestingData storage v = vestingData[assetId];
        require(bps > 0 && bps <= v.vestedBps, "AToken: insufficient vested stake");

        address company     = v.company;
        uint256 liabilityId = t.linkedId;

        // Reduce source token
        v.vestedBps     -= bps;
        v.totalStakeBps -= bps;
        if (v.totalStakeBps == 0) _deactivate(assetId);

        // Issue a new fully-vested token for the recipient (no vesting schedule)
        newAssetId = _mint(Form.EQUITY_ASSET, to, company, liabilityId);
        vestingData[newAssetId] = VestingData({
            totalStakeBps: bps,
            vestedBps:     bps,
            company:       company,
            vestingEpochs: new uint256[](0),
            trancheBps:    new uint256[](0),
            nextTranche:   0
        });
        _indexCompanyEquity(company, newAssetId);

        emit EquityTransferred(assetId, newAssetId, t.holder, to, bps);
    }

    /**
     * @notice Cancel vested equity (company buyback).
     *         Colony handles the S-token payment to the holder separately.
     *         Reducing total equity outstanding increases NAV for remaining holders.
     *
     * @param assetId  EQUITY_ASSET token ID
     * @param bps      Vested basis points to cancel
     */
    function cancelEquity(uint256 assetId, uint256 bps) external onlyColony {
        Token storage t = tokens[assetId];
        require(t.active,                    "AToken: inactive");
        require(t.form == Form.EQUITY_ASSET, "AToken: not an equity asset token");

        VestingData storage v = vestingData[assetId];
        require(bps > 0 && bps <= v.vestedBps, "AToken: insufficient vested stake");

        v.vestedBps     -= bps;
        v.totalStakeBps -= bps;
        if (v.totalStakeBps == 0) _deactivate(assetId);

        emit EquityCancelled(assetId, bps);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Form 3 — Paired fixed-obligation
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Issue a fixed-obligation pair. Fisc creates both tokens simultaneously.
     *
     * Unsecured (collateralId == 0):
     *   For citizen obligors, enforces UBI cap: existing unsecured obligations +
     *   this new obligation must not exceed maxMonthlyS. Pass maxMonthlyS = 0
     *   to skip the cap (for companies, which have no UBI).
     *
     * Secured (collateralId > 0):
     *   Obligor must own the collateral asset token and it must not be in escrow.
     *   On default, Colony calls markObligationDefaulted() which transfers the
     *   collateral to the creditor. No UBI cap applies.
     *
     * @param creditor        Receives payments — holds OBLIGATION_ASSET
     * @param obligor         Makes payments — holds OBLIGATION_LIABILITY
     * @param monthlyAmountS  S-tokens per epoch (18 dec)
     * @param totalEpochs     Number of payment periods
     * @param collateralId    0 = unsecured; assetId = secured
     * @param maxMonthlyS     Obligor's monthly UBI cap (0 = no cap)
     */
    function issueObligation(
        address creditor,
        address obligor,
        uint256 monthlyAmountS,
        uint256 totalEpochs,
        uint256 collateralId,
        uint256 maxMonthlyS
    ) external onlyColony returns (uint256 assetId, uint256 liabilityId) {
        require(creditor != address(0),  "AToken: zero creditor");
        require(obligor  != address(0),  "AToken: zero obligor");
        require(monthlyAmountS > 0,      "AToken: zero payment amount");
        require(totalEpochs > 0,         "AToken: zero epochs");

        // UBI cap for unsecured obligations on citizen obligors
        if (collateralId == 0 && maxMonthlyS > 0) {
            uint256 current = totalMonthlyUnsecuredObligations(obligor);
            require(
                current + monthlyAmountS <= maxMonthlyS,
                "AToken: obligation would exceed UBI cap"
            );
        }

        // Validate and escrow collateral for secured obligations
        if (collateralId > 0) {
            Token storage col = tokens[collateralId];
            require(col.active,                    "AToken: collateral token is inactive");
            require(col.form == Form.UNILATERAL,   "AToken: collateral must be a unilateral asset");
            require(col.holder == obligor,         "AToken: obligor must own the collateral");
            require(escrowedFor[collateralId] == 0, "AToken: collateral already in escrow");
        }

        // Mint the paired tokens
        liabilityId = _mint(Form.OBLIGATION_LIABILITY, obligor,  creditor, 0);
        assetId     = _mint(Form.OBLIGATION_ASSET,     creditor, obligor,  liabilityId);
        tokens[liabilityId].linkedId = assetId;

        obligationData[liabilityId] = ObligationData({
            monthlyAmountS: monthlyAmountS,
            totalEpochs:    totalEpochs,
            epochsPaid:     0,
            collateralId:   collateralId,
            defaulted:      false
        });

        // Lock collateral into escrow
        if (collateralId > 0) {
            escrowedFor[collateralId]  = liabilityId;
            collateralFor[liabilityId] = collateralId;
        }

        // Register for epoch settlement iteration
        _activeObligIdx[liabilityId] = _activeObligations.length;
        _activeObligations.push(liabilityId);

        emit ObligationIssued(
            assetId, liabilityId, creditor, obligor,
            monthlyAmountS, totalEpochs, collateralId > 0
        );
    }

    /**
     * @notice Mark one epoch of an obligation as paid.
     *         Colony calls this after performing the S-token transfer.
     *         Returns true if the obligation is now fully completed.
     */
    function markObligationPaid(
        uint256 liabilityId
    ) external onlyColony returns (bool completed) {
        Token storage t = tokens[liabilityId];
        require(t.active,                              "AToken: inactive");
        require(t.form == Form.OBLIGATION_LIABILITY,   "AToken: not an obligation liability");

        ObligationData storage ob = obligationData[liabilityId];
        require(!ob.defaulted,                         "AToken: obligation already defaulted");
        require(ob.epochsPaid < ob.totalEpochs,        "AToken: obligation already completed");

        ob.epochsPaid++;
        emit ObligationEpochSettled(liabilityId, ob.epochsPaid, ob.monthlyAmountS);

        if (ob.epochsPaid == ob.totalEpochs) {
            _releaseCollateral(liabilityId);
            uint256 assetId = t.linkedId;
            _deactivate(liabilityId);
            _deactivate(assetId);
            _removeActiveObligation(liabilityId);
            emit ObligationCompleted(liabilityId);
            return true;
        }
        return false;
    }

    /**
     * @notice Mark a secured obligation as defaulted.
     *         Colony calls when the obligor has insufficient S-tokens.
     *         Transfers the escrowed collateral asset token to the creditor.
     *         Only valid for secured obligations (collateralId > 0).
     */
    function markObligationDefaulted(
        uint256 liabilityId,
        address creditor
    ) external onlyColony {
        Token storage t = tokens[liabilityId];
        require(t.active,                            "AToken: inactive");
        require(t.form == Form.OBLIGATION_LIABILITY, "AToken: not an obligation liability");

        ObligationData storage ob = obligationData[liabilityId];
        require(!ob.defaulted,     "AToken: already defaulted");
        require(ob.collateralId > 0, "AToken: unsecured - no collateral to seize");

        ob.defaulted = true;
        uint256 colId = ob.collateralId;

        // Transfer collateral from obligor to creditor
        _transfer(colId, tokens[colId].holder, creditor);
        escrowedFor[colId]     = 0;
        collateralFor[liabilityId] = 0;

        uint256 assetId = t.linkedId;
        _deactivate(liabilityId);
        _deactivate(assetId);
        _removeActiveObligation(liabilityId);

        emit ObligationDefaulted(liabilityId, colId, creditor);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Views
    // ══════════════════════════════════════════════════════════════════════════

    /// @notice All active token IDs held by an address.
    function tokensOf(address holder) external view returns (uint256[] memory) {
        return _held[holder];
    }

    /**
     * @notice Full equity table for a company — all current holders with total
     *         and vested stake in basis points. Includes unvested shares.
     *         Used by CompanyImplementation.declareDividend() and equity views.
     */
    function getEquityTable(address company) external view returns (
        address[] memory holders,
        uint256[] memory totalStakeBps,
        uint256[] memory vestedStakeBps
    ) {
        uint256[] storage ids = _companyEquity[company];

        // Count active equity tokens
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (tokens[ids[i]].active) count++;
        }

        holders        = new address[](count);
        totalStakeBps  = new uint256[](count);
        vestedStakeBps = new uint256[](count);

        uint256 j = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            if (!tokens[id].active) continue;
            holders[j]        = tokens[id].holder;
            totalStakeBps[j]  = vestingData[id].totalStakeBps;
            vestedStakeBps[j] = vestingData[id].vestedBps;
            j++;
        }
    }

    /**
     * @notice All active obligation liability IDs.
     *         Colony reads this at epoch advance to iterate settlements.
     *         Returns a memory copy — safe to use while Colony modifies AToken state.
     */
    function activeObligationIds() external view returns (uint256[] memory) {
        return _activeObligations;
    }

    /**
     * @notice Full data for one obligation liability token.
     *         Used by Colony during epoch settlement.
     */
    function getObligation(uint256 liabilityId) external view returns (
        address obligor,
        address creditor,
        uint256 monthlyAmountS,
        uint256 totalEpochs,
        uint256 epochsPaid,
        uint256 collateralId,
        bool    defaulted
    ) {
        Token storage t = tokens[liabilityId];
        require(t.form == Form.OBLIGATION_LIABILITY, "AToken: not an obligation liability");
        ObligationData storage ob = obligationData[liabilityId];
        return (
            t.holder,            // obligor
            t.counterparty,      // creditor
            ob.monthlyAmountS,
            ob.totalEpochs,
            ob.epochsPaid,
            ob.collateralId,
            ob.defaulted
        );
    }

    /// @notice Returns the current holder of any token. Returns address(0) for inactive tokens.
    function getTokenHolder(uint256 id) external view returns (address) {
        return tokens[id].holder;
    }

    /**
     * @notice Vesting stake data for an EQUITY_ASSET token.
     *         Returns zeros for non-equity token IDs (company will be address(0)).
     *         Used by CompanyImplementation for dividend distribution, buybacks,
     *         and director-share redemption.
     */
    function getVestingStake(uint256 assetId) external view returns (
        uint256 totalStakeBps,
        uint256 vestedBps,
        address company
    ) {
        VestingData storage v = vestingData[assetId];
        return (v.totalStakeBps, v.vestedBps, v.company);
    }

    /**
     * @notice Total monthly unsecured S-token obligations for an address.
     *         Used at obligation creation to enforce the UBI cap for citizens.
     */
    function totalMonthlyUnsecuredObligations(address obligor) public view returns (uint256 total) {
        uint256[] storage ids = _held[obligor];
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            Token storage t = tokens[id];
            if (!t.active || t.form != Form.OBLIGATION_LIABILITY) continue;
            ObligationData storage ob = obligationData[id];
            if (ob.collateralId == 0 && !ob.defaulted && ob.epochsPaid < ob.totalEpochs) {
                total += ob.monthlyAmountS;
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Internal helpers
    // ══════════════════════════════════════════════════════════════════════════

    function _mint(
        Form    form,
        address holder,
        address counterparty,
        uint256 linkedId
    ) internal returns (uint256 id) {
        id = nextId++;
        tokens[id] = Token({
            form:         form,
            holder:       holder,
            counterparty: counterparty,
            linkedId:     linkedId,
            active:       true
        });
        _addToHeld(holder, id);
    }

    function _transfer(uint256 id, address from, address to) internal {
        _removeFromHeld(from, id);
        tokens[id].holder = to;
        _addToHeld(to, id);
    }

    function _deactivate(uint256 id) internal {
        if (!tokens[id].active) return;
        address holder = tokens[id].holder;
        tokens[id].active = false;
        _removeFromHeld(holder, id);
    }

    function _findOrCreateEquityLiability(address company) internal returns (uint256) {
        // Search for an existing EQUITY_LIABILITY token held by the company
        uint256[] storage ids = _held[company];
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            if (tokens[id].form == Form.EQUITY_LIABILITY && tokens[id].active) {
                return id;
            }
        }
        // First equity issuance for this company — create the liability token
        return _mint(Form.EQUITY_LIABILITY, company, address(0), 0);
    }

    function _indexCompanyEquity(address company, uint256 assetId) internal {
        if (!_inCompanyEquity[company][assetId]) {
            _inCompanyEquity[company][assetId] = true;
            _companyEquity[company].push(assetId);
        }
    }

    function _releaseCollateral(uint256 liabilityId) internal {
        uint256 colId = collateralFor[liabilityId];
        if (colId > 0) {
            escrowedFor[colId]     = 0;
            collateralFor[liabilityId] = 0;
        }
    }

    function _removeActiveObligation(uint256 liabilityId) internal {
        uint256 idx  = _activeObligIdx[liabilityId];
        uint256 last = _activeObligations.length - 1;
        if (idx != last) {
            uint256 lastId = _activeObligations[last];
            _activeObligations[idx] = lastId;
            _activeObligIdx[lastId] = idx;
        }
        _activeObligations.pop();
        delete _activeObligIdx[liabilityId];
    }

    function _addToHeld(address addr, uint256 id) internal {
        _heldIdx[addr][id] = _held[addr].length;
        _held[addr].push(id);
    }

    function _removeFromHeld(address addr, uint256 id) internal {
        uint256 idx  = _heldIdx[addr][id];
        uint256 last = _held[addr].length - 1;
        if (idx != last) {
            uint256 lastId = _held[addr][last];
            _held[addr][idx]     = lastId;
            _heldIdx[addr][lastId] = idx;
        }
        _held[addr].pop();
        delete _heldIdx[addr][id];
    }
}
