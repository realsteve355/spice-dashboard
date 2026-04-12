// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./GToken.sol";
import "./Colony.sol";

/**
 * @title Governance
 * @notice On-chain voting for a SPICE colony.
 *         Only G-token holders may create proposals and cast votes.
 *         One vote per address per proposal.
 */
contract Governance {
    struct Proposal {
        string proposalType;   // "ELECTION" | "DIVIDEND" | "RECALL" | "AMENDMENT"
        string description;
        string[] optionLabels;
        uint256 deadline;      // unix timestamp
        uint256[] voteCounts;
        bool exists;
    }

    GToken public gToken;

    Proposal[] private _proposals;
    mapping(uint256 => mapping(address => bool))    public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voterChoice;

    event ProposalCreated(uint256 indexed id, string proposalType, string description, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 optionIndex);

    constructor(address colonyAddress) {
        Colony colony = Colony(payable(colonyAddress));
        gToken = colony.gToken();
    }

    modifier onlyCitizen() {
        require(gToken.tokenOf(msg.sender) > 0, "Governance: not a G-token holder");
        _;
    }

    /**
     * @notice Create a new proposal. Any G-token holder may propose.
     * @param proposalType  One of ELECTION / DIVIDEND / RECALL / AMENDMENT
     * @param description   Human-readable description
     * @param optionLabels  Array of option strings (min 2)
     * @param durationDays  Voting window in days
     */
    function createProposal(
        string calldata proposalType,
        string calldata description,
        string[] calldata optionLabels,
        uint256 durationDays
    ) external onlyCitizen returns (uint256 proposalId) {
        require(optionLabels.length >= 2, "Governance: need at least 2 options");
        require(durationDays > 0 && durationDays <= 30, "Governance: duration 1-30 days");

        proposalId = _proposals.length;
        Proposal storage p = _proposals.push();
        p.proposalType  = proposalType;
        p.description   = description;
        p.deadline      = block.timestamp + durationDays * 1 days;
        p.exists        = true;

        for (uint256 i = 0; i < optionLabels.length; i++) {
            p.optionLabels.push(optionLabels[i]);
            p.voteCounts.push(0);
        }

        emit ProposalCreated(proposalId, proposalType, description, p.deadline);
    }

    /**
     * @notice Cast a vote. One vote per address per proposal.
     */
    function vote(uint256 proposalId, uint256 optionIndex) external onlyCitizen {
        Proposal storage p = _proposals[proposalId];
        require(p.exists, "Governance: proposal does not exist");
        require(block.timestamp <= p.deadline, "Governance: voting closed");
        require(!hasVoted[proposalId][msg.sender], "Governance: already voted");
        require(optionIndex < p.optionLabels.length, "Governance: invalid option");

        hasVoted[proposalId][msg.sender]    = true;
        voterChoice[proposalId][msg.sender] = optionIndex;
        p.voteCounts[optionIndex]++;

        emit VoteCast(proposalId, msg.sender, optionIndex);
    }

    /**
     * @notice Returns total number of proposals.
     */
    function proposalCount() external view returns (uint256) {
        return _proposals.length;
    }

    /**
     * @notice Returns proposal metadata (without arrays).
     */
    function getProposal(uint256 id) external view returns (
        string memory proposalType,
        string memory description,
        uint256 deadline,
        bool isOpen
    ) {
        Proposal storage p = _proposals[id];
        require(p.exists, "Governance: not found");
        return (p.proposalType, p.description, p.deadline, block.timestamp <= p.deadline);
    }

    /**
     * @notice Returns option labels for a proposal.
     */
    function getOptions(uint256 id) external view returns (string[] memory) {
        return _proposals[id].optionLabels;
    }

    /**
     * @notice Returns vote counts for each option.
     */
    function getVoteCounts(uint256 id) external view returns (uint256[] memory) {
        return _proposals[id].voteCounts;
    }
}
