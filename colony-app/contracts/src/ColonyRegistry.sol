// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ColonyRegistry
 * @notice Protocol-level registry of all SPICE colonies.
 *
 * Fee model:
 *   - Global default: feePerTx — applies to all colonies unless overridden
 *   - Per-colony override: _colonyFeeOverride[colony] — 0 = use global
 *   - getFeeForColony(colony) — what Colony.send() calls
 *
 * Colony management:
 *   - register(colony, name, slug)  — called at deploy time (or retroactively by owner)
 *   - deregister(colony)            — owner soft-removes a colony from getAll()
 *   - reregister(colony)            — owner restores a deregistered colony
 *
 * Treasury:
 *   - protocolTreasury is set at deploy and changed only via setTreasury() (owner only)
 *   - No web UI for this — use scripts/setTreasury.js
 */
contract ColonyRegistry {
    address public owner;
    address public protocolTreasury;
    uint256 public feePerTx;                              // global default (ETH wei)

    struct ColonyEntry {
        address colony;
        string  name;
        string  slug;
        address founder;
        uint256 registeredAt;
    }

    address[]                        public  colonyList;
    mapping(address => ColonyEntry)  public  entries;
    mapping(string  => address)      public  slugToColony;
    mapping(address => bool)         public  deregistered;
    mapping(address => uint256)      private _colonyFeeOverride; // 0 = use global

    event ColonyRegistered(address indexed colony, string slug, address indexed founder);
    event ColonyDeregistered(address indexed colony);
    event ColonyReregistered(address indexed colony);
    event ColonyFeeSet(address indexed colony, uint256 fee);
    event FeeUpdated(uint256 newFeePerTx);
    event TreasuryUpdated(address newTreasury);

    modifier onlyOwner() {
        require(msg.sender == owner, "ColonyRegistry: not owner");
        _;
    }

    constructor(address _treasury, uint256 _feePerTx) {
        owner            = msg.sender;
        protocolTreasury = _treasury;
        feePerTx         = _feePerTx;
    }

    // ── Colony registration ────────────────────────────────────────────────

    /**
     * @notice Register a colony. Called by CreateColony at deploy time.
     *         Owner may also call this to retroactively register existing colonies.
     */
    function register(
        address colony,
        string calldata name,
        string calldata slug
    ) external {
        require(colony != address(0),                 "ColonyRegistry: zero address");
        require(entries[colony].colony == address(0), "ColonyRegistry: already registered");
        require(bytes(name).length > 0,               "ColonyRegistry: name required");
        require(bytes(slug).length > 0,               "ColonyRegistry: slug required");
        require(slugToColony[slug] == address(0),     "ColonyRegistry: slug taken");

        // Only the colony deployer or the registry owner may register
        require(
            msg.sender == owner ||
            msg.sender == tx.origin, // deployer at creation time
            "ColonyRegistry: not authorised"
        );

        entries[colony] = ColonyEntry({
            colony:       colony,
            name:         name,
            slug:         slug,
            founder:      msg.sender == owner ? colony : msg.sender,
            registeredAt: block.timestamp
        });

        colonyList.push(colony);
        slugToColony[slug] = colony;

        emit ColonyRegistered(colony, slug, msg.sender);
    }

    /**
     * @notice Soft-remove a colony from getAll(). Does not delete on-chain data.
     */
    function deregister(address colony) external onlyOwner {
        require(entries[colony].colony != address(0), "ColonyRegistry: not registered");
        deregistered[colony] = true;
        emit ColonyDeregistered(colony);
    }

    /**
     * @notice Restore a deregistered colony.
     */
    function reregister(address colony) external onlyOwner {
        require(deregistered[colony], "ColonyRegistry: not deregistered");
        deregistered[colony] = false;
        emit ColonyReregistered(colony);
    }

    // ── Fee management ─────────────────────────────────────────────────────

    /**
     * @notice Returns the effective fee for a given colony.
     *         Per-colony override takes precedence; falls back to global feePerTx.
     *         Called by Colony.send() on every transaction.
     */
    function getFeeForColony(address colony) external view returns (uint256) {
        uint256 override_ = _colonyFeeOverride[colony];
        return override_ > 0 ? override_ : feePerTx;
    }

    /**
     * @notice Read the per-colony fee override (0 = using global).
     */
    function colonyFeeOverride(address colony) external view returns (uint256) {
        return _colonyFeeOverride[colony];
    }

    /**
     * @notice Set a per-colony fee override. Pass 0 to revert to global.
     */
    function setColonyFee(address colony, uint256 fee) external onlyOwner {
        require(entries[colony].colony != address(0), "ColonyRegistry: not registered");
        _colonyFeeOverride[colony] = fee;
        emit ColonyFeeSet(colony, fee);
    }

    /**
     * @notice Update the global default fee.
     */
    function setFeePerTx(uint256 fee) external onlyOwner {
        feePerTx = fee;
        emit FeeUpdated(fee);
    }

    // ── Treasury (script-only — no web UI) ────────────────────────────────

    /**
     * @notice Update protocol treasury address. Use scripts/setTreasury.js — not exposed in admin UI.
     */
    function setTreasury(address treasury) external onlyOwner {
        require(treasury != address(0), "ColonyRegistry: zero address");
        protocolTreasury = treasury;
        emit TreasuryUpdated(treasury);
    }

    // ── Ownership ─────────────────────────────────────────────────────────

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ColonyRegistry: zero address");
        owner = newOwner;
    }

    // ── Views ──────────────────────────────────────────────────────────────

    /**
     * @notice All registered colony addresses (including deregistered).
     */
    function getAll() external view returns (address[] memory) {
        return colonyList;
    }

    /**
     * @notice Active (non-deregistered) colony addresses only.
     */
    function getActive() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < colonyList.length; i++) {
            if (!deregistered[colonyList[i]]) count++;
        }
        address[] memory result = new address[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < colonyList.length; i++) {
            if (!deregistered[colonyList[i]]) result[j++] = colonyList[i];
        }
        return result;
    }

    function count() external view returns (uint256) {
        return colonyList.length;
    }

    receive() external payable {}
}
