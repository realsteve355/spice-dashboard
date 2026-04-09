// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./GToken.sol";
import "./SToken.sol";
import "./VToken.sol";

/**
 * @title Colony
 * @notice The Fisc — entry point for all colony economic actions.
 *
 *   join()          — register as citizen, receive G-token + first UBI
 *   claimUbi()      — claim monthly UBI (1000 S per epoch)
 *   saveToV(amount) — convert S → V (max 200/month)
 *   redeemV(amount) — convert V → S (1:1, any time)
 *   send(to,amount) — send S-tokens to another citizen or company
 */
contract Colony {
    GToken public gToken;
    SToken public sToken;
    VToken public vToken;

    string public colonyName;
    address public founder;

    mapping(address => bool) public isCitizen;
    address[] public citizens;

    event CitizenJoined(address indexed citizen, uint256 gTokenId);
    event UbiClaimed(address indexed citizen, uint256 amount, uint256 epoch);
    event Saved(address indexed citizen, uint256 amount);
    event Redeemed(address indexed citizen, uint256 amount);
    event Sent(address indexed from, address indexed to, uint256 amount, string note);

    constructor(string memory _name) {
        colonyName = _name;
        founder = msg.sender;

        gToken = new GToken();
        sToken = new SToken();
        vToken = new VToken();
    }

    modifier onlyCitizen() {
        require(isCitizen[msg.sender], "Colony: not a citizen");
        _;
    }

    /**
     * @notice Join the colony. Mints a G-token and issues first UBI immediately.
     *         Can only join once.
     */
    function join() external {
        require(!isCitizen[msg.sender], "Colony: already a citizen");
        isCitizen[msg.sender] = true;
        citizens.push(msg.sender);

        uint256 tokenId = gToken.mint(msg.sender);
        sToken.issueUbi(msg.sender);

        emit CitizenJoined(msg.sender, tokenId);
        emit UbiClaimed(msg.sender, 1000 * 1e18, sToken.currentEpoch());
    }

    /**
     * @notice Claim UBI for the current epoch (call once per month after epoch advances).
     */
    function claimUbi() external onlyCitizen {
        sToken.issueUbi(msg.sender);
        emit UbiClaimed(msg.sender, 1000 * 1e18, sToken.currentEpoch());
    }

    /**
     * @notice Convert S-tokens to V-tokens. Max 200 S per month.
     */
    function saveToV(uint256 amount) external onlyCitizen {
        require(sToken.balanceOf(msg.sender) >= amount, "Colony: insufficient S balance");
        sToken.burn(msg.sender, amount);
        vToken.mint(msg.sender, amount);
        emit Saved(msg.sender, amount);
    }

    /**
     * @notice Redeem V-tokens back to S-tokens at 1:1.
     */
    function redeemV(uint256 amount) external onlyCitizen {
        require(vToken.balanceOf(msg.sender) >= amount, "Colony: insufficient V balance");
        vToken.burn(msg.sender, amount);
        sToken.issueUbiRaw(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
    }

    /**
     * @notice Send S-tokens to another address with an optional note.
     */
    function send(address to, uint256 amount, string calldata note) external onlyCitizen {
        require(sToken.balanceOf(msg.sender) >= amount, "Colony: insufficient S balance");
        sToken.colonyTransfer(msg.sender, to, amount);
        emit Sent(msg.sender, to, amount, note);
    }

    /**
     * @notice Advance epoch (monthly reset). Founder only for now.
     *         In production this would be triggered by a time-lock or MCC vote.
     */
    function advanceEpoch() external {
        require(msg.sender == founder, "Colony: only founder");
        sToken.advanceEpoch();
        vToken.advanceEpoch();
    }

    /**
     * @notice Returns citizen count.
     */
    function citizenCount() external view returns (uint256) {
        return citizens.length;
    }
}
