// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./Colony.sol";

/**
 * @title MCCServices
 * @notice On-chain registry of MCC essential services and their prices.
 *         Only the colony founder (initial MCC board) may add, edit, or remove.
 *         In production this would be controlled by a G-token vote.
 */
contract MCCServices {
    struct Service {
        string name;
        string billing;
        string price;
        bool active;
    }

    Colony public colony;
    Service[] private _services;

    event ServiceAdded(uint256 indexed id, string name, string price);
    event ServiceEdited(uint256 indexed id, string name, string price);
    event ServiceRemoved(uint256 indexed id);

    constructor(address colonyAddress) {
        colony = Colony(payable(colonyAddress));
    }

    modifier onlyFounder() {
        require(msg.sender == colony.founder(), "MCCServices: not colony founder");
        _;
    }

    /**
     * @notice Add a new service to the MCC catalogue.
     */
    function addService(
        string calldata name,
        string calldata billing,
        string calldata price
    ) external onlyFounder returns (uint256 id) {
        require(bytes(name).length > 0, "MCCServices: name required");
        id = _services.length;
        _services.push(Service(name, billing, price, true));
        emit ServiceAdded(id, name, price);
    }

    /**
     * @notice Edit an existing service.
     */
    function editService(
        uint256 id,
        string calldata name,
        string calldata billing,
        string calldata price
    ) external onlyFounder {
        require(id < _services.length, "MCCServices: not found");
        require(_services[id].active, "MCCServices: service removed");
        _services[id].name    = name;
        _services[id].billing = billing;
        _services[id].price   = price;
        emit ServiceEdited(id, name, price);
    }

    /**
     * @notice Soft-remove a service (sets active = false).
     */
    function removeService(uint256 id) external onlyFounder {
        require(id < _services.length, "MCCServices: not found");
        _services[id].active = false;
        emit ServiceRemoved(id);
    }

    /**
     * @notice Returns all active services.
     */
    function getServices() external view returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory billings,
        string[] memory prices
    ) {
        uint256 count = 0;
        for (uint256 i = 0; i < _services.length; i++) {
            if (_services[i].active) count++;
        }
        ids      = new uint256[](count);
        names    = new string[](count);
        billings = new string[](count);
        prices   = new string[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < _services.length; i++) {
            if (_services[i].active) {
                ids[j]      = i;
                names[j]    = _services[i].name;
                billings[j] = _services[i].billing;
                prices[j]   = _services[i].price;
                j++;
            }
        }
    }

    /**
     * @notice Total service count (including removed).
     */
    function serviceCount() external view returns (uint256) {
        return _services.length;
    }
}
