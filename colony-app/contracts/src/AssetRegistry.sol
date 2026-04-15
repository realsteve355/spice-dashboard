// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title AssetRegistry
 * @notice The SPICE colony asset and land registry.
 *
 * Two asset types, both minted as ERC-721 tokens:
 *
 *   PHYSICAL ASSET (type 0) — "A-token"
 *     Registration required if: value > 500 S-equivalent, weight > 50 kg,
 *     or the asset has autonomous AI capability. Below threshold, possession
 *     implies ownership. Transferred by owner to any address.
 *
 *   SURFACE LAND (type 1) — "L-token" (Harberger)
 *     Owner declares a V-token value. Pays a stewardship fee of 0.5% of
 *     declared value per epoch to the colony. Anyone may force-purchase
 *     the land at the declared price at any time — owner cannot refuse.
 *     Owner may update declared value at any time.
 *
 * Stewardship fees and force-purchase payments are made in V-tokens via
 * ERC-20 approve + transferFrom pattern. The colony contract address
 * receives all fees.
 */
contract AssetRegistry is ERC721 {

    // ── Types ────────────────────────────────────────────────────────────────

    enum AssetType { Physical, Land }

    struct Asset {
        AssetType  assetType;
        address    owner;
        string     name;
        string     description;
        uint256    registeredAt;     // block.timestamp
        // Physical asset fields
        uint256    valueSTokens;     // declared value in S-token equivalent
        uint256    weightKg;
        bool       hasAutonomousAI;
        // Land (Harberger) fields
        uint256    declaredValueV;   // declared V-token value (18 decimals)
        uint256    lastFeeEpoch;     // epoch when stewardship was last settled
    }

    // ── State ────────────────────────────────────────────────────────────────

    address public colony;           // Colony contract — citizenship checks
    address public vToken;           // VToken ERC-20 — payments
    address public feeRecipient;     // Receives stewardship fees (colony/founder)

    uint256 public nextTokenId = 1;
    mapping(uint256 => Asset) public assets;

    // Stewardship fee: 0.5% per epoch = 50 basis points
    uint256 public constant STEWARDSHIP_BPS = 50;  // 0.5%
    uint256 public constant BPS_DENOM       = 10000;

    // ── Events ───────────────────────────────────────────────────────────────

    event AssetRegistered(uint256 indexed tokenId, address indexed owner, AssetType assetType, string name);
    event AssetTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event LandValueUpdated(uint256 indexed tokenId, uint256 oldValue, uint256 newValue);
    event LandPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event StewardshipPaid(uint256 indexed tokenId, address indexed payer, uint256 amount, uint256 epochs);

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(address _colony, address _vToken, address _feeRecipient)
        ERC721("SPICE Asset Registry", "ATOKEN")
    {
        colony       = _colony;
        vToken       = _vToken;
        feeRecipient = _feeRecipient;
    }

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyCitizen() {
        (bool ok, bytes memory data) = colony.staticcall(
            abi.encodeWithSignature("isCitizen(address)", msg.sender)
        );
        require(ok && abi.decode(data, (bool)), "AssetRegistry: not a citizen");
        _;
    }

    modifier onlyAssetOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "AssetRegistry: not owner");
        _;
    }

    // ── Physical Asset Registration ──────────────────────────────────────────

    /**
     * @notice Register a physical asset. Any citizen may register.
     * @param name        Human-readable name (e.g. "Excavation Robot #7")
     * @param description Details, serial number, specifications
     * @param valueSTokens Declared S-token equivalent value
     * @param weightKg    Weight in kg
     * @param hasAI       True if the asset has autonomous AI capability
     */
    function registerAsset(
        string calldata name,
        string calldata description,
        uint256 valueSTokens,
        uint256 weightKg,
        bool    hasAI
    ) external onlyCitizen returns (uint256 tokenId) {
        require(
            valueSTokens > 500 * 1e18 || weightKg > 50 || hasAI,
            "AssetRegistry: below registration threshold"
        );
        tokenId = nextTokenId++;
        assets[tokenId] = Asset({
            assetType:      AssetType.Physical,
            owner:          msg.sender,
            name:           name,
            description:    description,
            registeredAt:   block.timestamp,
            valueSTokens:   valueSTokens,
            weightKg:       weightKg,
            hasAutonomousAI: hasAI,
            declaredValueV: 0,
            lastFeeEpoch:   0
        });
        _mint(msg.sender, tokenId);
        emit AssetRegistered(tokenId, msg.sender, AssetType.Physical, name);
    }

    /**
     * @notice Transfer a physical asset to another address.
     *         Both parties are expected to agree off-chain; the on-chain
     *         action is the owner signing the transfer.
     */
    function transferAsset(uint256 tokenId, address to) external onlyAssetOwner(tokenId) {
        require(assets[tokenId].assetType == AssetType.Physical, "AssetRegistry: use purchaseLand for land");
        require(to != address(0), "AssetRegistry: zero address");
        address from = msg.sender;
        assets[tokenId].owner = to;
        _transfer(from, to, tokenId);
        emit AssetTransferred(tokenId, from, to);
    }

    // ── Surface Land (Harberger) ─────────────────────────────────────────────

    /**
     * @notice Register an unclaimed surface land parcel.
     *         Caller must have approved this contract to spend the first
     *         epoch's stewardship fee in V-tokens.
     * @param name            Parcel identifier (e.g. "Grid A-7, Sector 3")
     * @param description     Location details, surface area (m²)
     * @param declaredValueV  Declared value in V-tokens (18 decimals)
     * @param currentEpoch    Current colony epoch number
     */
    function claimLand(
        string calldata name,
        string calldata description,
        uint256 declaredValueV,
        uint256 currentEpoch
    ) external onlyCitizen returns (uint256 tokenId) {
        require(declaredValueV > 0, "AssetRegistry: zero declared value");

        // Collect first epoch's stewardship fee upfront
        uint256 fee = _stewardshipFee(declaredValueV);
        _collectFee(msg.sender, fee);

        tokenId = nextTokenId++;
        assets[tokenId] = Asset({
            assetType:      AssetType.Land,
            owner:          msg.sender,
            name:           name,
            description:    description,
            registeredAt:   block.timestamp,
            valueSTokens:   0,
            weightKg:       0,
            hasAutonomousAI: false,
            declaredValueV: declaredValueV,
            lastFeeEpoch:   currentEpoch
        });
        _mint(msg.sender, tokenId);
        emit AssetRegistered(tokenId, msg.sender, AssetType.Land, name);
        emit StewardshipPaid(tokenId, msg.sender, fee, 1);
    }

    /**
     * @notice Update the declared value of a land parcel.
     *         Owner sets the price at which anyone can force-purchase.
     */
    function updateLandValue(uint256 tokenId, uint256 newValueV) external onlyAssetOwner(tokenId) {
        require(assets[tokenId].assetType == AssetType.Land, "AssetRegistry: not land");
        uint256 old = assets[tokenId].declaredValueV;
        assets[tokenId].declaredValueV = newValueV;
        emit LandValueUpdated(tokenId, old, newValueV);
    }

    /**
     * @notice Pay outstanding stewardship fees for a land parcel.
     *         Caller must have approved the contract to spend V-tokens.
     * @param tokenId     Land token ID
     * @param currentEpoch Current colony epoch
     */
    function paystewardship(uint256 tokenId, uint256 currentEpoch) external {
        Asset storage a = assets[tokenId];
        require(a.assetType == AssetType.Land, "AssetRegistry: not land");
        uint256 epochsDue = currentEpoch > a.lastFeeEpoch ? currentEpoch - a.lastFeeEpoch : 0;
        require(epochsDue > 0, "AssetRegistry: no fees outstanding");
        uint256 fee = _stewardshipFee(a.declaredValueV) * epochsDue;
        _collectFee(msg.sender, fee);
        a.lastFeeEpoch = currentEpoch;
        emit StewardshipPaid(tokenId, msg.sender, fee, epochsDue);
    }

    /**
     * @notice Force-purchase a land parcel at its declared value.
     *         The buyer pays the declared V-token amount; ownership transfers
     *         immediately. The seller cannot refuse.
     * @param tokenId     Land token ID to purchase
     */
    function purchaseLand(uint256 tokenId) external onlyCitizen {
        Asset storage a = assets[tokenId];
        require(a.assetType == AssetType.Land, "AssetRegistry: not land");
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "AssetRegistry: already owner");

        uint256 price = a.declaredValueV;
        require(price > 0, "AssetRegistry: no declared value");

        // Transfer V-tokens from buyer to seller
        (bool ok,) = vToken.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender, seller, price
            )
        );
        require(ok, "AssetRegistry: V-token payment failed");

        // Transfer NFT
        a.owner = msg.sender;
        _transfer(seller, msg.sender, tokenId);

        emit LandPurchased(tokenId, msg.sender, seller, price);
        emit AssetTransferred(tokenId, seller, msg.sender);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice Returns all token IDs owned by an address.
     */
    function tokensOf(address owner) external view returns (uint256[] memory) {
        uint256 count = balanceOf(owner);
        uint256[] memory ids = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (_ownerOf(i) == owner) ids[idx++] = i;
        }
        return ids;
    }

    /**
     * @notice Calculate outstanding stewardship fee for a land parcel.
     */
    function outstandingFee(uint256 tokenId, uint256 currentEpoch) external view returns (uint256) {
        Asset storage a = assets[tokenId];
        if (a.assetType != AssetType.Land) return 0;
        uint256 epochsDue = currentEpoch > a.lastFeeEpoch ? currentEpoch - a.lastFeeEpoch : 0;
        return _stewardshipFee(a.declaredValueV) * epochsDue;
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    function _stewardshipFee(uint256 declaredValueV) internal pure returns (uint256) {
        return declaredValueV * STEWARDSHIP_BPS / BPS_DENOM;
    }

    function _collectFee(address from, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok,) = vToken.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                from, feeRecipient, amount
            )
        );
        require(ok, "AssetRegistry: fee payment failed");
    }

    // Block standard ERC-721 transfers — use transferAsset() or purchaseLand()
    function transferFrom(address, address, uint256) public pure override {
        revert("AssetRegistry: use transferAsset or purchaseLand");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("AssetRegistry: use transferAsset or purchaseLand");
    }
}
