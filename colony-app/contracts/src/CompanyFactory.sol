// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Colony.sol";
import "./OToken.sol";

interface ICompanyImpl {
    function initialize(
        address colony,
        address oToken,
        uint256 oTokenId,
        string calldata name,
        address[] calldata holders,
        uint256[] calldata stakes
    ) external;
}

/**
 * @title CompanyFactory
 * @notice Deploys and registers colony companies as smart-contract wallets.
 *
 * Each company is an EIP-1167 minimal clone of CompanyImplementation.
 * Deploying a company:
 *   1. Clones the CompanyImplementation template (~45k gas on Base L2, ~$0.01)
 *   2. Mints a Company O-token to the founding secretary
 *   3. Initialises the clone with equity table + O-token reference
 *   4. Registers the clone address with Colony as a trusted company wallet
 *   5. Records the company in this factory's directory
 *
 * Replaces CompanyRegistry — the on-chain directory is now the factory itself.
 * The CompanyRegistry contract is superseded and should not be used for new
 * deployments.
 */
contract CompanyFactory {
    using Clones for address;

    // ── Types ────────────────────────────────────────────────────────────────

    struct CompanyRecord {
        string  name;
        address wallet;       // company contract address (the clone)
        address founder;      // citizen who registered it
        uint256 oTokenId;     // O-token minted for this company
        uint256 registeredAt;
    }

    // ── State ────────────────────────────────────────────────────────────────

    Colony  public colony;
    OToken  public oToken;
    address public implementation;   // CompanyImplementation template (deployed once)

    CompanyRecord[] private _companies;

    // equity holder address → IDs of companies they hold equity in
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
     * @param colonyAddress          Deployed Colony contract
     * @param oTokenAddress          OToken contract deployed by that Colony
     * @param implementationAddress  Deployed CompanyImplementation template
     */
    constructor(
        address colonyAddress,
        address oTokenAddress,
        address implementationAddress
    ) {
        colony         = Colony(payable(colonyAddress));
        oToken         = OToken(oTokenAddress);
        implementation = implementationAddress;
    }

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyCitizen() {
        require(colony.isCitizen(msg.sender), "CompanyFactory: not a citizen");
        _;
    }

    // ── Deploy ───────────────────────────────────────────────────────────────

    /**
     * @notice Deploy a new company and register it with the colony.
     *
     * @param name           Company display name
     * @param equityHolders  Wallet addresses of equity holders (founding secretary
     *                       must be included)
     * @param equityStakes   Stakes in basis points — must sum to exactly 10000
     * @return companyId     Index of the new company in the factory directory
     */
    function deployCompany(
        string calldata name,
        address[] calldata equityHolders,
        uint256[] calldata equityStakes
    ) external onlyCitizen returns (uint256 companyId) {
        require(bytes(name).length > 0,                     "CompanyFactory: name required");
        require(equityHolders.length > 0,                   "CompanyFactory: no holders");
        require(equityHolders.length == equityStakes.length, "CompanyFactory: length mismatch");

        uint256 total = 0;
        for (uint256 i = 0; i < equityStakes.length; i++) {
            total += equityStakes[i];
        }
        require(total == 10000, "CompanyFactory: stakes must sum to 10000 bps");

        // 1. Clone the template (~45k gas on L2)
        address wallet = implementation.clone();

        // 2. Mint O-token for this company — msg.sender becomes the founding secretary
        uint256 tokenId = oToken.mint(msg.sender, name, OToken.OrgType.Company);

        // 3. Initialise the company contract
        ICompanyImpl(wallet).initialize(
            address(colony),
            address(oToken),
            tokenId,
            name,
            equityHolders,
            equityStakes
        );

        // 4. Register the wallet with Colony so it can call Colony.send()
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

        for (uint256 i = 0; i < equityHolders.length; i++) {
            _companiesOf[equityHolders[i]].push(companyId);
        }

        emit CompanyDeployed(companyId, wallet, name, msg.sender, tokenId);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice Total companies deployed through this factory.
     */
    function companyCount() external view returns (uint256) {
        return _companies.length;
    }

    /**
     * @notice Get company record by ID.
     */
    function getCompany(uint256 id) external view returns (
        string memory name,
        address wallet,
        address founder,
        uint256 oTokenId,
        uint256 registeredAt
    ) {
        CompanyRecord storage c = _companies[id];
        return (c.name, c.wallet, c.founder, c.oTokenId, c.registeredAt);
    }

    /**
     * @notice Returns company IDs where a wallet holds equity.
     */
    function getCompaniesOf(address wallet) external view returns (uint256[] memory) {
        return _companiesOf[wallet];
    }
}
