// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title Governance
 * @notice On-chain governance for a SPICE colony.
 *
 * Two proposal types:
 *
 *   MCC_ELECTION — any citizen nominates a candidate for CEO / CFO / COO.
 *     Citizens aged 18+ vote FOR or AGAINST (1 vote per citizen per proposal).
 *     Voting window: 14 days (fixed).
 *     Pass condition: votesFor > votesAgainst at close.
 *     Timelock: 7 days after passing, then anyone may execute.
 *     Term: 1 year. If the CEO role expires with no successor elected and
 *     executed, Colony.advanceEpoch() is blocked — no UBI until a new CEO
 *     takes office.
 *
 *   OBLIGATION — any wallet (citizen, company, or third-party arranger)
 *     proposes loan terms between a creditor and an obligor.
 *     Both creditor and obligor must call signObligation() separately.
 *     On second signature the obligation is created in Colony immediately.
 *     Expires after 30 days if not fully signed.
 */

interface IColony {
    function isCitizen(address)   external view returns (bool);
    function dateOfBirth(address) external view returns (uint256);
    function joinedAt(address)    external view returns (uint256);
    function issueObligationGov(
        address creditor,
        address obligor,
        uint256 monthlyAmountS,
        uint256 totalEpochs,
        uint256 collateralId
    ) external returns (uint256 assetId, uint256 liabilityId);
}

