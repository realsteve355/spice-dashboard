// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ColonyRegistry
 * @notice Protocol-level registry of all SPICE colonies.
 *
 * Each registered colony receives a soulbound ERC-721 C-token minted to the
 * Colony contract address. The token is the on-chain source of truth — all
 * three sites (app.zpc.finance, zpc.finance, spice.zpc.finance) query this
 * contract directly. contracts.json and colonies.js are legacy caches only.
 *
 * C-token model:
 *   - Minted to the Colony contract address on register()
 *   - Soulbound (transfers blocked — only mint and burn are permitted)
 *   - Burned on deregister(); reminted with the same token ID on reregister()
 *   - tokenURI() returns on-chain JSON metadata (name, slug, address, founder, timestamp)
 *   - ownerOf(tokenId) == Colony contract address (not the founder's EOA)
 *   - The colony is only orphaned if the Colony contract itself is bricked — not if
 *     the founder loses their private key
 *
 * Fee model:
 *   - Global default: feePerTx — applies to all colonies unless overridden
 *   - Per-colony override: _colonyFeeOverride[colony] — 0 = use global
 *   - getFeeForColony(colony) — what Colony.send() calls
 *
 * Founder revenue share:
 *   - Global default: founderShareBps (2500 = 25%) — of the fee, sent to founder wallet
 *   - Per-colony override: _founderShareOverride[colony] — 0 = use global
 *   - Founder wallet: entries[colony].founder unless overridden via _founderWalletOverride
 *   - getFeeSplit(colony, amount) → (protocolAmt, founderAmt, founderWallet)
 *   - Colony.settleProtocol() calls getFeeSplit and splits payment accordingly
 *   - Founder wallet changes are owner-only (support call to spice.zpc.finance)
 *
 * Colony management:
 *   - register(colony, name, slug)  — called at deploy time; mints C-token to colony
 *   - deregister(colony)            — owner soft-removes colony; burns C-token
 *   - reregister(colony)            — owner restores colony; remints C-token (same ID)
 *
 * Treasury:
 *   - protocolTreasury is set at deploy and changed only via setTreasury() (owner only)
 *   - No web UI for this — use scripts/setTreasury.js
 */
contract ColonyRegistry is ERC721 {
    using Strings for uint256;
    using Strings for address;

    address public owner;
    address public protocolTreasury;
    uint256 public feePerTx;                          // global default (ETH wei)
    uint256 public founderShareBps = 2500;            // 25% of fee → founder wallet (basis points)

    uint256 private _nextTokenId = 1;

    struct ColonyEntry {
        address colony;
        string  name;
        string  slug;
        address founder;
        uint256 registeredAt;
        uint256 tokenId;                              // C-token ID minted to colony
    }

    address[]                        public  colonyList;
    mapping(address => ColonyEntry)  public  entries;
    mapping(string  => address)      public  slugToColony;
    mapping(address => bool)         public  deregistered;
    mapping(uint256 => address)      public  tokenIdToColony;      // O(1) tokenURI lookup
    mapping(address => uint256)      private _colonyFeeOverride;   // 0 = use global
    mapping(address => uint256)      private _founderShareOverride; // basis points; 0 = use global
    mapping(address => address)      private _founderWalletOverride; // address(0) = use entries.founder

    event ColonyRegistered(address indexed colony, string slug, address indexed founder, uint256 tokenId);
    event ColonyDeregistered(address indexed colony, uint256 tokenId);
    event ColonyReregistered(address indexed colony, uint256 tokenId);
    event ColonyFeeSet(address indexed colony, uint256 fee);
    event FeeUpdated(uint256 newFeePerTx);
    event TreasuryUpdated(address newTreasury);
    event FounderShareBpsUpdated(uint256 newBps);
    event ColonyFounderShareSet(address indexed colony, uint256 bps);
    event FounderWalletUpdated(address indexed colony, address newWallet);

    modifier onlyOwner() {
        require(msg.sender == owner, "ColonyRegistry: not owner");
        _;
    }

    constructor(address _treasury, uint256 _feePerTx) ERC721("SPICE Colony", "COLONY") {
        owner            = msg.sender;
        protocolTreasury = _treasury;
        feePerTx         = _feePerTx;
    }

    // ── Soulbound — block all transfers ───────────────────────────────────────

    /**
     * @dev Override OZ v5 _update to block peer-to-peer transfers.
     *      Mint (from == address(0)) and burn (to == address(0)) are still allowed.
     *      This makes C-tokens soulbound to the Colony contract address.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal override returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "CToken: soulbound");
        return super._update(to, tokenId, auth);
    }

    // ── Colony registration ────────────────────────────────────────────────────

    /**
     * @notice Register a colony. Called by CreateColony at deploy time.
     *         Mints a soulbound C-token to the Colony contract address.
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
            msg.sender == tx.origin,
            "ColonyRegistry: not authorised"
        );

        uint256 tokenId = _nextTokenId++;

        entries[colony] = ColonyEntry({
            colony:       colony,
            name:         name,
            slug:         slug,
            founder:      msg.sender == owner ? colony : msg.sender,
            registeredAt: block.timestamp,
            tokenId:      tokenId
        });

        colonyList.push(colony);
        slugToColony[slug]       = colony;
        tokenIdToColony[tokenId] = colony;

        _mint(colony, tokenId);  // C-token soulbound to Colony contract

        emit ColonyRegistered(colony, slug, msg.sender, tokenId);
    }

    /**
     * @notice Soft-remove a colony. Burns its C-token and frees its slug.
     */
    function deregister(address colony) external onlyOwner {
        require(entries[colony].colony != address(0), "ColonyRegistry: not registered");
        require(!deregistered[colony],                "ColonyRegistry: already deregistered");
        deregistered[colony] = true;
        slugToColony[entries[colony].slug] = address(0);  // free slug for reuse
        _burn(entries[colony].tokenId);
        emit ColonyDeregistered(colony, entries[colony].tokenId);
    }

    /**
     * @notice Restore a deregistered colony. Remints its C-token with the same token ID.
     *         Reverts if the slug was taken by another colony in the meantime.
     */
    function reregister(address colony) external onlyOwner {
        require(deregistered[colony], "ColonyRegistry: not deregistered");
        require(
            slugToColony[entries[colony].slug] == address(0),
            "ColonyRegistry: slug taken by another colony"
        );
        deregistered[colony] = false;
        slugToColony[entries[colony].slug] = colony;
        _mint(colony, entries[colony].tokenId);  // remint same token ID
        emit ColonyReregistered(colony, entries[colony].tokenId);
    }

    // ── Token URI — on-chain JSON metadata ────────────────────────────────────

    /**
     * @notice Returns a base64-encoded JSON metadata URI for the C-token.
     *         Includes colony name, slug, contract address, founder, and registration date.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        address colonyAddr = tokenIdToColony[tokenId];
        ColonyEntry memory e = entries[colonyAddr];

        string memory json = string.concat(
            '{"name":"', e.name,
            '","description":"SPICE Colony - ', e.slug,
            '","attributes":[',
            '{"trait_type":"Slug","value":"', e.slug, '"},',
            '{"trait_type":"Colony","value":"', Strings.toHexString(uint160(e.colony), 20), '"},',
            '{"trait_type":"Founder","value":"', Strings.toHexString(uint160(e.founder), 20), '"},',
            '{"trait_type":"Registered","display_type":"date","value":', e.registeredAt.toString(),
            '}]}'
        );

        return string.concat(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        );
    }

    // ── Fee management ─────────────────────────────────────────────────────────

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

    // ── Founder revenue share ─────────────────────────────────────────────────

    /**
     * @notice Returns the effective founder share (in basis points) for a colony.
     *         Per-colony override takes precedence; falls back to global founderShareBps.
     */
    function getColonyFounderShare(address colony) external view returns (uint256) {
        uint256 override_ = _founderShareOverride[colony];
        return override_ > 0 ? override_ : founderShareBps;
    }

    /**
     * @notice Returns the wallet that founder fees are sent to.
     *         Per-colony override takes precedence; falls back to entries[colony].founder.
     */
    function getFounderWallet(address colony) external view returns (address) {
        address override_ = _founderWalletOverride[colony];
        return override_ != address(0) ? override_ : entries[colony].founder;
    }

    /**
     * @notice Compute how a fee amount should be split between protocol and founder.
     * @param colony    The colony paying the fee.
     * @param amount    Total fee amount (in ETH wei).
     * @return protocolAmt  Amount sent to protocolTreasury.
     * @return founderAmt   Amount sent to founder wallet (0 if wallet == address(0)).
     * @return founderWallet Address to send the founder portion to.
     */
    function getFeeSplit(address colony, uint256 amount)
        external view
        returns (uint256 protocolAmt, uint256 founderAmt, address founderWallet)
    {
        uint256 shareBps = _founderShareOverride[colony] > 0
            ? _founderShareOverride[colony]
            : founderShareBps;

        founderWallet = _founderWalletOverride[colony] != address(0)
            ? _founderWalletOverride[colony]
            : entries[colony].founder;

        // If founder wallet is the zero address or the colony itself, send everything to protocol
        if (founderWallet == address(0) || founderWallet == colony) {
            return (amount, 0, founderWallet);
        }

        founderAmt  = (amount * shareBps) / 10_000;
        protocolAmt = amount - founderAmt;
    }

    /**
     * @notice Update the global default founder share. Max 50% (5000 bps).
     *         Applies to all colonies that do not have a per-colony override.
     */
    function setFounderShareBps(uint256 bps) external onlyOwner {
        require(bps <= 5000, "ColonyRegistry: share cannot exceed 50%");
        founderShareBps = bps;
        emit FounderShareBpsUpdated(bps);
    }

    /**
     * @notice Set a per-colony founder share override. Pass 0 to revert to global.
     *         Max 50% (5000 bps).
     */
    function setColonyFounderShare(address colony, uint256 bps) external onlyOwner {
        require(entries[colony].colony != address(0), "ColonyRegistry: not registered");
        require(bps <= 5000, "ColonyRegistry: share cannot exceed 50%");
        _founderShareOverride[colony] = bps;
        emit ColonyFounderShareSet(colony, bps);
    }

    /**
     * @notice Override the founder wallet for a colony.
     *         Owner-only — founders request this via spice.zpc.finance support.
     *         Pass address(0) to revert to entries[colony].founder.
     */
    function setFounderWallet(address colony, address wallet) external onlyOwner {
        require(entries[colony].colony != address(0), "ColonyRegistry: not registered");
        _founderWalletOverride[colony] = wallet;
        emit FounderWalletUpdated(colony, wallet);
    }

    // ── Treasury (script-only — no web UI) ────────────────────────────────────

    /**
     * @notice Update protocol treasury address. Use scripts/setTreasury.js.
     */
    function setTreasury(address treasury) external onlyOwner {
        require(treasury != address(0), "ColonyRegistry: zero address");
        protocolTreasury = treasury;
        emit TreasuryUpdated(treasury);
    }

    // ── Ownership ─────────────────────────────────────────────────────────────

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ColonyRegistry: zero address");
        owner = newOwner;
    }

    // ── Views ──────────────────────────────────────────────────────────────────

    /**
     * @notice All registered colony addresses (including deregistered).
     */
    function getAll() external view returns (address[] memory) {
        return colonyList;
    }

    /**
     * @notice Active (non-deregistered) colony addresses only.
     *         These are the colonies with live C-tokens.
     */
    function getActive() external view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < colonyList.length; i++) {
            if (!deregistered[colonyList[i]]) activeCount++;
        }
        address[] memory result = new address[](activeCount);
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
