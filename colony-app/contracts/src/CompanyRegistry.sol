// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./Colony.sol";

/**
 * @title CompanyRegistry
 * @notice Fisc registration for colony companies.
 *         Any citizen may register a company. Equity stakes are recorded
 *         on-chain in basis points (10000 = 100%).
 */
contract CompanyRegistry {
    struct Company {
        string  name;
        address founder;
        uint256 registeredAt;
        address[] equityHolders;
        uint256[] equityStakes;   // basis points, must sum to 10000
    }

    Colony public colony;

    Company[] private _companies;

    // wallet → company IDs where they hold equity
    mapping(address => uint256[]) private _companiesOf;

    event CompanyRegistered(uint256 indexed id, string name, address indexed founder);

    constructor(address colonyAddress) {
        colony = Colony(payable(colonyAddress));
    }

    modifier onlyCitizen() {
        require(colony.isCitizen(msg.sender), "CompanyRegistry: not a citizen");
        _;
    }

    /**
     * @notice Register a new company with the Fisc.
     * @param name           Company name
     * @param equityHolders  Wallet addresses of equity holders (founder must be included)
     * @param equityStakes   Stakes in basis points — must sum to exactly 10000
     */
    function register(
        string calldata name,
        address[] calldata equityHolders,
        uint256[] calldata equityStakes
    ) external onlyCitizen returns (uint256 companyId) {
        require(bytes(name).length > 0, "CompanyRegistry: name required");
        require(equityHolders.length > 0, "CompanyRegistry: no holders");
        require(equityHolders.length == equityStakes.length, "CompanyRegistry: length mismatch");

        uint256 total = 0;
        for (uint256 i = 0; i < equityStakes.length; i++) {
            total += equityStakes[i];
        }
        require(total == 10000, "CompanyRegistry: stakes must sum to 10000 bps");

        companyId = _companies.length;
        Company storage c = _companies.push();
        c.name         = name;
        c.founder      = msg.sender;
        c.registeredAt = block.timestamp;

        for (uint256 i = 0; i < equityHolders.length; i++) {
            c.equityHolders.push(equityHolders[i]);
            c.equityStakes.push(equityStakes[i]);
            _companiesOf[equityHolders[i]].push(companyId);
        }

        emit CompanyRegistered(companyId, name, msg.sender);
    }

    /**
     * @notice Total registered companies.
     */
    function companyCount() external view returns (uint256) {
        return _companies.length;
    }

    /**
     * @notice Returns company details.
     */
    function getCompany(uint256 id) external view returns (
        string memory name,
        address founder,
        uint256 registeredAt,
        address[] memory equityHolders,
        uint256[] memory equityStakes
    ) {
        Company storage c = _companies[id];
        return (c.name, c.founder, c.registeredAt, c.equityHolders, c.equityStakes);
    }

    /**
     * @notice Returns company IDs where a wallet holds equity.
     */
    function getCompaniesOf(address wallet) external view returns (uint256[] memory) {
        return _companiesOf[wallet];
    }
}
