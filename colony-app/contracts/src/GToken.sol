// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GToken
 * @notice Governance token for a SPICE colony. One per citizen, soulbound
 *         (non-transferable). Issued by the Colony contract on registration.
 */
contract GToken is ERC721, Ownable {
    uint256 public nextTokenId = 1;

    // tokenId → issued timestamp
    mapping(uint256 => uint256) public issuedAt;

    constructor() ERC721("SPICE Governance Token", "GSPICE") Ownable(msg.sender) {}

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
}
