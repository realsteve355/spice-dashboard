// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SToken
 * @notice Spending token for a SPICE colony. Issued monthly by the Colony
 *         contract as UBI. Balances reset to 1000 on the 1st of each month
 *         (enforced off-chain by the Colony contract calling monthlyReset).
 *
 *         S-tokens have no external value — pure colony scrip.
 */
contract SToken is ERC20, Ownable {
    uint256 public constant UBI_AMOUNT = 1000 * 1e18;

    // Track which epoch (month) each address last received UBI
    mapping(address => uint256) public lastUbiEpoch;

    // Current epoch — incremented by Colony on monthly reset
    uint256 public currentEpoch = 1;

    constructor() ERC20("SPICE S-Token", "SSPICE") Ownable(msg.sender) {}

    /**
     * @notice Issue monthly UBI to a citizen. Only Colony (owner) can call.
     *         Idempotent — cannot double-issue in same epoch.
     */
    function issueUbi(address citizen) external onlyOwner {
        require(lastUbiEpoch[citizen] < currentEpoch, "SToken: UBI already issued this month");
        lastUbiEpoch[citizen] = currentEpoch;
        _mint(citizen, UBI_AMOUNT);
    }

    /**
     * @notice Advance to the next monthly epoch. Colony calls this each month.
     *         Does NOT burn existing balances — unspent S carry over (by design
     *         for the demo; production would reset via burn-and-reissue).
     */
    function advanceEpoch() external onlyOwner {
        currentEpoch++;
    }

    /**
     * @notice Mint a raw amount (used for V→S redemption, not subject to epoch check).
     */
    function issueUbiRaw(address citizen, uint256 amount) external onlyOwner {
        _mint(citizen, amount);
    }

    /**
     * @notice Burn tokens from a citizen (e.g. MCC bill deduction). Only Colony.
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /**
     * @notice Colony-authorised transfer (payment between citizens/companies).
     */
    function colonyTransfer(address from, address to, uint256 amount) external onlyOwner {
        _transfer(from, to, amount);
    }
}
