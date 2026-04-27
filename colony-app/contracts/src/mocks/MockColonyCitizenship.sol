// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title MockColonyCitizenship
 * @notice Test fixture only — do not deploy in production.
 *         Implements the minimal `isCitizen(address)` surface that OToken's
 *         handOver() calls into. Lets tests toggle citizenship per address.
 */
contract MockColonyCitizenship {
    mapping(address => bool) public isCitizen;

    function setCitizen(address who, bool value) external {
        isCitizen[who] = value;
    }
}
