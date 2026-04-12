// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ColonyRegistry
 * @notice Protocol-level registry of all SPICE colonies.
 *         Every colony registers here on deployment.
 *
 *   register(colony, name, slug)  — called by colony deployer at end of CreateColony flow
 *   getAll()                      — returns all registered colony addresses (for directory)
 *   entries(address)              — returns metadata for one colony
 *   feePerTx                      — ETH wei accrued per Colony.send() call (set by protocol owner)
 *   protocolTreasury              — destination for infrastructure fee settlements
 *
 * Infrastructure fee model:
 *   - Each Colony.send() increments colony.pendingProtocolFee by feePerTx
 *   - The fee is NOT collected per-transaction from citizens
 *   - It accumulates on the colony as a monthly infrastructure obligation
 *   - The MCC Fisc calls colony.settleProtocol() to forward the ETH to protocolTreasury
 *   - Citizens see it as a line item on their monthly MCC bill — not a per-tx skim
 */
contract ColonyRegistry {
    address public owner;
    address public protocolTreasury;
    uint256 public feePerTx;           // ETH wei per send() (default: 0.000001 ETH)

    struct ColonyEntry {
        address colony;
        string  name;
        string  slug;
        address founder;
        uint256 registeredAt;
    }

    address[]                        public colonyList;
    mapping(address => ColonyEntry)  public entries;
    mapping(string  => address)      public slugToColony;  // slug → colony address

    event ColonyRegistered(address indexed colony, string slug, address indexed founder);
    event FeeUpdated(uint256 newFeePerTx);
    event TreasuryUpdated(address newTreasury);

    modifier onlyOwner() {
        require(msg.sender == owner, "ColonyRegistry: not owner");
        _;
    }

    constructor(address _treasury, uint256 _feePerTx) {
        owner             = msg.sender;
        protocolTreasury  = _treasury;
        feePerTx          = _feePerTx;
    }

    /**
     * @notice Register a newly deployed colony.
     *         Can only be called once per colony address.
     */
    function register(
        address colony,
        string calldata name,
        string calldata slug
    ) external {
        require(colony != address(0),                      "ColonyRegistry: zero address");
        require(entries[colony].colony == address(0),      "ColonyRegistry: already registered");
        require(bytes(name).length > 0,                    "ColonyRegistry: name required");
        require(bytes(slug).length > 0,                    "ColonyRegistry: slug required");
        require(slugToColony[slug] == address(0),          "ColonyRegistry: slug taken");

        entries[colony] = ColonyEntry({
            colony:        colony,
            name:          name,
            slug:          slug,
            founder:       msg.sender,
            registeredAt:  block.timestamp
        });

        colonyList.push(colony);
        slugToColony[slug] = colony;

        emit ColonyRegistered(colony, slug, msg.sender);
    }

    /**
     * @notice Returns all registered colony addresses.
     */
    function getAll() external view returns (address[] memory) {
        return colonyList;
    }

    /**
     * @notice Total number of registered colonies.
     */
    function count() external view returns (uint256) {
        return colonyList.length;
    }

    // ── Protocol owner controls ────────────────────────────────────────────

    function setFeePerTx(uint256 fee) external onlyOwner {
        feePerTx = fee;
        emit FeeUpdated(fee);
    }

    function setTreasury(address treasury) external onlyOwner {
        require(treasury != address(0), "ColonyRegistry: zero address");
        protocolTreasury = treasury;
        emit TreasuryUpdated(treasury);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ColonyRegistry: zero address");
        owner = newOwner;
    }

    receive() external payable {}
}
