// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title MockColonyForMcc
 * @notice Test fixture only. Implements just enough of the Colony surface that
 *         MCCBilling, MCCServices, and MCCTreasury read against — `founder()`,
 *         `isCitizen(address)`, and `sToken()`.
 */
contract MockColonyForMcc {
    address public founder;
    address public sToken;
    mapping(address => bool) public isCitizen;

    constructor(address _founder, address _sToken) {
        founder = _founder;
        sToken  = _sToken;
    }

    function setCitizen(address who, bool value) external { isCitizen[who] = value; }
    function setFounder(address who) external { founder = who; }
    function setSToken(address t) external { sToken = t; }
}
