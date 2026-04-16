// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "./Colony.sol";

interface ICompanyImpl {
    function initialize(
        address colony,
        string  calldata name,
        address secretary,
        address[] calldata holders,
        uint256[] calldata stakes
    ) external;
}

/**
 * @title CompanyFactory
 * @notice Deploys and registers colony organisations as BeaconProxy smart-contract wallets.
 *
 * Each organisation is a BeaconProxy clone of CompanyImplementation.
 * The beacon owner can upgrade all organisations simultaneously with one transaction.
 *
 * Deploying an organisation:
 *   1. Deploys a BeaconProxy pointing at the shared UpgradeableBeacon
 *   2. Calls initialize() on the proxy — wires colony, name, secretary, equity table
 *   3. Mints an O-token to the organisation's contract address (not the secretary)
 *   4. Registers the organisation wallet with Colony so it can call Colony.send()
 *   5. Records the organisation in this factory's directory
 *
 * The O-token is the organisation's soulbound identity badge — held permanently
 * by the organisation contract. It is not an authority key. The secretary role
 * is stored as an address inside the organisation contract and changed via
 * CompanyImplementation.changeSecretary().
 *
 * Upgrade path:
 *   The UpgradeableBeacon is deployed separately and owned by the deployer wallet.
 *   To upgrade all organisations: deployer calls beacon.upgradeTo(newImpl) directly.
 *   Ownership can later be transferred to a governance contract.
 */
contract CompanyFactory {

    // ── Types ────────────────────────────────────────────────────────────────

    struct CompanyRecord {
        string  name;
        address wallet;        // organisation contract address (BeaconProxy)
        address founder;       // citizen who registered it
        uint256 oTokenId;      // O-token minted for this organisation
        uint256 registeredAt;
    }

    // ── State ────────────────────────────────────────────────────────────────

    Colony  public colony;
    address public oToken;           // OToken contract address
    address public beacon;           // UpgradeableBeacon address

    CompanyRecord[] private _companies;

    // equity holder address → IDs of organisations where they hold equity
    mapping(address => uint256[]) private _companiesOf;

    // ── Events ───────────────────────────────────────────────────────────────

    event CompanyDeployed(
        uint256 indexed id,
        address indexed wallet,
        string  name,
        address indexed founder,
        uint256 oTokenId
    );

    // ── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param colonyAddress   Deployed Colony contract
     * @param oTokenAddress   OToken contract (owned by Colony)
     * @param beaconAddress   UpgradeableBeacon pointing at CompanyImplementation
     */
    constructor(
        address colonyAddress,
        address oTokenAddress,
        address beaconAddress
    ) {
        colony = Colony(payable(colonyAddress));
        oToken = oTokenAddress;
        beacon = beaconAddress;
    }

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyCitizen() {
        require(colony.isCitizen(msg.sender), "CompanyFactory: not a citizen");
        _;
    }

    // ── Deploy ───────────────────────────────────────────────────────────────

    /**
     * @notice Deploy a new organisation and register it with the colony.
     *
     * The caller becomes the founding secretary. Equity holders are set
     * at deploy time — use CompanyImplementation.proposeShareTransfer() to
     * change ownership after deployment.
     *
     * @param name           Organisation display name
     * @param equityHolders  Initial equity holder addresses
     * @param equityStakes   Stakes in basis points (must sum to 10000)
     * @param orgType        0=Company, 1=MCC, 2=Cooperative, 3=Civic
     * @return companyId     Index in the factory directory
     */
    function deployCompany(
        string   calldata name,
        address[] calldata equityHolders,
        uint256[] calldata equityStakes,
        uint8              orgType
    ) external onlyCitizen returns (uint256 companyId) {
        require(bytes(name).length > 0,                      "CompanyFactory: name required");
        require(equityHolders.length > 0,                    "CompanyFactory: no holders");
        require(equityHolders.length == equityStakes.length, "CompanyFactory: length mismatch");

        uint256 total = 0;
        for (uint256 i = 0; i < equityStakes.length; i++) total += equityStakes[i];
        require(total == 10000, "CompanyFactory: stakes must sum to 10000 bps");

        // 1. Build initialisation calldata
        bytes memory initData = abi.encodeCall(
            ICompanyImpl.initialize,
            (address(colony), name, msg.sender, equityHolders, equityStakes)
        );

        // 2. Deploy BeaconProxy — initialization runs immediately inside the constructor
        address wallet = address(new BeaconProxy(beacon, initData));

        // 3. Mint O-token to the organisation wallet (soulbound identity badge)
        uint256 tokenId = colony.mintOrgToken(wallet, name, orgType);

        // 4. Register wallet with Colony so it can call Colony.send()
        colony.registerCompanyWallet(wallet);

        // 5. Record in directory
        companyId = _companies.length;
        _companies.push(CompanyRecord({
            name:         name,
            wallet:       wallet,
            founder:      msg.sender,
            oTokenId:     tokenId,
            registeredAt: block.timestamp
        }));

        // Index equity holders for Dashboard "My Companies" lookup
        for (uint256 i = 0; i < equityHolders.length; i++) {
            _companiesOf[equityHolders[i]].push(companyId);
        }

        emit CompanyDeployed(companyId, wallet, name, msg.sender, tokenId);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function companyCount() external view returns (uint256) {
        return _companies.length;
    }

    function getCompany(uint256 id) external view returns (
        string  memory name,
        address wallet,
        address founder,
        uint256 oTokenId,
        uint256 registeredAt
    ) {
        CompanyRecord storage c = _companies[id];
        return (c.name, c.wallet, c.founder, c.oTokenId, c.registeredAt);
    }

    /**
     * @notice Returns company IDs where a wallet held equity at registration time.
     * @dev    This index is set at deploy time and does not update when shares
     *         are transferred via proposeShareTransfer(). To find all current
     *         holders of a company, read ShareTransferExecuted events from the
     *         company contract.
     */
    function getCompaniesOf(address wallet) external view returns (uint256[] memory) {
        return _companiesOf[wallet];
    }
}
