// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GToken
 * @notice Governance token for a SPICE colony. One per citizen, soulbound
 *         (non-transferable). Issued by the Colony contract on registration.
 *         Includes on-chain SVG metadata so the NFT renders in MetaMask.
 */
contract GToken is ERC721, Ownable {
    uint256 public nextTokenId = 1;
    string  public colonyName;

    // tokenId → issued timestamp
    mapping(uint256 => uint256) public issuedAt;

    constructor(string memory _colonyName)
        ERC721("SPICE Governance Token", "GSPICE")
        Ownable(msg.sender)
    {
        colonyName = _colonyName;
    }

    /**
     * @notice Mint a G-token to a new citizen. Only the Colony contract (owner) can call.
     */
    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        issuedAt[tokenId] = block.timestamp;
        _mint(to, tokenId);
    }

    /**
     * @notice Soulbound — transfers are blocked except minting (from == 0).
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0), "GToken: soulbound, non-transferable");
        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Returns the token ID held by an address, or 0 if none.
     */
    function tokenOf(address citizen) external view returns (uint256) {
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (_ownerOf(i) == citizen) return i;
        }
        return 0;
    }

    /**
     * @notice On-chain SVG metadata — renders in MetaMask and OpenSea without
     *         any external hosting.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "GToken: nonexistent token");

        string memory idStr = string.concat('#', _padded(tokenId));

        string memory svg = string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="#0a0a0a"/>',
            '<rect x="20" y="20" width="360" height="360" fill="none" stroke="#B8860B" stroke-width="1" rx="8"/>',
            '<text x="200" y="76" font-family="monospace" font-size="13" fill="#B8860B" text-anchor="middle" letter-spacing="4">',
            colonyName,
            '</text>',
            '<text x="200" y="232" font-family="monospace" font-size="140" fill="#B8860B" text-anchor="middle" opacity="0.08">G</text>',
            '<text x="200" y="268" font-family="monospace" font-size="11" fill="#555" text-anchor="middle" letter-spacing="3">GOVERNANCE TOKEN</text>',
            '<text x="200" y="318" font-family="monospace" font-size="38" fill="#ffffff" text-anchor="middle">',
            idStr,
            '</text>',
            '<text x="200" y="368" font-family="monospace" font-size="10" fill="#333" text-anchor="middle" letter-spacing="5">SPICE PROTOCOL</text>',
            '</svg>'
        );

        string memory json = string.concat(
            '{"name":"G-Token ', idStr, '",',
            '"description":"Governance token for ', colonyName, '. Soulbound, non-transferable.",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        );

        return string.concat('data:application/json;base64,', Base64.encode(bytes(json)));
    }

    /**
     * @dev Zero-pads a token ID to 4 digits: 1 → "0001", 12 → "0012".
     */
    function _padded(uint256 n) internal pure returns (string memory) {
        string memory s = Strings.toString(n);
        uint256 len = bytes(s).length;
        if (len >= 4) return s;
        if (len == 3) return string.concat('0', s);
        if (len == 2) return string.concat('00', s);
        return string.concat('000', s);
    }
}
