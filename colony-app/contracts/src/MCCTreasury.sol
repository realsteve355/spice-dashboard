// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./Colony.sol";

/**
 * @title MCCTreasury
 * @notice The MCC's on-chain wallet — separate from the founder's personal wallet.
 *         Citizens pay their MCC bills here. The FD (Financial Director) and Chair
 *         can withdraw funds; only Chair (or founder) can assign roles.
 *
 * Roles:
 *   ROLE_FD    (1) — Financial Director: can withdraw, confirm bills
 *   ROLE_CHAIR (2) — Chair: all FD powers plus grant/revoke roles
 *
 * The colony founder always has implicit CHAIR powers and cannot be locked out.
 */
contract MCCTreasury {
    Colony  public immutable colony;
    address public immutable sToken;

    uint8 public constant ROLE_NONE  = 0;
    uint8 public constant ROLE_FD    = 1;
    uint8 public constant ROLE_CHAIR = 2;

    mapping(address => uint8) public roleOf;
    address[] private _members;

    event RoleSet(address indexed account, uint8 role);
    event Withdrawal(address indexed to, uint256 amount, string reason);

    modifier onlyChair() {
        require(
            msg.sender == colony.founder() || roleOf[msg.sender] == ROLE_CHAIR,
            "MCCTreasury: not Chair"
        );
        _;
    }

    modifier onlyFDOrAbove() {
        require(
            msg.sender == colony.founder() || roleOf[msg.sender] >= ROLE_FD,
            "MCCTreasury: not FD"
        );
        _;
    }

    constructor(address _colony) {
        colony = Colony(_colony);
        sToken = address(Colony(_colony).sToken());
    }

    // ── Role management ─────────────────────────────────────────────────────

    /**
     * @notice Grant or revoke an MCC role. Chair or founder only.
     *         Pass role=0 to revoke.
     */
    function setRole(address account, uint8 role) external onlyChair {
        require(role <= ROLE_CHAIR, "MCCTreasury: invalid role");
        if (roleOf[account] == ROLE_NONE && role > ROLE_NONE) {
            _members.push(account);
        }
        roleOf[account] = role;
        emit RoleSet(account, role);
    }

    // ── Treasury ops ─────────────────────────────────────────────────────────

    /**
     * @notice Withdraw S-tokens from the treasury. FD or Chair only.
     */
    function withdraw(address to, uint256 amount, string calldata reason)
        external onlyFDOrAbove
    {
        (bool ok, bytes memory data) = sToken.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "MCCTreasury: transfer failed");
        emit Withdrawal(to, amount, reason);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    /** @notice Current S-token balance of the treasury. */
    function balance() external view returns (uint256) {
        (bool ok, bytes memory data) = sToken.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        if (!ok || data.length == 0) return 0;
        return abi.decode(data, (uint256));
    }

    /** @notice Whether an address has FD role or above (includes founder). */
    function isFD(address account) external view returns (bool) {
        return account == colony.founder() || roleOf[account] >= ROLE_FD;
    }

    /** @notice Role name string for UI display. */
    function roleName(address account) external view returns (string memory) {
        if (account == colony.founder()) {
            return roleOf[account] == ROLE_NONE ? "Founder" : _roleLabel(roleOf[account]);
        }
        return _roleLabel(roleOf[account]);
    }

    /** @notice All addresses that have been assigned a role (may include revoked). */
    function members() external view returns (address[] memory) {
        return _members;
    }

    function _roleLabel(uint8 role) internal pure returns (string memory) {
        if (role == ROLE_CHAIR) return "Chair";
        if (role == ROLE_FD)    return "FD";
        return "None";
    }
}
