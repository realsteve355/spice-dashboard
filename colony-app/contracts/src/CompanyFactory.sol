// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "./Colony.sol";

interface ICompanyInitV2 {
    // v2 initialize — no equity in constructor; issued separately via Colony
    function initialize(
        address colony,
        string  calldata name,
        address secretary
    ) external;
}

interface IColonyV2 {
    function issueFoundingEquity(
        address   company,
        address   holder,
        uint256   stakeBps,
        uint256[] calldata vestingEpochs,
        uint256[] calldata trancheBps
    ) external returns (uint256 assetId, uint256 liabilityId);
}

/**
 * @title CompanyFactory
 * @notice Deploys and registers colony organisations as BeaconProxy smart-contract wallets.
 *
 * Each organisation is a BeaconProxy clone of CompanyImplementation.
 * The beacon owner can upgrade all organisations simultaneously with one transaction.
 *
 * Deploying an organisation (v2):
 *   1. Deploys a BeaconProxy pointing at the shared UpgradeableBeacon
 *   2. Calls initialize(colony, name, secretary) — no equity in init
 *   3. Mints an O-token to the organisation contract address (soulbound identity badge)
 *   4. Registers the organisation wallet with Colony
 *   5. Issues founding equity via Colony.issueFoundingEquity() for each holder
 *   6. Records the organisation in the factory directory
 *
 * Equity is recorded in AToken (via Colony.issueFoundingEquity); this factory
 * no longer passes equity arrays to initialize(). Colony.issueFoundingEquity()
 * uses factory-only access so equity can be issued before the company wallet
 * is fully wired.
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
    address public oToken;   // OToken contract address
    address public beacon;   // UpgradeableBeacon address

    CompanyRecord[] private _companies;

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
     * The caller becomes the founding secretary. Founding equity is issued
     * via Colony.issueFoundingEquity() — all equity state is stored in AToken.
     *
     * Founding shares are typically issued with no vesting schedule (fully
     * vested at issuance). The Secretary may later issue participant shares
     * with vesting via CompanyImplementation.issueVestingShares().
     *
     * @param name           Organisation display name
     * @param equityHolders  Founding equity holder addresses
     * @param equityStakes   Stakes in basis points (must sum to 10000)
     * @param orgType        0=Company, 1=MCC, 2=Cooperative, 3=Civic
     * @return companyId     Index in the factory directory
     */
    function deployCompany(
        string    calldata name,
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

        // 1. Deploy BeaconProxy — v2 initialize takes only colony, name, secretary
        bytes memory initData = abi.encodeCall(
            ICompanyInitV2.initialize,
            (address(colony), name, msg.sender)
        );
        address wallet = address(new BeaconProxy(beacon, initData));

        // 2. Mint O-token to the organisation wallet (soulbound identity badge)
        uint256 tokenId = colony.mintOrgToken(wallet, name, orgType);

        // 3. Register wallet with Colony so it can call Colony.send(), etc.
        colony.registerCompanyWallet(wallet);

        // 4. Issue founding equity for each holder (fully vested — no vesting schedule)
        //    All equity state stored in AToken via Colony.issueFoundingEquity().
        IColonyV2 col = IColonyV2(address(colony));
        for (uint256 i = 0; i < equityHolders.length; i++) {
            col.issueFoundingEquity(
                wallet,
                equityHolders[i],
                equityStakes[i],
                new uint256[](0),  // no vesting schedule — immediate full vest
                new uint256[](0)
            );
        }

        // 5. Record in factory directory
        companyId = _companies.length;
        _companies.push(CompanyRecord({
            name:         name,
            wallet:       wallet,
            founder:      msg.sender,
            oTokenId:     tokenId,
            registeredAt: block.timestamp
        }));

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
}
