// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title CompanyImplementation
 * @notice Template contract for SPICE colony companies.
 *
 * Each registered company is deployed as an EIP-1167 minimal clone of this
 * contract via CompanyFactory. The clone's address IS the company wallet —
 * it holds S-tokens, V-tokens, and any A-tokens registered to the company.
 *
 * The "company secretary" is defined as whoever currently holds the O-token
 * minted for this company. If the O-token changes hands via handOver(), the
 * new holder immediately becomes the authorised secretary — no update needed
 * to this contract.
 *
 * Secretary-gated operations:
 *   pay(to, amount, note)    — send S-tokens to another address
 *   convertToV(amount)       — convert S → V (no monthly cap for companies)
 *   distributeVDividend()    — distribute all V balance to equity holders
 */

interface IColony {
    function send(address to, uint256 amount, string calldata note) external;
    function saveToVCompany(uint256 amount) external;
    function transferVDividend(address to, uint256 amount) external;
    function sToken() external view returns (address);
    function vToken() external view returns (address);
}

interface IERC721Minimal {
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
}

contract CompanyImplementation {
    // ── State ────────────────────────────────────────────────────────────────

    address public colony;
    address public oToken;
    uint256 public oTokenId;
    string  public name;

    address[] public equityHolders;
    uint256[] public equityStakes;  // basis points; sum = 10000

    bool private _initialized;

    // ── Events ───────────────────────────────────────────────────────────────

    event PaymentMade(address indexed to, uint256 amount, string note);
    event ConvertedToV(uint256 amount);
    event DividendDistributed(uint256 totalAmount, uint256 holderCount);

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlySecretary() {
        require(msg.sender == secretary(), "Company: not secretary");
        _;
    }

    // ── Initialisation ───────────────────────────────────────────────────────

    /**
     * @notice Called once by CompanyFactory after cloning. Replaces a constructor.
     * @param _colony         Colony contract address
     * @param _oToken         OToken contract address
     * @param _oTokenId       O-token ID minted for this company
     * @param _name           Company display name
     * @param _holders        Equity holder addresses
     * @param _stakes         Stakes in basis points (must sum to 10000)
     */
    function initialize(
        address _colony,
        address _oToken,
        uint256 _oTokenId,
        string calldata _name,
        address[] calldata _holders,
        uint256[] calldata _stakes
    ) external {
        require(!_initialized, "Company: already initialized");
        _initialized = true;

        colony   = _colony;
        oToken   = _oToken;
        oTokenId = _oTokenId;
        name     = _name;

        for (uint256 i = 0; i < _holders.length; i++) {
            equityHolders.push(_holders[i]);
            equityStakes.push(_stakes[i]);
        }
    }

    // ── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice Current company secretary — whoever holds the O-token for this company.
     */
    function secretary() public view returns (address) {
        return IERC721Minimal(oToken).ownerOf(oTokenId);
    }

    /**
     * @notice S-token balance of this company wallet.
     */
    function sBalance() external view returns (uint256) {
        return IERC20Minimal(IColony(colony).sToken()).balanceOf(address(this));
    }

    /**
     * @notice V-token balance of this company wallet.
     */
    function vBalance() external view returns (uint256) {
        return IERC20Minimal(IColony(colony).vToken()).balanceOf(address(this));
    }

    /**
     * @notice Returns equity table — holders and their stakes in basis points.
     */
    function getEquityTable() external view returns (
        address[] memory holders,
        uint256[] memory stakes
    ) {
        return (equityHolders, equityStakes);
    }

    /**
     * @notice Number of equity holders.
     */
    function holderCount() external view returns (uint256) {
        return equityHolders.length;
    }

    // ── Secretary operations ─────────────────────────────────────────────────

    /**
     * @notice Send S-tokens from this company wallet to any address.
     *         Routed through Colony.send() so event logging is consistent.
     */
    function pay(
        address to,
        uint256 amount,
        string calldata note
    ) external onlySecretary {
        IColony(colony).send(to, amount, note);
        emit PaymentMade(to, amount, note);
    }

    /**
     * @notice Convert company S-tokens to V-tokens.
     *         No monthly cap — companies convert all net earnings.
     */
    function convertToV(uint256 amount) external onlySecretary {
        IColony(colony).saveToVCompany(amount);
        emit ConvertedToV(amount);
    }

    /**
     * @notice Distribute the entire V-token balance to equity holders pro-rata.
     *         Secretary calls at end of earnings period (typically monthly).
     */
    function distributeVDividend() external onlySecretary {
        uint256 total = IERC20Minimal(IColony(colony).vToken()).balanceOf(address(this));
        require(total > 0, "Company: no V-tokens to distribute");

        for (uint256 i = 0; i < equityHolders.length; i++) {
            uint256 share = (total * equityStakes[i]) / 10000;
            if (share > 0) {
                IColony(colony).transferVDividend(equityHolders[i], share);
            }
        }

        emit DividendDistributed(total, equityHolders.length);
    }
}
