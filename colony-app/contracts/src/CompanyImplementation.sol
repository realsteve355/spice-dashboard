// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title CompanyImplementation
 * @notice Template for SPICE colony organisations (companies, MCC, cooperatives, civic).
 *
 * Each organisation is deployed as a BeaconProxy pointing to this template.
 * The beacon owner can upgrade all organisations simultaneously with one tx.
 *
 * Three named roles (stored as plain addresses — not tokens):
 *   Secretary  — mandatory. Day-to-day ops. Appoints/removes CEO and FD.
 *   CEO        — optional. Must co-approve share transfers.
 *   FD         — optional. Must co-approve share transfers.
 *
 * If neither CEO nor FD is appointed, the Secretary alone approves share transfers.
 * The proposer's own approval is implicit — they need not call approveShareTransfer
 * separately if they happen to be one of the required approvers.
 *
 * The O-token for this organisation is held by the organisation contract address
 * itself (not by the secretary). It is a soulbound identity badge, not an
 * authority key. Secretary authority is proved by msg.sender == secretary.
 *
 * Secretary-gated operations:
 *   pay(to, amount, note)        — send S-tokens to any address
 *   convertToV(amount)           — convert S → V (no monthly cap for orgs)
 *   distributeVDividend()        — distribute entire V balance pro-rata to equity holders
 *   appointOfficer(role, addr)   — set CEO or FD address
 *   removeOfficer(role)          — clear CEO or FD
 *   changeSecretary(newAddr)     — hand secretary role to another address
 *
 * Any equity holder:
 *   proposeShareTransfer(to, basisPoints) — propose transferring own equity
 *
 * Required approvers (captured at proposal time):
 *   approveShareTransfer(proposalId) — CEO / FD / Secretary (whoever is required)
 */

interface IColony {
    function send(address to, uint256 amount, string calldata note) external;
    function saveToVCompany(uint256 amount) external;
    function transferVDividend(address to, uint256 amount) external;
    function sToken() external view returns (address);
    function vToken() external view returns (address);
}

interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
}

