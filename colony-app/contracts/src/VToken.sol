// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VToken
 * @notice Long-term savings token for a SPICE colony. Non-transferable
 *         peer-to-peer — only the Colony (Fisc) can mint, burn, or move tokens.
 *         Citizens convert S → V via the Colony contract (max 200/month).
 */
contract VToken is ERC20, Ownable {
    uint256 public constant MAX_SAVE_PER_MONTH = 200 * 1e18;

    // citizen → epoch → amount saved this epoch
    mapping(address => mapping(uint256 => uint256)) public savedThisEpoch;

    uint256 public currentEpoch = 1;

    constructor(string memory _ticker)
        ERC20(string.concat(_ticker, " V-Token"), string.concat("V-", _ticker))
        Ownable(msg.sender) {}

    /**
     * @notice Convert S-tokens to V-tokens (called by Colony after burning S).
     *         Enforces 200 S max per epoch.
     */
    function mint(address citizen, uint256 amount) external onlyOwner {
        uint256 alreadySaved = savedThisEpoch[citizen][currentEpoch];
        require(alreadySaved + amount <= MAX_SAVE_PER_MONTH, "VToken: exceeds monthly savings limit");
        savedThisEpoch[citizen][currentEpoch] += amount;
        _mint(citizen, amount);
    }

    /**
     * @notice Redeem V-tokens back to S (Colony mints S after burning V).
     */
    function burn(address citizen, uint256 amount) external onlyOwner {
        _burn(citizen, amount);
    }

    /**
     * @notice Advance epoch (called with SToken.advanceEpoch each month).
     */
    function advanceEpoch() external onlyOwner {
        currentEpoch++;
    }

    /**
     * @notice Colony-authorised transfer only (dividends, inheritance).
     *         P2P transfers are blocked.
     */
    function colonyTransfer(address from, address to, uint256 amount) external onlyOwner {
        _transfer(from, to, amount);
    }

    /**
     * @notice Block all standard ERC-20 transfers — V-tokens are non-transferable.
     */
    function transfer(address, uint256) public pure override returns (bool) {
        revert("VToken: non-transferable");
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("VToken: non-transferable");
    }
}
