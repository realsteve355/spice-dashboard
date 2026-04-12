// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./Colony.sol";

/**
 * @title MCCBilling
 * @notice Tracks monthly MCC bills per citizen. Founder sets bill amounts;
 *         citizens pay by calling colony.send(founder, bill, "MCC bill");
 *         founder confirms receipt via recordPayment().
 *
 *   setBill(citizen, amountS)           — set one citizen's bill (S, not wei)
 *   setBillBatch(citizens[], amounts[]) — bulk set bills
 *   recordPayment(citizen)              — founder confirms payment, clears bill
 *   resetMonth()                        — founder resets monthly revenue counter
 */
contract MCCBilling {
    Colony public colony;

    // citizen address → current bill in S-token wei
    mapping(address => uint256) public billOf;

    // Accumulated S-wei received this epoch
    uint256 public totalRevenueMTD;

    event BillSet(address indexed citizen, uint256 amountWei);
    event BillCleared(address indexed citizen);
    event PaymentRecorded(address indexed citizen, uint256 amountWei);
    event MonthReset();

    constructor(address colonyAddr) {
        colony = Colony(payable(colonyAddr));
    }

    modifier onlyFounder() {
        require(msg.sender == colony.founder(), "MCCBilling: not founder");
        _;
    }

    /**
     * @notice Set the current-epoch bill for one citizen (amount in whole S-tokens).
     */
    function setBill(address citizen, uint256 amountS) external onlyFounder {
        require(colony.isCitizen(citizen), "MCCBilling: not a citizen");
        billOf[citizen] = amountS * 1e18;
        emit BillSet(citizen, amountS * 1e18);
    }

    /**
     * @notice Bulk-set bills. Arrays must be equal length.
     */
    function setBillBatch(
        address[] calldata citizens,
        uint256[] calldata amountsS
    ) external onlyFounder {
        require(citizens.length == amountsS.length, "MCCBilling: length mismatch");
        for (uint256 i = 0; i < citizens.length; i++) {
            billOf[citizens[i]] = amountsS[i] * 1e18;
            emit BillSet(citizens[i], amountsS[i] * 1e18);
        }
    }

    /**
     * @notice Founder confirms a citizen has paid their bill.
     *         Call this after seeing the colony.send() transaction on-chain.
     */
    function recordPayment(address citizen) external onlyFounder {
        uint256 amount = billOf[citizen];
        require(amount > 0, "MCCBilling: no outstanding bill");
        totalRevenueMTD += amount;
        billOf[citizen] = 0;
        emit PaymentRecorded(citizen, amount);
        emit BillCleared(citizen);
    }

    /**
     * @notice Clear a bill without recording payment (e.g. waived or error).
     */
    function clearBill(address citizen) external onlyFounder {
        billOf[citizen] = 0;
        emit BillCleared(citizen);
    }

    /**
     * @notice Reset monthly revenue counter at epoch start.
     */
    function resetMonth() external onlyFounder {
        totalRevenueMTD = 0;
        emit MonthReset();
    }

    /**
     * @notice Read bills for a list of citizens in one call.
     */
    function getBills(address[] calldata citizens)
        external
        view
        returns (uint256[] memory amounts)
    {
        amounts = new uint256[](citizens.length);
        for (uint256 i = 0; i < citizens.length; i++) {
            amounts[i] = billOf[citizens[i]];
        }
    }
}