contract CompanyImplementation is Initializable {

    // ── State ────────────────────────────────────────────────────────────────

    address public colony;
    string  public name;

    address public secretary;
    address public ceo;
    address public fd;

    address[] public equityHolders;
    uint256[] public equityStakes;   // basis points; must sum to 10000

    struct ShareTransferProposal {
        address from;
        address to;
        uint256 basisPoints;
        address approver1;   // required approver (captured at proposal time)
        address approver2;   // second required approver; address(0) if only one needed
        bool    approved1;
        bool    approved2;
        bool    executed;
        bool    cancelled;
        uint256 expiresAt;   // block.timestamp + 30 days
    }

    mapping(uint256 => ShareTransferProposal) public proposals;
    uint256 public nextProposalId;

    // ── Events ───────────────────────────────────────────────────────────────

    event PaymentMade(address indexed to, uint256 amount, string note);
    event ConvertedToV(uint256 amount);
    event DividendDistributed(uint256 totalAmount, uint256 holderCount);
    event OfficerAppointed(string role, address indexed addr);
    event OfficerRemoved(string role);
    event SecretaryChanged(address indexed from, address indexed to);
    event ShareTransferProposed(
        uint256 indexed proposalId,
        address indexed from,
        address indexed to,
        uint256 basisPoints,
        address approver1,
        address approver2
    );
    event ShareTransferApproved(uint256 indexed proposalId, address indexed approver);
    event ShareTransferExecuted(
        uint256 indexed proposalId,
        address indexed from,
        address indexed to,
        uint256 basisPoints
    );
    event ShareTransferCancelled(uint256 indexed proposalId);

    // ── Constructor ──────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // ── Initialisation ───────────────────────────────────────────────────────

    /**
     * @notice Called once by BeaconProxy on deployment via CompanyFactory.
     * @param _colony     Colony contract address
     * @param _name       Organisation display name
     * @param _secretary  Founding secretary — the registering citizen
     * @param _holders    Initial equity holder addresses
     * @param _stakes     Stakes in basis points (must sum to 10000)
     */
    function initialize(
        address _colony,
        string  calldata _name,
        address _secretary,
        address[] calldata _holders,
        uint256[] calldata _stakes
    ) external initializer {
        require(_colony    != address(0), "Company: zero colony");
        require(_secretary != address(0), "Company: zero secretary");
        require(_holders.length > 0,      "Company: no holders");
        require(_holders.length == _stakes.length, "Company: length mismatch");

        colony    = _colony;
        name      = _name;
        secretary = _secretary;

        uint256 total = 0;
        for (uint256 i = 0; i < _holders.length; i++) {
            equityHolders.push(_holders[i]);
            equityStakes.push(_stakes[i]);
            total += _stakes[i];
        }
        require(total == 10000, "Company: stakes must sum to 10000 bps");
    }

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlySecretary() {
        require(msg.sender == secretary, "Company: not secretary");
        _;
    }

    // ── Officer management ───────────────────────────────────────────────────

    /**
     * @notice Appoint a CEO or FD. Only the secretary may call.
     * @param role  "CEO" or "FD"
     * @param addr  Address of the new officer
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
     * @notice Remove a CEO or FD role. Only the secretary may call.
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
     * @notice Transfer the secretary role to another address.
     *         Only the current secretary may call.
     */
    function changeSecretary(address newSecretary) external onlySecretary {
        require(newSecretary != address(0), "Company: zero address");
        emit SecretaryChanged(secretary, newSecretary);
        secretary = newSecretary;
    }

    // ── Secretary operations ─────────────────────────────────────────────────

    /**
     * @notice Send S-tokens from this organisation wallet to any address.
     */
    function pay(address to, uint256 amount, string calldata note) external onlySecretary {
        IColony(colony).send(to, amount, note);
        emit PaymentMade(to, amount, note);
    }

    /**
     * @notice Convert organisation S-tokens to V-tokens. No monthly cap.
     */
    function convertToV(uint256 amount) external onlySecretary {
        IColony(colony).saveToVCompany(amount);
        emit ConvertedToV(amount);
    }

    /**
     * @notice Distribute the entire V-token balance pro-rata to equity holders.
     *         Secretary calls at end of each earnings period (typically monthly).
     */
    function distributeVDividend() external onlySecretary {
        uint256 total = IERC20Minimal(IColony(colony).vToken()).balanceOf(address(this));
        require(total > 0, "Company: no V-tokens to distribute");

        for (uint256 i = 0; i < equityHolders.length; i++) {
            uint256 share = (total * equityStakes[i]) / 10000;
            if (share > 0) {
                IColony(colony).transferVDividend(equityHolders[i], share);
            }
        }

        emit DividendDistributed(total, equityHolders.length);
    }

    // ── Share transfer proposals ─────────────────────────────────────────────

    /**
     * @notice Propose transferring some or all of your equity stake to another address.
     *
     * Required approvers are captured at proposal time (current CEO/FD/Secretary).
     * The proposer's own approval is implicit if they are one of the required approvers.
     * Auto-executes immediately if approvals are already satisfied.
     *
     * @param to           Recipient (may be a new or existing equity holder)
     * @param basisPoints  Amount to transfer in basis points (100 = 1%)
     * @return proposalId
     */
    function proposeShareTransfer(
        address to,
        uint256 basisPoints
    ) external returns (uint256 proposalId) {
        require(to != address(0), "Company: zero address");
        require(basisPoints > 0,  "Company: zero amount");

        uint256 fromIdx = _holderIndex(msg.sender);
        require(fromIdx < equityHolders.length,         "Company: not an equity holder");
        require(basisPoints <= equityStakes[fromIdx],   "Company: insufficient stake");

        // Determine required approvers at time of proposal
        address a1;
        address a2;
        if (ceo != address(0) && fd != address(0)) {
            a1 = ceo; a2 = fd;
        } else if (ceo != address(0)) {
            a1 = ceo;
        } else if (fd != address(0)) {
            a1 = fd;
        } else {
            a1 = secretary;
        }

        // Proposer's approval is implicit
        bool app1 = (msg.sender == a1);
        bool app2 = (a2 != address(0) && msg.sender == a2);

        proposalId = nextProposalId++;
        ShareTransferProposal storage p = proposals[proposalId];
        p.from        = msg.sender;
        p.to          = to;
        p.basisPoints = basisPoints;
        p.approver1   = a1;
        p.approver2   = a2;
        p.approved1   = app1;
        p.approved2   = app2;
        p.executed    = false;
        p.cancelled   = false;
        p.expiresAt   = block.timestamp + 30 days;

        emit ShareTransferProposed(proposalId, msg.sender, to, basisPoints, a1, a2);

        _tryExecute(proposalId);
    }

    /**
     * @notice Approve a pending share transfer proposal.
     *         Caller must be one of the required approvers captured at proposal time.
     */
    function approveShareTransfer(uint256 proposalId) external {
        ShareTransferProposal storage p = proposals[proposalId];
        require(!p.executed,                         "Company: already executed");
        require(!p.cancelled,                        "Company: cancelled");
        require(block.timestamp <= p.expiresAt,      "Company: proposal expired");
        require(
            msg.sender == p.approver1 || msg.sender == p.approver2,
            "Company: not a required approver"
        );

        if (msg.sender == p.approver1) p.approved1 = true;
        if (msg.sender == p.approver2) p.approved2 = true;

        emit ShareTransferApproved(proposalId, msg.sender);
        _tryExecute(proposalId);
    }

    /**
     * @notice Cancel a pending share transfer proposal.
     *         Only the proposer may cancel.
     */
    function cancelShareTransfer(uint256 proposalId) external {
        ShareTransferProposal storage p = proposals[proposalId];
        require(!p.executed,            "Company: already executed");
        require(!p.cancelled,           "Company: already cancelled");
        require(msg.sender == p.from,   "Company: not the proposer");
        p.cancelled = true;
        emit ShareTransferCancelled(proposalId);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function sBalance() external view returns (uint256) {
        return IERC20Minimal(IColony(colony).sToken()).balanceOf(address(this));
    }

    function vBalance() external view returns (uint256) {
        return IERC20Minimal(IColony(colony).vToken()).balanceOf(address(this));
    }

    function getEquityTable() external view returns (
        address[] memory holders,
        uint256[] memory stakes
    ) {
        return (equityHolders, equityStakes);
    }

    function holderCount() external view returns (uint256) {
        return equityHolders.length;
    }

    function getProposal(uint256 proposalId) external view returns (
        address from,
        address to,
        uint256 basisPoints,
        address approver1,
        address approver2,
        bool    approved1,
        bool    approved2,
        bool    executed,
        bool    cancelled,
        uint256 expiresAt
    ) {
        ShareTransferProposal storage p = proposals[proposalId];
        return (
            p.from, p.to, p.basisPoints,
            p.approver1, p.approver2,
            p.approved1, p.approved2,
            p.executed, p.cancelled, p.expiresAt
        );
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    function _tryExecute(uint256 proposalId) internal {
        ShareTransferProposal storage p = proposals[proposalId];
        bool ready = p.approved1 && (p.approver2 == address(0) || p.approved2);
        if (!ready) return;

        p.executed = true;
        _doTransferShares(p.from, p.to, p.basisPoints);
        emit ShareTransferExecuted(proposalId, p.from, p.to, p.basisPoints);
    }

    function _doTransferShares(address from, address to, uint256 basisPoints) internal {
        uint256 fromIdx = _holderIndex(from);
        require(fromIdx < equityHolders.length,       "Company: from not a holder");
        require(basisPoints <= equityStakes[fromIdx], "Company: stake changed");

        equityStakes[fromIdx] -= basisPoints;

        uint256 toIdx = _holderIndex(to);
        if (toIdx < equityHolders.length) {
            equityStakes[toIdx] += basisPoints;
        } else {
            equityHolders.push(to);
            equityStakes.push(basisPoints);
        }

        // Remove zero-stake holder
        if (equityStakes[fromIdx] == 0) {
            _removeHolder(fromIdx);
        }
    }

    function _holderIndex(address addr) internal view returns (uint256) {
        for (uint256 i = 0; i < equityHolders.length; i++) {
            if (equityHolders[i] == addr) return i;
        }
        return equityHolders.length; // not found sentinel
    }

    function _removeHolder(uint256 idx) internal {
        uint256 last = equityHolders.length - 1;
        if (idx != last) {
            equityHolders[idx] = equityHolders[last];
            equityStakes[idx]  = equityStakes[last];
        }
        equityHolders.pop();
        equityStakes.pop();
    }
}
