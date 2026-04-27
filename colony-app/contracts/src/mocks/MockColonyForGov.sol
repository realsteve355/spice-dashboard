// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title MockColonyForGov
 * @notice Test fixture only. Implements the IColony surface that Governance
 *         calls into: isCitizen, dateOfBirth, joinedAt, and issueObligationGov.
 */
contract MockColonyForGov {
    mapping(address => bool)    public isCitizen;
    mapping(address => uint256) public dateOfBirth; // year (e.g. 1990)
    mapping(address => uint256) public joinedAt;    // unix timestamp

    uint256 public lastObligationAssetId;
    uint256 public lastObligationLiabilityId;

    function setCitizen(address who, bool value) external {
        isCitizen[who] = value;
    }

    function setBirthYear(address who, uint256 year) external {
        dateOfBirth[who] = year;
    }

    function setJoinedAt(address who, uint256 ts) external {
        joinedAt[who] = ts;
    }

    function setObligationReturn(uint256 a, uint256 l) external {
        lastObligationAssetId = a;
        lastObligationLiabilityId = l;
    }

    function issueObligationGov(
        address /*creditor*/,
        address /*obligor*/,
        uint256 /*monthlyAmountS*/,
        uint256 /*totalEpochs*/,
        uint256 /*collateralId*/
    ) external view returns (uint256 assetId, uint256 liabilityId) {
        return (lastObligationAssetId, lastObligationLiabilityId);
    }
}
