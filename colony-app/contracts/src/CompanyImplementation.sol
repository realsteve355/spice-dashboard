// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title CompanyImplementation
 * @notice v2 — Template for SPICE colony organisations (companies, MCC, cooperatives, civic).
 *
 * Each organisation is deployed as a BeaconProxy pointing to this template.
 * The beacon owner can upgrade all organisations simultaneously with one tx.
 *
 * Equity is managed entirely via AToken.sol (the Fisc economic claims registry).
 * This contract holds NO equity state — it reads and mutates equity exclusively
 * through Colony, which relays all calls to AToken.
 *
 * Three named roles (plain addresses — not tokens):
 *   Secretary  — mandatory; day-to-day operations; may issue shares and declare dividends
 *   CEO        — optional
 *   FD         — optional; may also declare dividends
 *
 * The O-token for this organisation is held by the organisation contract address
 * itself (not the secretary). It is a soulbound identity badge.
 * Secretary authority is proved by msg.sender == secretary.
 *
 * Equity issuance (Secretary):
 *   issueVestingShares(holder, stakeBps, vestingEpochs, trancheBps)
 *     — participant shares; unvested tranches forfeited on departure
 *   issueOpenShares(investor, stakeBps)
 *     — investor shares; immediately fully vested, freely transferable
 *
 * Equity lifecycle (Secretary):
 *   declareDividend(vAmount)     — distribute V pro-rata to ALL holders (vested + unvested)
 *   forfeitShares(assetId)       — cancel unvested tranches for a departing participant
 *   buybackShares(assetId, bps, priceS) — buy back equity at agreed S-token price
 *
 * Governance (Colony only):
 *   redeemDirectorShares(exDirector) — redeem ALL equity at NAV on term end (MCC use)
 *
 * Share transfers are executed by citizens calling Colony.transferEquity() directly.
 * No two-party proposal flow is required (proposal mechanism removed in v2).
 *
 * No-wages principle: companies do not pay ongoing S-token wages. Compensation for
 * participants = equity dividends only. Sole traders transact separately.
 */

interface IColony {
    function send(address to, uint256 amount, string calldata note) external;
    function saveToVCompany(uint256 amount) external;
    function transferVDividend(address to, uint256 amount) external;
    function sToken() external view returns (address);
    function vToken() external view returns (address);
    function aToken() external view returns (address);
    function issueEquity(
        address company,
        address holder,
        uint256 stakeBps,
        uint256[] calldata vestingEpochs,
        uint256[] calldata trancheBps
    ) external returns (uint256 assetId, uint256 liabilityId);
    function forfeitEquity(uint256 assetId) external returns (uint256 forfeitedBps);
    function cancelEquity(uint256 assetId, uint256 bps) external;
    function registerAsset(
        string calldata label,
        uint256 valueSTokens,
        uint256 weightKg,
        bool    hasAI,
        uint256 depreciationBps
    ) external returns (uint256 id);
    function transferAsset(uint256 id, address to, uint256 newValueS) external;
    function claimLand(string calldata label, uint256 declaredValueV) external returns (uint256 id);
    function updateLandValue(uint256 id, uint256 newDeclaredValueV) external;
    function payLandStewardship(uint256 id) external;
    function forcePurchaseLand(uint256 id, uint256 newDeclaredValueV) external;
}

interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
}

interface IAToken {
    function getEquityTable(address company) external view returns (
        address[] memory holders,
        uint256[] memory totalStakeBps,
        uint256[] memory vestedStakeBps
    );
    function tokensOf(address holder) external view returns (uint256[] memory);
    function getTokenHolder(uint256 id) external view returns (address);
    function getVestingStake(uint256 assetId) external view returns (
        uint256 totalStakeBps,
        uint256 vestedBps,
        address company
    );
}

