// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title Governance
 * @notice On-chain governance for a SPICE colony.
 *
 * Two proposal types:
 *
 *   MCC_ELECTION — multi-candidate election for CEO / CFO / COO.
 *     Phase 1 — NOMINATION (15 min testnet / 7 days mainnet):
 *       Any citizen opens an election for a role. During this window any
 *       citizen may nominate candidates (multiple allowed).
 *     Phase 2 — VOTING (30 min testnet / 14 days mainnet):
 *       Citizens aged 18+ who joined before the election opened cast one
 *       vote for their preferred candidate.
 *     Finalise: anyone calls finaliseElection() after voting closes.
 *       Candidate with most votes wins. Ties → election fails.
 *     Timelock: 10 min testnet / 7 days mainnet, then anyone may execute.
 *     Term: 1 year.
 *
 *   OBLIGATION — any wallet proposes loan terms between creditor and obligor.
 *     Both parties must call signObligation() separately.
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

    uint256 public constant NOMINATION_WINDOW =  5 minutes;  // testnet — 7 days on mainnet
    uint256 public constant VOTING_WINDOW     = 15 minutes;  // testnet — 14 days on mainnet
    uint256 public constant TIMELOCK          =  5 minutes;  // testnet — 7 days on mainnet
    uint256 public constant TERM              = 365 days;
    uint256 public constant OBLIGATION_EXPIRY = 30 days;

    // ── Types ─────────────────────────────────────────────────────────────────

    enum Role { CEO, CFO, COO }

    struct Election {
        uint8   role;
        address openedBy;
        uint256 openedAt;
        uint256 nominationEndsAt;
        uint256 votingEndsAt;
        uint256 timelockEndsAt;   // 0 until winner found
        address winner;           // address(0) until finalised
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

    address public ceo; uint256 public ceoTermEnd;
    address public cfo; uint256 public cfoTermEnd;
    address public coo; uint256 public cooTermEnd;

    uint256 public nextId = 1;

    mapping(uint256 => Election)            public elections;
    mapping(uint256 => address[])           public electionCandidates;
    mapping(uint256 => mapping(address => uint256)) public candidateVotes;
    mapping(uint256 => mapping(address => bool))    public isCandidate;
    mapping(address => mapping(uint256 => bool))    public hasVoted;
    mapping(uint8   => uint256)             public activeElectionForRole;

    mapping(uint256 => ObligationProposal)  public obligations;

    // ── Events ────────────────────────────────────────────────────────────────

    event ElectionOpened(uint256 indexed id, uint8 indexed role, address indexed openedBy);
    event CandidateNominated(uint256 indexed id, address indexed candidate, address indexed nominatedBy);
    event VoteCast(uint256 indexed id, address indexed voter, address indexed candidate);
    event ElectionFinalised(uint256 indexed id, uint8 role, address winner);
    event ElectionFailed(uint256 indexed id, uint8 role, string reason);
    event ElectionExecuted(uint256 indexed id, uint8 indexed role, address indexed newHolder);
    event RoleVacated(uint8 indexed role, address indexed previousHolder);
    event ObligationProposed(uint256 indexed id, address indexed proposer, address creditor, address obligor);
    event ObligationSigned(uint256 indexed id, address indexed signer);
    event ObligationCreated(uint256 indexed id, uint256 assetId, uint256 liabilityId);

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(
        address colony_,
        address initialCeo,
        address initialCfo,
        address initialCoo
    ) {
        require(colony_ != address(0), "Gov: zero colony");
        colony = IColony(colony_);
        ceo = initialCeo; ceoTermEnd = block.timestamp + TERM;
        cfo = initialCfo; cfoTermEnd = block.timestamp + TERM;
        coo = initialCoo; cooTermEnd = block.timestamp + TERM;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function _isEligibleVoter(address a, uint256 openedAt) internal view returns (bool) {
        if (!colony.isCitizen(a)) return false;
        uint256 birthYear = colony.dateOfBirth(a);
        if (birthYear == 0) return false;
        uint256 currentYear = 1970 + block.timestamp / 365 days;
        if (currentYear < birthYear + 18) return false;
        uint256 joined = colony.joinedAt(a);
        if (joined > 0 && joined > openedAt) return false;
        return true;
    }

    // ── MCC role views ────────────────────────────────────────────────────────

    function ceoActive() external view returns (bool) {
        return ceo != address(0) && block.timestamp < ceoTermEnd;
    }

    function roleHolder(uint8 role) external view returns (address holder, uint256 termEnd, bool active) {
        if (role == 0) { holder = ceo; termEnd = ceoTermEnd; }
        else if (role == 1) { holder = cfo; termEnd = cfoTermEnd; }
        else { holder = coo; termEnd = cooTermEnd; }
        active = holder != address(0) && block.timestamp < termEnd;
    }

    // ── MCC Elections ─────────────────────────────────────────────────────────

    /**
     * @notice Any citizen opens a new election for a role.
     *         Only one active election per role at a time.
     *         Starts a 15-minute nomination window immediately.
     */
    function openElection(uint8 role) external returns (uint256 id) {
        require(role <= 2, "Gov: invalid role");
        require(colony.isCitizen(msg.sender), "Gov: not a citizen");

        uint256 existing = activeElectionForRole[role];
        if (existing != 0) {
            Election storage ex = elections[existing];
            require(
                ex.executed || ex.cancelled || block.timestamp > ex.votingEndsAt,
                "Gov: election already active"
            );
        }

        id = nextId++;
        uint256 nomEnd = block.timestamp + NOMINATION_WINDOW;
        elections[id] = Election({
            role:             role,
            openedBy:         msg.sender,
            openedAt:         block.timestamp,
            nominationEndsAt: nomEnd,
            votingEndsAt:     nomEnd + VOTING_WINDOW,
            timelockEndsAt:   0,
            winner:           address(0),
            executed:         false,
            cancelled:        false
        });
        activeElectionForRole[role] = id;

        emit ElectionOpened(id, role, msg.sender);
    }

    /**
     * @notice Any citizen nominates a candidate during the nomination phase.
     *         Multiple candidates per election are allowed.
     */
    function nominateCandidate(uint256 electionId, address candidate) external {
        Election storage e = elections[electionId];
        require(e.openedBy != address(0),              "Gov: election not found");
        require(!e.executed && !e.cancelled,            "Gov: election closed");
        require(block.timestamp <= e.nominationEndsAt, "Gov: nomination phase closed");
        require(colony.isCitizen(msg.sender),           "Gov: not a citizen");
        require(candidate != address(0),               "Gov: zero candidate");
        require(!isCandidate[electionId][candidate],   "Gov: already nominated");

        isCandidate[electionId][candidate] = true;
        electionCandidates[electionId].push(candidate);

        emit CandidateNominated(electionId, candidate, msg.sender);
    }

    /**
     * @notice Cast one vote for a candidate. Caller must be a citizen aged 18+
     *         who joined before this election opened.
     *         Voting is only open after nomination phase closes.
     */
    function vote(uint256 electionId, address candidate) external {
        Election storage e = elections[electionId];
        require(e.openedBy != address(0),             "Gov: election not found");
        require(!e.executed && !e.cancelled,           "Gov: election closed");
        require(block.timestamp > e.nominationEndsAt, "Gov: nomination still open");
        require(block.timestamp <= e.votingEndsAt,    "Gov: voting closed");
        require(isCandidate[electionId][candidate],   "Gov: not a candidate");
        require(_isEligibleVoter(msg.sender, e.openedAt), "Gov: not eligible");
        require(!hasVoted[msg.sender][electionId],    "Gov: already voted");

        hasVoted[msg.sender][electionId] = true;
        candidateVotes[electionId][candidate]++;

        emit VoteCast(electionId, msg.sender, candidate);
    }

    /**
     * @notice Finalise an election after voting closes.
     *         Candidate with most votes wins. On a tie the election fails.
     *         If no candidates were nominated the election also fails.
     *         Anyone may call.
     */
    function finaliseElection(uint256 electionId) external {
        Election storage e = elections[electionId];
        require(e.openedBy != address(0),         "Gov: election not found");
        require(block.timestamp > e.votingEndsAt, "Gov: voting still open");
        require(!e.executed && !e.cancelled,      "Gov: already finalised");

        address[] storage candidates = electionCandidates[electionId];

        if (candidates.length == 0) {
            e.cancelled = true;
            activeElectionForRole[e.role] = 0;
            emit ElectionFailed(electionId, e.role, "no candidates");
            return;
        }

        // Find candidate with most votes; detect tie
        address topCandidate = address(0);
        uint256 topVotes     = 0;
        bool    tie          = false;

        for (uint256 i = 0; i < candidates.length; i++) {
            uint256 v = candidateVotes[electionId][candidates[i]];
            if (v > topVotes) {
                topVotes     = v;
                topCandidate = candidates[i];
                tie          = false;
            } else if (v == topVotes && topVotes > 0) {
                tie = true;
            }
        }

        if (topVotes == 0 || tie) {
            e.cancelled = true;
            activeElectionForRole[e.role] = 0;
            emit ElectionFailed(electionId, e.role, topVotes == 0 ? "no votes cast" : "tie");
            return;
        }

        e.winner         = topCandidate;
        e.timelockEndsAt = block.timestamp + TIMELOCK;
        emit ElectionFinalised(electionId, e.role, topCandidate);
    }

    /**
     * @notice Execute a passed election after the timelock expires.
     *         Transfers the role to the winner. Anyone may call.
     */
    function executeElection(uint256 electionId) external {
        Election storage e = elections[electionId];
        require(e.timelockEndsAt > 0,                "Gov: not passed");
        require(block.timestamp >= e.timelockEndsAt, "Gov: timelock active");
        require(!e.executed,                         "Gov: already executed");

        e.executed = true;
        activeElectionForRole[e.role] = 0;

        uint256 newTermEnd = block.timestamp + TERM;
        if      (e.role == 0) { ceo = e.winner; ceoTermEnd = newTermEnd; }
        else if (e.role == 1) { cfo = e.winner; cfoTermEnd = newTermEnd; }
        else                  { coo = e.winner; cooTermEnd = newTermEnd; }

        emit ElectionExecuted(electionId, e.role, e.winner);
    }

    // ── Role Resignation ─────────────────────────────────────────────────────

    /**
     * @notice Current holder may voluntarily vacate a role.
     *         Frees the slot for a new election immediately.
     */
    function resign(uint8 role) external {
        if (role == 0) {
            require(msg.sender == ceo, "Gov: not CEO");
            ceo = address(0); ceoTermEnd = 0;
        } else if (role == 1) {
            require(msg.sender == cfo, "Gov: not CFO");
            cfo = address(0); cfoTermEnd = 0;
        } else {
            require(msg.sender == coo, "Gov: not COO");
            coo = address(0); cooTermEnd = 0;
        }
        emit RoleVacated(role, msg.sender);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getCandidates(uint256 electionId) external view returns (address[] memory) {
        return electionCandidates[electionId];
    }

    function getCandidateVotes(uint256 electionId, address candidate) external view returns (uint256) {
        return candidateVotes[electionId][candidate];
    }

    // ── Obligation Proposals ──────────────────────────────────────────────────

    function proposeObligation(
        address creditor,
        address obligor,
        uint256 monthlyAmountS,
        uint256 totalEpochs,
        uint256 collateralId
    ) external returns (uint256 id) {
        require(creditor != address(0) && obligor != address(0), "Gov: zero address");
        require(creditor != obligor,    "Gov: same party");
        require(monthlyAmountS > 0,     "Gov: zero amount");
        require(totalEpochs > 0,        "Gov: zero epochs");

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
        _tryExecute(id);
    }

    function signObligation(uint256 obligationId) external {
        ObligationProposal storage ob = obligations[obligationId];
        require(ob.creditor != address(0),       "Gov: proposal not found");
        require(!ob.executed,                    "Gov: already executed");
        require(block.timestamp <= ob.expiresAt, "Gov: expired");
        require(msg.sender == ob.creditor || msg.sender == ob.obligor, "Gov: not a party");

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

    function pendingSignaturesFor(address party) external view returns (uint256[] memory ids) {
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
}