contract Governance {

    // ── Constants ─────────────────────────────────────────────────────────────

    uint256 public constant VOTING_WINDOW     = 14 days;
    uint256 public constant TIMELOCK          = 7 days;
    uint256 public constant TERM              = 365 days;
    uint256 public constant OBLIGATION_EXPIRY = 30 days;

    // ── Types ─────────────────────────────────────────────────────────────────

    enum Role { CEO, CFO, COO }

    struct ElectionProposal {
        Role    role;
        address candidate;
        address nominator;
        uint256 proposedAt;     // block.timestamp when nomination was made
        uint256 votingEndsAt;
        uint256 timelockEndsAt; // 0 until passed
        uint256 votesFor;
        uint256 votesAgainst;
        bool    executed;
        bool    cancelled;
    }

    struct ObligationProposal {
        address proposer;
        address creditor;
        address obligor;
        uint256 monthlyAmountS;
        uint256 totalEpochs;
        uint256 collateralId;
        uint256 expiresAt;
        bool    creditorSigned;
        bool    obligorSigned;
        bool    executed;
    }

    // ── Storage ───────────────────────────────────────────────────────────────

    IColony public colony;

    // MCC role holders + term ends (address(0) / 0 = vacant)
    address public ceo; uint256 public ceoTermEnd;
    address public cfo; uint256 public cfoTermEnd;
    address public coo; uint256 public cooTermEnd;

    uint256 public nextId = 1;

    mapping(uint256 => ElectionProposal)  public elections;
    mapping(uint256 => ObligationProposal) public obligations;

    // voter → electionId → voted
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    // role → current active election id (0 = none)
    mapping(uint8 => uint256) public activeElectionForRole;

    // ── Events ────────────────────────────────────────────────────────────────

    event ElectionProposed(uint256 indexed id, Role indexed role, address indexed candidate, address nominator);
    event VoteCast(uint256 indexed id, address indexed voter, bool support);
    event ElectionPassed(uint256 indexed id, Role role, address candidate);
    event ElectionFailed(uint256 indexed id, Role role);
    event ElectionExecuted(uint256 indexed id, Role indexed role, address indexed newHolder);
    event ObligationProposed(uint256 indexed id, address indexed proposer, address creditor, address obligor);
    event ObligationSigned(uint256 indexed id, address indexed signer);
    event ObligationCreated(uint256 indexed id, uint256 assetId, uint256 liabilityId);

    // ── Constructor ───────────────────────────────────────────────────────────

    /**
     * @param colony_     Colony contract address
     * @param initialCeo  Address to hold CEO on deploy (typically colony founder)
     * @param initialCfo  Address to hold CFO on deploy
     * @param initialCoo  Address to hold COO on deploy
     */
    constructor(
        address colony_,
        address initialCeo,
        address initialCfo,
        address initialCoo
    ) {
        require(colony_ != address(0), "Gov: zero colony");
        colony = IColony(colony_);
        // Founder holds all roles with a full 1-year term from deploy
        ceo = initialCeo; ceoTermEnd = block.timestamp + TERM;
        cfo = initialCfo; cfoTermEnd = block.timestamp + TERM;
        coo = initialCoo; cooTermEnd = block.timestamp + TERM;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function _isCitizen(address a) internal view returns (bool) {
        return colony.isCitizen(a);
    }

    /**
     * @param a          The voter address.
     * @param proposedAt block.timestamp when the election was nominated.
     *                   Anti-entryism: a citizen who joined AFTER an election was
     *                   proposed may not vote in that election.
     *                   joinedAt == 0 means the citizen predates the field — exempt.
     */
    function _isEligibleVoter(address a, uint256 proposedAt) internal view returns (bool) {
        if (!colony.isCitizen(a)) return false;
        uint256 birthYear = colony.dateOfBirth(a);
        if (birthYear == 0) return false;
        // Approximate current year from Unix timestamp
        uint256 currentYear = 1970 + block.timestamp / 365 days;
        if (currentYear < birthYear + 18) return false;
        // Anti-entryism: must have joined before this election was proposed
        uint256 joined = colony.joinedAt(a);
        if (joined > 0 && joined > proposedAt) return false;
        return true;
    }

    // ── MCC role views ────────────────────────────────────────────────────────

    /// @notice Used by Colony.advanceEpoch() — returns false if CEO slot is vacant or term expired.
    function ceoActive() external view returns (bool) {
        return ceo != address(0) && block.timestamp < ceoTermEnd;
    }

    function roleHolder(Role role) external view returns (address holder, uint256 termEnd, bool active) {
        if (role == Role.CEO) { holder = ceo; termEnd = ceoTermEnd; }
        else if (role == Role.CFO) { holder = cfo; termEnd = cfoTermEnd; }
        else { holder = coo; termEnd = cooTermEnd; }
        active = holder != address(0) && block.timestamp < termEnd;
    }

    // ── MCC Elections ─────────────────────────────────────────────────────────

    /**
     * @notice Any citizen may nominate any address for a MCC role.
     *         Only one active (unresolved) election per role at a time.
     */
    function nominateForElection(Role role, address candidate) external returns (uint256 id) {
        require(_isCitizen(msg.sender), "Gov: not a citizen");
        require(candidate != address(0), "Gov: zero candidate");
        require(candidate != msg.sender, "Gov: cannot self-nominate");

        // Ensure no active election for this role
        uint256 existing = activeElectionForRole[uint8(role)];
        if (existing != 0) {
            ElectionProposal storage ex = elections[existing];
            require(
                ex.executed || ex.cancelled || block.timestamp > ex.votingEndsAt,
                "Gov: election already active for this role"
            );
        }

        id = nextId++;
        elections[id] = ElectionProposal({
            role:           role,
            candidate:      candidate,
            nominator:      msg.sender,
            proposedAt:     block.timestamp,
            votingEndsAt:   block.timestamp + VOTING_WINDOW,
            timelockEndsAt: 0,
            votesFor:       0,
            votesAgainst:   0,
            executed:       false,
            cancelled:      false
        });
        activeElectionForRole[uint8(role)] = id;

        emit ElectionProposed(id, role, candidate, msg.sender);
    }

    /**
     * @notice Cast a FOR or AGAINST vote. Caller must be a citizen aged 18+.
     *         One vote per citizen per election.
     */
    function vote(uint256 electionId, bool support) external {
        ElectionProposal storage e = elections[electionId];
        require(e.nominator != address(0), "Gov: election not found");
        require(_isEligibleVoter(msg.sender, e.proposedAt), "Gov: not eligible (must be citizen 18+ who joined before this election)");
        require(block.timestamp <= e.votingEndsAt, "Gov: voting closed");
        require(!e.cancelled,                      "Gov: election cancelled");
        require(!hasVoted[msg.sender][electionId], "Gov: already voted");

        hasVoted[msg.sender][electionId] = true;
        if (support) e.votesFor++;
        else          e.votesAgainst++;

        emit VoteCast(electionId, msg.sender, support);
    }

    /**
     * @notice Finalise an election after voting closes.
     *         Pass → starts 7-day timelock.  Fail → clears slot, new election possible.
     *         Anyone may call.
     */
    function finaliseElection(uint256 electionId) external {
        ElectionProposal storage e = elections[electionId];
        require(e.nominator != address(0),        "Gov: election not found");
        require(block.timestamp > e.votingEndsAt, "Gov: voting still open");
        require(!e.executed && !e.cancelled,      "Gov: already finalised");

        if (e.votesFor > e.votesAgainst) {
            e.timelockEndsAt = block.timestamp + TIMELOCK;
            emit ElectionPassed(electionId, e.role, e.candidate);
        } else {
            e.cancelled = true;
            activeElectionForRole[uint8(e.role)] = 0;
            emit ElectionFailed(electionId, e.role);
        }
    }

    /**
     * @notice Execute a passed election after the 7-day timelock expires.
     *         Transfers the role to the winner. Anyone may call.
     */
    function executeElection(uint256 electionId) external {
        ElectionProposal storage e = elections[electionId];
        require(e.timelockEndsAt > 0,                "Gov: not passed");
        require(block.timestamp >= e.timelockEndsAt, "Gov: timelock active");
        require(!e.executed,                         "Gov: already executed");

        e.executed = true;
        activeElectionForRole[uint8(e.role)] = 0;

        uint256 newTermEnd = block.timestamp + TERM;
        if      (e.role == Role.CEO) { ceo = e.candidate; ceoTermEnd = newTermEnd; }
        else if (e.role == Role.CFO) { cfo = e.candidate; cfoTermEnd = newTermEnd; }
        else                         { coo = e.candidate; cooTermEnd = newTermEnd; }

        emit ElectionExecuted(electionId, e.role, e.candidate);
    }

    // ── Obligation Proposals ──────────────────────────────────────────────────

    /**
     * @notice Propose an obligation between creditor and obligor.
     *         Caller may be either party, or any third-party arranger.
     *         If the caller is one of the parties, their signature is auto-applied.
     */
    function proposeObligation(
        address creditor,
        address obligor,
        uint256 monthlyAmountS,
        uint256 totalEpochs,
        uint256 collateralId
    ) external returns (uint256 id) {
        require(creditor != address(0) && obligor != address(0), "Gov: zero address");
        require(creditor != obligor,                             "Gov: same party");
        require(monthlyAmountS > 0,                             "Gov: zero amount");
        require(totalEpochs > 0,                                "Gov: zero epochs");

        id = nextId++;
        obligations[id] = ObligationProposal({
            proposer:       msg.sender,
            creditor:       creditor,
            obligor:        obligor,
            monthlyAmountS: monthlyAmountS,
            totalEpochs:    totalEpochs,
            collateralId:   collateralId,
            expiresAt:      block.timestamp + OBLIGATION_EXPIRY,
            creditorSigned: msg.sender == creditor,
            obligorSigned:  msg.sender == obligor,
            executed:       false
        });

        emit ObligationProposed(id, msg.sender, creditor, obligor);

        // If proposer is one of the parties, check if we're already done
        _tryExecute(id);
    }

    /**
     * @notice Sign an obligation proposal as the creditor or obligor.
     *         On second signature the obligation is created immediately.
     */
    function signObligation(uint256 obligationId) external {
        ObligationProposal storage ob = obligations[obligationId];
        require(ob.creditor != address(0),       "Gov: proposal not found");
        require(!ob.executed,                    "Gov: already executed");
        require(block.timestamp <= ob.expiresAt, "Gov: expired");
        require(
            msg.sender == ob.creditor || msg.sender == ob.obligor,
            "Gov: not a party"
        );

        if (msg.sender == ob.creditor) {
            require(!ob.creditorSigned, "Gov: already signed");
            ob.creditorSigned = true;
        } else {
            require(!ob.obligorSigned, "Gov: already signed");
            ob.obligorSigned = true;
        }

        emit ObligationSigned(obligationId, msg.sender);
        _tryExecute(obligationId);
    }

    function _tryExecute(uint256 id) internal {
        ObligationProposal storage ob = obligations[id];
        if (!ob.creditorSigned || !ob.obligorSigned) return;
        ob.executed = true;
        (uint256 assetId, uint256 liabilityId) = colony.issueObligationGov(
            ob.creditor, ob.obligor, ob.monthlyAmountS, ob.totalEpochs, ob.collateralId
        );
        emit ObligationCreated(id, assetId, liabilityId);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    /**
     * @notice Obligation proposal IDs where the given address still needs to sign.
     */
    function pendingSignaturesFor(address party)
        external view returns (uint256[] memory ids)
    {
        uint256 count = 0;
        for (uint256 i = 1; i < nextId; i++) {
            if (_needsSign(i, party)) count++;
        }
        ids = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 1; i < nextId; i++) {
            if (_needsSign(i, party)) ids[j++] = i;
        }
    }

    function _needsSign(uint256 i, address party) internal view returns (bool) {
        ObligationProposal storage ob = obligations[i];
        if (ob.creditor == address(0) || ob.executed) return false;
        if (block.timestamp > ob.expiresAt) return false;
        if (party == ob.creditor && !ob.creditorSigned) return true;
        if (party == ob.obligor  && !ob.obligorSigned)  return true;
        return false;
    }

    /**
     * @notice IDs of elections that are still open (not executed or cancelled).
     */
    function activeElections() external view returns (uint256[] memory ids) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextId; i++) {
            ElectionProposal storage e = elections[i];
            if (e.nominator != address(0) && !e.executed && !e.cancelled) count++;
        }
        ids = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 1; i < nextId; i++) {
            ElectionProposal storage e = elections[i];
            if (e.nominator != address(0) && !e.executed && !e.cancelled) ids[j++] = i;
        }
    }
}
