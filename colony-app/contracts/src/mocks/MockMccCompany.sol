// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title MockMccCompany
 * @notice Test fixture only. Implements the IMccCompany surface that
 *         Governance calls into for M-24 / M-25 / M-26 office-term equity.
 *         Records call sequences so tests can assert on them.
 */
contract MockMccCompany {
    uint256 public nextAssetId = 100; // start high so it doesn't collide with anything

    struct Issued {
        address holder;
        uint256 stakeBps;
        uint256 assetId;
    }
    struct Redeemed {
        uint256 assetId;
    }

    Issued[]   public issuedRecord;
    Redeemed[] public redeemedRecord;

    /// @notice When true, redeemOfficeEquity reverts.
    bool public redeemShouldRevert;

    /// @notice When true, issueOfficeEquity reverts.
    bool public issueShouldRevert;

    function setRedeemRevert(bool v) external { redeemShouldRevert = v; }
    function setIssueRevert(bool v)  external { issueShouldRevert  = v; }

    function issueOfficeEquity(address holder, uint256 stakeBps) external returns (uint256 assetId) {
        require(!issueShouldRevert, "Mock: issue forced revert");
        assetId = nextAssetId++;
        issuedRecord.push(Issued({ holder: holder, stakeBps: stakeBps, assetId: assetId }));
    }

    function redeemOfficeEquity(uint256 assetId) external returns (uint256 vPaid) {
        require(!redeemShouldRevert, "Mock: redeem forced revert");
        redeemedRecord.push(Redeemed({ assetId: assetId }));
        vPaid = 0;
    }

    function issuedCount()   external view returns (uint256) { return issuedRecord.length; }
    function redeemedCount() external view returns (uint256) { return redeemedRecord.length; }
}
