// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title OToken
 * @notice Organisation identity token for a SPICE colony.
 *
 * One O-token per registered organisation (company, MCC, cooperative, civic).
 * Held by the organisation's authorised representative — company secretary,
 * MCC chair, etc. Transfers to the incoming representative when the role
 * changes hands via handOver().
 *
 * Unlike G-tokens (soulbound to a citizen for life), O-tokens are role-bound:
 * they move between citizens when authority passes to a successor.
 * Standard ERC-721 transfers are blocked — only handOver() is permitted,
 * and only to a registered citizen of this colony.
 *
 * The O-token is NOT a voting instrument. It is an identity and authority
 * token: cryptographic proof of who speaks for an organisation on-chain.
 *
 * Minted by the Colony contract (owner) — once for the MCC on colony
 * deployment, and once per company via CompanyFactory on registration.
 */
contract OToken is ERC721, Ownable {

    // ── Types ────────────────────────────────────────────────────────────────

    enum OrgType { Company, MCC, Cooperative, Civic }

    struct OrgInfo {
        string  name;
        OrgType orgType;
        uint256 registeredAt;
    }

    // ── State ────────────────────────────────────────────────────────────────

    address public colony;       // Colony contract — citizen verification
    address public electionAuthority;  // Governance — may force-transfer MCC O-token after election (M-22)
    uint256 public nextTokenId = 1;

    mapping(uint256 => OrgInfo) public orgs;

    // ── Events ───────────────────────────────────────────────────────────────

    event OrgRegistered(uint256 indexed tokenId, address indexed holder, OrgType orgType, string name);
    event RoleHandedOver(uint256 indexed tokenId, address indexed from, address indexed to);
    event ElectionAuthoritySet(address indexed authority);

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(string memory _colonyName, address _colony)
        ERC721(
            string.concat(_colonyName, " Org"),
            "OTOKEN"
        )
        Ownable(msg.sender)
    {
        colony = _colony;
    }

    // ── Minting ──────────────────────────────────────────────────────────────

    /**
     * @notice Mint an O-token to an organisation's initial representative.
     *         Only the Colony contract (owner) can call.
     * @param to      Initial holder — founding secretary or MCC chair
     * @param name    Organisation display name
     * @param orgType Company / MCC / Cooperative / Civic
     */
    function mint(
        address to,
        string calldata name,
        OrgType orgType
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        orgs[tokenId] = OrgInfo({
            name:         name,
            orgType:      orgType,
            registeredAt: block.timestamp
        });
        _mint(to, tokenId);
        emit OrgRegistered(tokenId, to, orgType, name);
    }

    // ── Role transfer ────────────────────────────────────────────────────────

    /**
     * @notice Hand the O-token to the incoming representative.
     *         Only the current holder may call. Recipient must be a
     *         registered citizen of this colony.
     * @param tokenId  The O-token to transfer
     * @param incoming The new secretary / chair taking the role
     */
    function handOver(uint256 tokenId, address incoming) external {
        require(ownerOf(tokenId) == msg.sender, "OToken: not the current holder");
        require(_isCitizen(incoming),            "OToken: recipient is not a citizen");
        _transfer(msg.sender, incoming, tokenId);
        emit RoleHandedOver(tokenId, msg.sender, incoming);
    }

    // ── M-22: election-driven handover ──────────────────────────────────────

    /**
     * @notice Wire a Governance contract as the election authority.
     *         When set, that contract may force-transfer the MCC O-token
     *         (tokenId == 1, orgType == MCC) to a newly-elected holder via
     *         electionHandOver(). Only the contract owner (Colony) may set this.
     */
    function setElectionAuthority(address authority) external onlyOwner {
        electionAuthority = authority;
        emit ElectionAuthoritySet(authority);
    }

    /**
     * @notice Force-transfer the MCC O-token to a newly-elected holder.
     *         Only the configured electionAuthority may call. Only valid for
     *         the MCC O-token. Recipient must be a citizen.
     */
    function electionHandOver(uint256 tokenId, address incoming) external {
        require(msg.sender == electionAuthority,           "OToken: not election authority");
        require(electionAuthority != address(0),           "OToken: authority not set");
        require(orgs[tokenId].orgType == OrgType.MCC,      "OToken: only MCC O-token");
        require(_isCitizen(incoming),                       "OToken: recipient is not a citizen");
        address from = ownerOf(tokenId);
        if (from == incoming) return;  // already in place — no-op
        _transfer(from, incoming, tokenId);
        emit RoleHandedOver(tokenId, from, incoming);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice Returns all O-token IDs currently held by an address.
     *         A citizen may hold tokens for multiple organisations.
     */
    function tokensOf(address holder) external view returns (uint256[] memory) {
        uint256 count = balanceOf(holder);
        uint256[] memory ids = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (_ownerOf(i) == holder) ids[idx++] = i;
        }
        return ids;
    }

    /**
     * @notice On-chain SVG metadata — renders in MetaMask without external hosting.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "OToken: nonexistent token");

        OrgInfo memory org = orgs[tokenId];
        string memory typeLabel = _typeLabel(org.orgType);
        string memory typeColor = _typeColor(org.orgType);
        string memory idStr = string.concat('#', Strings.toString(tokenId));

        string memory svg = string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="#0a0a0a"/>',
            '<rect x="20" y="20" width="360" height="360" fill="none" stroke="', typeColor, '" stroke-width="1" rx="8"/>',
            '<text x="200" y="76" font-family="monospace" font-size="13" fill="', typeColor,
                '" text-anchor="middle" letter-spacing="4">', org.name, '</text>',
            '<text x="200" y="232" font-family="monospace" font-size="140" fill="', typeColor,
                '" text-anchor="middle" opacity="0.08">O</text>',
            '<text x="200" y="268" font-family="monospace" font-size="11" fill="#555" text-anchor="middle" letter-spacing="3">',
                typeLabel, '</text>',
            '<text x="200" y="318" font-family="monospace" font-size="38" fill="#ffffff" text-anchor="middle">',
                idStr, '</text>',
            '<text x="200" y="368" font-family="monospace" font-size="10" fill="#333" text-anchor="middle" letter-spacing="5">',
                'SPICE PROTOCOL</text>',
            '</svg>'
        );

        string memory json = string.concat(
            '{"name":"O-Token ', idStr, '",',
            '"description":"Organisation token for ', org.name,
                ' (', typeLabel, '). Role-transferable between colony citizens.",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        );

        return string.concat('data:application/json;base64,', Base64.encode(bytes(json)));
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    /**
     * @dev Block all standard ERC-721 transfer paths. Use handOver() instead.
     *      Minting and burning (to/from address(0)) are still handled normally
     *      by the parent _update — the revert only fires on actual transfers.
     */
    function transferFrom(address, address, uint256) public pure override {
        revert("OToken: use handOver()");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("OToken: use handOver()");
    }

    function _isCitizen(address addr) internal view returns (bool) {
        (bool ok, bytes memory data) = colony.staticcall(
            abi.encodeWithSignature("isCitizen(address)", addr)
        );
        return ok && abi.decode(data, (bool));
    }

    function _typeLabel(OrgType t) internal pure returns (string memory) {
        if (t == OrgType.MCC)         return "MCC";
        if (t == OrgType.Cooperative) return "COOPERATIVE";
        if (t == OrgType.Civic)       return "CIVIC";
        return "COMPANY";
    }

    function _typeColor(OrgType t) internal pure returns (string memory) {
        if (t == OrgType.MCC)         return "#8b5cf6"; // purple
        if (t == OrgType.Cooperative) return "#16a34a"; // green
        if (t == OrgType.Civic)       return "#3b82f6"; // blue
        return "#B8860B";                               // gold — companies
    }
}