contract CompanyImplementation is Initializable {

    // ── State ────────────────────────────────────────────────────────────────

    address public colony;
    string  public name;

    address public secretary;
    address public ceo;
    address public fd;

    /// @notice M-24/M-25/M-26: external authority (typically Governance) trusted to
    ///         issue and redeem office-term equity. Set once via setTrustedIssuer.
    address public trustedIssuer;

    // ── Events ───────────────────────────────────────────────────────────────

    event PaymentMade(address indexed to, uint256 amount, string note);
    event ConvertedToV(uint256 amount);
    event DividendDeclared(uint256 vAmount, uint256 holderCount);
    event SharesIssued(address indexed holder, uint256 stakeBps, bool hasVesting);
    event SharesForfeited(uint256 indexed assetId, uint256 forfeitedBps);
    event SharesBoughtBack(uint256 indexed assetId, uint256 bps, uint256 priceS);
    event DirectorSharesRedeemed(address indexed exDirector, uint256 totalVPaid);
    event NameChanged(string oldName, string newName);
    event OfficerAppointed(string role, address indexed addr);
    event OfficerRemoved(string role);
    event SecretaryChanged(address indexed from, address indexed to);
    event AssetRegisteredByCompany(uint256 indexed assetId, string label, uint256 valueSTokens);
    event AssetTransferredByCompany(uint256 indexed assetId, address indexed to, uint256 newValueS);
    event TrustedIssuerSet(address indexed issuer);
    event OfficeEquityIssued(address indexed holder, uint256 indexed assetId, uint256 stakeBps);
    event OfficeEquityRedeemed(uint256 indexed assetId, address indexed exHolder, uint256 vPaid);

    // ── Constructor ──────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // ── Initialisation ───────────────────────────────────────────────────────

    /**
     * @notice Called once by BeaconProxy on deployment via CompanyFactory.
     *         Equity is NOT set here — CompanyFactory calls Colony.issueFoundingEquity()
     *         separately for each founding holder after the proxy is deployed and wired.
     *
     * @param _colony     Colony contract address
     * @param _name       Organisation display name
     * @param _secretary  Founding secretary (the registering citizen)
     */
    function initialize(
        address _colony,
        string  calldata _name,
        address _secretary
    ) external initializer {
        require(_colony    != address(0), "Company: zero colony");
        require(_secretary != address(0), "Company: zero secretary");

        colony    = _colony;
        name      = _name;
        secretary = _secretary;
    }

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlySecretary() {
        require(msg.sender == secretary, "Company: not secretary");
        _;
    }

    modifier onlySecretaryOrFD() {
        require(msg.sender == secretary || msg.sender == fd, "Company: not secretary or FD");
        _;
    }

    modifier onlyColony() {
        require(msg.sender == colony, "Company: not Colony");
        _;
    }

    // ── Name ────────────────────────────────────────────────────────────────

    /**
     * @notice Update the company display name. Secretary only.
     */
    function setName(string calldata newName) external onlySecretary {
        require(bytes(newName).length > 0, "Company: empty name");
        emit NameChanged(name, newName);
        name = newName;
    }

    // ── Officer management ───────────────────────────────────────────────────

    /**
     * @notice Appoint a CEO or FD. Secretary only.
     * @param role  "CEO" or "FD"
     * @param addr  New officer address
     */
    function appointOfficer(string calldata role, address addr) external onlySecretary {
        require(addr != address(0), "Company: zero address");
        bytes32 r = keccak256(bytes(role));
        if      (r == keccak256("CEO")) { ceo = addr; }
        else if (r == keccak256("FD"))  { fd  = addr; }
        else revert("Company: unknown role (use CEO or FD)");
        emit OfficerAppointed(role, addr);
    }

    /**
     * @notice Remove a CEO or FD. Secretary only.
     * @param role  "CEO" or "FD"
     */
    function removeOfficer(string calldata role) external onlySecretary {
        bytes32 r = keccak256(bytes(role));
        if      (r == keccak256("CEO")) { ceo = address(0); }
        else if (r == keccak256("FD"))  { fd  = address(0); }
        else revert("Company: unknown role (use CEO or FD)");
        emit OfficerRemoved(role);
    }

    /**
     * @notice Transfer the secretary role to another address. Secretary only.
     */
    function changeSecretary(address newSecretary) external onlySecretary {
        require(newSecretary != address(0), "Company: zero address");
        emit SecretaryChanged(secretary, newSecretary);
        secretary = newSecretary;
    }

    // ── Financial operations ─────────────────────────────────────────────────

    /**
     * @notice Send S-tokens from this organisation wallet to any address.
     *         Used for purchasing goods and services. Not wages — no ongoing
     *         employment relationship is created by this payment.
     */
    function pay(address to, uint256 amount, string calldata note) external onlySecretary {
        IColony(colony).send(to, amount, note);
        emit PaymentMade(to, amount, note);
    }

    /**
     * @notice Convert organisation S-tokens to V-tokens. No monthly cap for orgs.
     */
    function convertToV(uint256 amount) external onlySecretary {
        IColony(colony).saveToVCompany(amount);
        emit ConvertedToV(amount);
    }

    // ── A-token relays — register / transfer company-held physical assets (OS-11/OS-12)

    /**
     * @notice Register a physical asset to this company wallet (OS-11).
     *         Threshold rules from AToken still apply: value > 500 S OR
     *         weight > 50 kg OR autonomous AI capability.
     */
    function registerAsset(
        string  calldata label,
        uint256 valueSTokens,
        uint256 weightKg,
        bool    hasAI,
        uint256 depreciationBps
    ) external onlySecretary returns (uint256 id) {
        id = IColony(colony).registerAsset(label, valueSTokens, weightKg, hasAI, depreciationBps);
        emit AssetRegisteredByCompany(id, label, valueSTokens);
    }

    /**
     * @notice Transfer a company-held A-token to another wallet (OS-12).
     *         Used for sale of company equipment, etc.
     */
    function transferAsset(uint256 id, address to, uint256 newValueS) external onlySecretary {
        IColony(colony).transferAsset(id, to, newValueS);
        emit AssetTransferredByCompany(id, to, newValueS);
    }

    // ── Harberger land relays (OS-13)

    /**
     * @notice Claim a Harberger land parcel in the company's name. First-epoch
     *         stewardship fee paid in V from the company reserve.
     */
    function claimLand(string calldata label, uint256 declaredValueV)
        external onlySecretary returns (uint256 id)
    {
        id = IColony(colony).claimLand(label, declaredValueV);
    }

    function updateLandValue(uint256 id, uint256 newDeclaredValueV) external onlySecretary {
        IColony(colony).updateLandValue(id, newDeclaredValueV);
    }

    function payLandStewardship(uint256 id) external onlySecretary {
        IColony(colony).payLandStewardship(id);
    }

    function forcePurchaseLand(uint256 id, uint256 newDeclaredValueV) external onlySecretary {
        IColony(colony).forcePurchaseLand(id, newDeclaredValueV);
    }

    // ── Office-term equity (M-24/M-25/M-26) ────────────────────────────────

    /**
     * @notice Wire the external authority that may issue and redeem office-term
     *         equity (typically the colony's Governance contract). One-shot.
     */
    function setTrustedIssuer(address issuer) external onlySecretary {
        require(trustedIssuer == address(0), "Company: trusted issuer already set");
        require(issuer != address(0),         "Company: zero issuer");
        trustedIssuer = issuer;
        emit TrustedIssuerSet(issuer);
    }

    /**
     * @notice M-24: issue a fresh, fully-vested office-term equity stake to an
     *         incoming role-holder. Only the trusted issuer (Governance) may call.
     */
    function issueOfficeEquity(address holder, uint256 stakeBps)
        external returns (uint256 assetId)
    {
        require(msg.sender == trustedIssuer,  "Company: not trusted issuer");
        require(holder != address(0),          "Company: zero holder");
        require(stakeBps > 0,                  "Company: zero stake");
        // Immediate-vest open-share semantics: empty arrays mean no schedule.
        uint256[] memory empty = new uint256[](0);
        (assetId, ) = IColony(colony).issueEquity(address(this), holder, stakeBps, empty, empty);
        emit OfficeEquityIssued(holder, assetId, stakeBps);
    }

    /**
     * @notice M-25: redeem a specific office-term equity stake at current NAV.
     *         Pays the holder in V-tokens then cancels both vested and unvested
     *         portions of the stake. Only the trusted issuer (Governance) may call.
     */
    function redeemOfficeEquity(uint256 assetId) external returns (uint256 vPaid) {
        require(msg.sender == trustedIssuer, "Company: not trusted issuer");

        IColony col = IColony(colony);
        IAToken at  = IAToken(col.aToken());

        address holder = at.getTokenHolder(assetId);
        require(holder != address(0), "Company: token has no holder");
        (uint256 totalBps, uint256 vestedBps, address tokenCompany) = at.getVestingStake(assetId);
        require(tokenCompany == address(this), "Company: token not for this company");

        // Snapshot NAV before any cancellation
        (, uint256[] memory stakes, ) = at.getEquityTable(address(this));
        uint256 totalOutstanding = 0;
        for (uint256 i = 0; i < stakes.length; i++) {
            totalOutstanding += stakes[i];
        }

        uint256 vBal = IERC20Minimal(col.vToken()).balanceOf(address(this));
        vPaid = totalOutstanding > 0 ? (vBal * totalBps) / totalOutstanding : 0;

        if (vPaid > 0) col.transferVDividend(holder, vPaid);

        // Forfeit any unvested first, then cancel vested portion
        if (totalBps > vestedBps) col.forfeitEquity(assetId);
        if (vestedBps > 0)        col.cancelEquity(assetId, vestedBps);

        emit OfficeEquityRedeemed(assetId, holder, vPaid);
    }

    // ── Equity issuance ──────────────────────────────────────────────────────

    /**
     * @notice Issue participant shares with a monthly vesting schedule.
     *         Unvested shares receive dividends from day one but cannot be transferred.
     *         Unvested shares are forfeited via forfeitShares() if the participant
     *         stops contributing. Vested shares are permanent and freely transferable.
     *
     *         Convention: the month-12 tranche should be larger than earlier tranches
     *         (commitment bonus). The Secretary sets the schedule at issuance.
     *
     * @param holder        Participant wallet
     * @param stakeBps      Total stake in basis points
     * @param vestingEpochs Colony epoch at which each tranche unlocks
     * @param trancheBps    Basis points per tranche; must sum to stakeBps
     */
    function issueVestingShares(
        address   holder,
        uint256   stakeBps,
        uint256[] calldata vestingEpochs,
        uint256[] calldata trancheBps
    ) external onlySecretary {
        require(holder != address(0),   "Company: zero holder");
        require(stakeBps > 0,           "Company: zero stake");
        require(vestingEpochs.length > 0, "Company: use issueOpenShares for immediate vest");

        IColony(colony).issueEquity(
            address(this), holder, stakeBps, vestingEpochs, trancheBps
        );
        emit SharesIssued(holder, stakeBps, true);
    }

    /**
     * @notice Issue investor shares with immediate full vest.
     *         Freely transferable from the moment of issuance.
     *
     * @param investor  Investor wallet
     * @param stakeBps  Stake in basis points
     */
    function issueOpenShares(address investor, uint256 stakeBps) external onlySecretary {
        require(investor != address(0), "Company: zero investor");
        require(stakeBps > 0,           "Company: zero stake");

        // Empty vesting arrays = immediate full vest (AToken.issueEquity convention)
        IColony(colony).issueEquity(
            address(this), investor, stakeBps, new uint256[](0), new uint256[](0)
        );
        emit SharesIssued(investor, stakeBps, false);
    }

    // ── Dividend declaration ─────────────────────────────────────────────────

    /**
     * @notice Declare a V-token dividend. Secretary or FD may call.
     *
     *         Distributes vAmount of V pro-rata to ALL equity holders
     *         in proportion to their total stake (vested + unvested).
     *         Unvested shares receive dividends — this is the primary compensation
     *         mechanism for participants under the no-wages model.
     *
     *         The company must hold at least vAmount V before calling.
     *
     * @param vAmount  V-tokens to distribute (18 dec)
     */
    function declareDividend(uint256 vAmount) external onlySecretaryOrFD {
        require(vAmount > 0, "Company: zero dividend");

        IColony col = IColony(colony);
        uint256 vBal = IERC20Minimal(col.vToken()).balanceOf(address(this));
        require(vBal >= vAmount, "Company: insufficient V balance");

        IAToken at = IAToken(col.aToken());
        (address[] memory holders, uint256[] memory stakes,) = at.getEquityTable(address(this));

        uint256 count = holders.length;
        require(count > 0, "Company: no equity holders");

        uint256 totalOutstanding = 0;
        for (uint256 i = 0; i < count; i++) {
            totalOutstanding += stakes[i];
        }
        require(totalOutstanding > 0, "Company: zero outstanding equity");

        for (uint256 i = 0; i < count; i++) {
            if (stakes[i] == 0) continue;
            uint256 share = (vAmount * stakes[i]) / totalOutstanding;
            if (share > 0) {
                col.transferVDividend(holders[i], share);
            }
        }

        emit DividendDeclared(vAmount, count);
    }

    // ── Equity lifecycle ─────────────────────────────────────────────────────

    /**
     * @notice Forfeit all unvested tranches for a departing participant.
     *         Secretary calls when a participant stops contributing.
     *         Vested shares are unaffected and remain with the holder permanently.
     *         The forfeited bps become available for reallocation by the Secretary.
     *
     * @param assetId  The participant's EQUITY_ASSET token ID
     */
    function forfeitShares(uint256 assetId) external onlySecretary {
        IAToken at = IAToken(IColony(colony).aToken());
        (,, address tokenCompany) = at.getVestingStake(assetId);
        require(tokenCompany == address(this), "Company: token not for this company");

        uint256 forfeitedBps = IColony(colony).forfeitEquity(assetId);
        emit SharesForfeited(assetId, forfeitedBps);
    }

    /**
     * @notice Buy back vested equity from a holder at a secretary-specified S-token price.
     *         The Secretary agrees the price off-chain (shareNAV() provides a V-token
     *         reference value; market price may differ). Company pays priceS S-tokens to
     *         the holder; the equity is cancelled. Reducing total outstanding bps
     *         increases NAV per remaining share.
     *
     * @param assetId  The holder's EQUITY_ASSET token ID
     * @param bps      Vested basis points to buy back (must not exceed vestedBps)
     * @param priceS   S-tokens to pay the holder (18 dec)
     */
    function buybackShares(
        uint256 assetId,
        uint256 bps,
        uint256 priceS
    ) external onlySecretary {
        require(bps > 0,    "Company: zero bps");
        require(priceS > 0, "Company: zero price");

        IColony col = IColony(colony);
        IAToken at  = IAToken(col.aToken());

        address holder = at.getTokenHolder(assetId);
        require(holder != address(0), "Company: token has no holder");

        (,, address tokenCompany) = at.getVestingStake(assetId);
        require(tokenCompany == address(this), "Company: token not for this company");

        uint256 sBal = IERC20Minimal(col.sToken()).balanceOf(address(this));
        require(sBal >= priceS, "Company: insufficient S balance");

        col.send(holder, priceS, "share buyback");
        col.cancelEquity(assetId, bps);

        emit SharesBoughtBack(assetId, bps, priceS);
    }

    /**
     * @notice Redeem ALL equity held by an ex-director at current V NAV.
     *         Called by Colony governance when an MCC board member's term ends.
     *         Pays V-tokens at NAV for the director's full stake (vested + unvested).
     *         Unvested tranches are forfeited first; vested are then cancelled.
     *
     *         NAV per bps = vBalance × bps / totalOutstandingBps
     *
     *         The incoming director's fresh equity is issued separately via
     *         issueVestingShares() after this call.
     *
     * @param exDirector  The departing director's wallet address
     */
    function redeemDirectorShares(address exDirector) external onlyColony {
        require(exDirector != address(0), "Company: zero address");

        IColony col = IColony(colony);
        IAToken at  = IAToken(col.aToken());

        // Build equity table to compute total outstanding bps
        (address[] memory holders, uint256[] memory stakes,) = at.getEquityTable(address(this));
        uint256 totalOutstanding = 0;
        for (uint256 i = 0; i < holders.length; i++) {
            totalOutstanding += stakes[i];
        }
        require(totalOutstanding > 0, "Company: zero outstanding equity");

        // Scan exDirector's held tokens for equity in this company
        uint256[] memory held = at.tokensOf(exDirector);
        uint256 validCount = 0;
        uint256[] memory tempIds    = new uint256[](held.length);
        uint256[] memory tempBps    = new uint256[](held.length); // full stake (for NAV)
        uint256[] memory tempVested = new uint256[](held.length); // vested bps (for cancel)

        for (uint256 i = 0; i < held.length; i++) {
            (uint256 totalBps, uint256 vestedBps, address tokenCompany) =
                at.getVestingStake(held[i]);
            if (tokenCompany == address(this) && totalBps > 0) {
                tempIds[validCount]    = held[i];
                tempBps[validCount]    = totalBps;
                tempVested[validCount] = vestedBps;
                validCount++;
            }
        }
        require(validCount > 0, "Company: exDirector holds no equity here");

        // Snapshot V balance before any transfers (NAV computed at this moment)
        uint256 vBal = IERC20Minimal(col.vToken()).balanceOf(address(this));
        uint256 totalVPaid = 0;

        for (uint256 i = 0; i < validCount; i++) {
            // Pay NAV in V for full stake (vested + unvested — director is redeemed, not forfeited)
            uint256 navV = (vBal * tempBps[i]) / totalOutstanding;
            if (navV > 0) {
                col.transferVDividend(exDirector, navV);
                totalVPaid += navV;
            }

            // Forfeit unvested tranches (makes vestedBps == totalStakeBps)
            if (tempBps[i] > tempVested[i]) {
                col.forfeitEquity(tempIds[i]);
            }

            // Cancel the vested portion
            if (tempVested[i] > 0) {
                col.cancelEquity(tempIds[i], tempVested[i]);
            }
        }

        emit DirectorSharesRedeemed(exDirector, totalVPaid);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice V-token NAV for a given basis point stake.
     *         Reference value for buybacks and equity valuation.
     *         Market price may differ from NAV on growth expectations.
     *
     *         share value = company V reserve × (stakeBps / totalOutstandingBps)
     *
     * @param stakeBps  Basis points to value
     * @return navV     V-tokens at current NAV (0 if no equity outstanding)
     */
    function shareNAV(uint256 stakeBps) external view returns (uint256 navV) {
        IAToken at = IAToken(IColony(colony).aToken());
        (, uint256[] memory stakes,) = at.getEquityTable(address(this));

        uint256 totalOutstanding = 0;
        for (uint256 i = 0; i < stakes.length; i++) {
            totalOutstanding += stakes[i];
        }
        if (totalOutstanding == 0) return 0;

        uint256 vBal = IERC20Minimal(IColony(colony).vToken()).balanceOf(address(this));
        navV = (vBal * stakeBps) / totalOutstanding;
    }

    /// @notice S-token balance of this organisation.
    function sBalance() external view returns (uint256) {
        return IERC20Minimal(IColony(colony).sToken()).balanceOf(address(this));
    }

    /// @notice V-token balance of this organisation.
    function vBalance() external view returns (uint256) {
        return IERC20Minimal(IColony(colony).vToken()).balanceOf(address(this));
    }

    /**
     * @notice Full equity table for this company — all current holders with total
     *         and vested stake in basis points. Reads directly from AToken.
     *         Replaces the v1 getEquityTable() which read internal arrays.
     */
    function getEquityTable() external view returns (
        address[] memory holders,
        uint256[] memory totalStakeBps,
        uint256[] memory vestedStakeBps
    ) {
        return IAToken(IColony(colony).aToken()).getEquityTable(address(this));
    }

    /// @notice Number of current equity holders for this company.
    function holderCount() external view returns (uint256) {
        (address[] memory holders,,) = IAToken(IColony(colony).aToken()).getEquityTable(address(this));
        return holders.length;
    }
}
