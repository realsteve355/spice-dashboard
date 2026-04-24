// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Fisc
 * @notice The monetary authority of a SPICE colony (Earth type).
 *
 * Phase 1 — manually governed state store. The owner (founder / MCC CEO)
 * sets the exchange rate, reserve balance, and period timing. All values
 * are published on-chain for wallets and dashboards to read.
 *
 * Phase 2 — F9 algorithmic rate-setting, USDC reserve integration, LRT
 * collection (F8), and boundary flows (F6/F7) will be added here.
 *
 * Key state exposed:
 *   fiscRate         — $ per S/V token (scaled 1e6, e.g. 1.00 = 1_000_000)
 *   reserveUSDC      — USDC in reserve (scaled 1e6, USDC decimals)
 *   reserveRatio     — reserve / (V_outstanding × rate), scaled 1e4
 *   lrtRate          — Local Robot Tax on local net profit, bps (e.g. 1500 = 15%)
 *   breadBasketPriceS — basket cost in S-tokens (integer)
 *   ubiAmount        — S-tokens issued per citizen per period (mirrors SToken.UBI_AMOUNT)
 *   periodEnd        — unix timestamp of current period end
 *   colony           — linked Colony contract address
 */
contract Fisc is Ownable {

    // ── Core parameters ───────────────────────────────────────────────────────

    /// Exchange rate: $ per S/V token, scaled 1e6.
    /// e.g. $1.00/token = 1_000_000, $0.75/token = 750_000
    uint256 public fiscRate;

    /// USDC held in reserve, scaled 1e6 (USDC native decimals).
    uint256 public reserveUSDC;

    /// Total V-tokens outstanding across all holders, scaled 1e18.
    /// Updated by owner when V supply changes significantly.
    uint256 public totalVOutstanding;

    /// Reserve ratio = reserveUSDC / (totalVOutstanding × fiscRate / 1e(18+6-6))
    /// Scaled 1e4. e.g. 4.0× = 40_000. Recomputed on every state change.
    uint256 public reserveRatio;

    /// LRT rate in basis points. e.g. 1500 = 15% of local net profit.
    uint256 public lrtRate;

    /// Bread basket price in S-tokens (integer, no decimals).
    /// The Fisc defends this price — rate moves to keep it stable.
    uint256 public breadBasketPriceS;

    /// UBI amount per citizen per period in S-tokens (integer).
    uint256 public ubiAmount;

    /// Unix timestamp of the end of the current period (calendar month).
    uint256 public periodEnd;

    /// Linked Colony contract address.
    address public colony;

    // ── Reserve status levels ─────────────────────────────────────────────────

    uint256 public constant RATIO_HEALTHY  = 40_000; // >= 4.0×
    uint256 public constant RATIO_ADEQUATE = 20_000; // >= 2.0×
    // < 2.0× = ALERT

    // ── Events ────────────────────────────────────────────────────────────────

    event RateChanged(uint256 oldRate, uint256 newRate, uint256 reserveRatio);
    event ReserveUpdated(uint256 reserveUSDC, uint256 reserveRatio);
    event LRTRateChanged(uint256 oldRate, uint256 newRate);
    event BreadBasketChanged(uint256 oldPrice, uint256 newPrice);
    event PeriodAdvanced(uint256 newPeriodEnd, uint256 epoch);
    event ParameterChanged(string name, uint256 oldValue, uint256 newValue);

    // ── Constructor ───────────────────────────────────────────────────────────

    /**
     * @param _colony           Linked Colony contract address
     * @param _fiscRate         Initial exchange rate ($ per token × 1e6)
     * @param _reserveUSDC      Initial USDC reserve (× 1e6)
     * @param _totalVOutstanding Initial V supply (× 1e18)
     * @param _lrtRate          LRT in bps
     * @param _breadBasketPriceS Basket price in S-tokens
     * @param _ubiAmount        UBI per citizen per period (S-tokens, integer)
     * @param _periodEnd        Unix timestamp of current period end
     */
    constructor(
        address _colony,
        uint256 _fiscRate,
        uint256 _reserveUSDC,
        uint256 _totalVOutstanding,
        uint256 _lrtRate,
        uint256 _breadBasketPriceS,
        uint256 _ubiAmount,
        uint256 _periodEnd
    ) Ownable(msg.sender) {
        require(_colony != address(0), "Fisc: zero colony address");
        require(_fiscRate > 0,         "Fisc: rate must be > 0");
        require(_breadBasketPriceS > 0,"Fisc: bread price must be > 0");
        require(_ubiAmount > 0,        "Fisc: UBI must be > 0");
        require(_periodEnd > block.timestamp, "Fisc: period end must be in future");

        colony             = _colony;
        fiscRate           = _fiscRate;
        reserveUSDC        = _reserveUSDC;
        totalVOutstanding  = _totalVOutstanding;
        lrtRate            = _lrtRate;
        breadBasketPriceS  = _breadBasketPriceS;
        ubiAmount          = _ubiAmount;
        periodEnd          = _periodEnd;

        _recomputeRatio();
    }

    // ── Owner setters ─────────────────────────────────────────────────────────

    /**
     * @notice Set the exchange rate. Emits RateChanged.
     * @param _fiscRate New rate ($ per token × 1e6)
     */
    function setFiscRate(uint256 _fiscRate) external onlyOwner {
        require(_fiscRate > 0, "Fisc: rate must be > 0");
        uint256 old = fiscRate;
        fiscRate = _fiscRate;
        _recomputeRatio();
        emit RateChanged(old, _fiscRate, reserveRatio);
    }

    /**
     * @notice Update the USDC reserve balance and recompute ratio.
     * @param _reserveUSDC New reserve (× 1e6)
     */
    function setReserveUSDC(uint256 _reserveUSDC) external onlyOwner {
        reserveUSDC = _reserveUSDC;
        _recomputeRatio();
        emit ReserveUpdated(_reserveUSDC, reserveRatio);
    }

    /**
     * @notice Update total V outstanding (call when V supply changes materially).
     * @param _totalV New total V supply (× 1e18)
     */
    function setTotalVOutstanding(uint256 _totalV) external onlyOwner {
        totalVOutstanding = _totalV;
        _recomputeRatio();
        emit ParameterChanged("totalVOutstanding", 0, _totalV);
    }

    /**
     * @notice Set the LRT rate in basis points.
     */
    function setLrtRate(uint256 _lrtRate) external onlyOwner {
        require(_lrtRate <= 6000, "Fisc: LRT cannot exceed 60%");
        uint256 old = lrtRate;
        lrtRate = _lrtRate;
        emit LRTRateChanged(old, _lrtRate);
    }

    /**
     * @notice Set the bread basket price in S-tokens.
     */
    function setBreadBasketPrice(uint256 _priceS) external onlyOwner {
        require(_priceS > 0, "Fisc: price must be > 0");
        uint256 old = breadBasketPriceS;
        breadBasketPriceS = _priceS;
        emit BreadBasketChanged(old, _priceS);
    }

    /**
     * @notice Set the UBI amount in S-tokens (should mirror SToken.UBI_AMOUNT).
     */
    function setUbiAmount(uint256 _ubiAmount) external onlyOwner {
        require(_ubiAmount > 0, "Fisc: UBI must be > 0");
        uint256 old = ubiAmount;
        ubiAmount = _ubiAmount;
        emit ParameterChanged("ubiAmount", old, _ubiAmount);
    }

    /**
     * @notice Advance to the next period. Sets periodEnd to end of next
     *         calendar month (caller supplies the timestamp).
     * @param _newPeriodEnd Unix timestamp of new period end
     * @param _epoch        New epoch number (for event log)
     */
    function advancePeriod(uint256 _newPeriodEnd, uint256 _epoch) external onlyOwner {
        require(_newPeriodEnd > block.timestamp, "Fisc: period end must be in future");
        periodEnd = _newPeriodEnd;
        emit PeriodAdvanced(_newPeriodEnd, _epoch);
    }

    /**
     * @notice Update all parameters in a single call (gas-efficient for monthly reset).
     */
    function updateAll(
        uint256 _fiscRate,
        uint256 _reserveUSDC,
        uint256 _totalVOutstanding,
        uint256 _lrtRate,
        uint256 _breadBasketPriceS,
        uint256 _ubiAmount,
        uint256 _periodEnd
    ) external onlyOwner {
        require(_fiscRate > 0,          "Fisc: rate must be > 0");
        require(_breadBasketPriceS > 0, "Fisc: bread price must be > 0");
        require(_ubiAmount > 0,         "Fisc: UBI must be > 0");
        require(_periodEnd > block.timestamp, "Fisc: period end must be in future");

        uint256 oldRate = fiscRate;
        fiscRate          = _fiscRate;
        reserveUSDC       = _reserveUSDC;
        totalVOutstanding = _totalVOutstanding;
        lrtRate           = _lrtRate;
        breadBasketPriceS = _breadBasketPriceS;
        ubiAmount         = _ubiAmount;
        periodEnd         = _periodEnd;

        _recomputeRatio();
        emit RateChanged(oldRate, _fiscRate, reserveRatio);
        emit ReserveUpdated(_reserveUSDC, reserveRatio);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    /**
     * @notice Seconds remaining in the current period. 0 if period has ended.
     */
    function secondsUntilPeriodEnd() external view returns (uint256) {
        if (block.timestamp >= periodEnd) return 0;
        return periodEnd - block.timestamp;
    }

    /**
     * @notice Days remaining in the current period (rounded down).
     */
    function daysUntilPeriodEnd() external view returns (uint256) {
        if (block.timestamp >= periodEnd) return 0;
        return (periodEnd - block.timestamp) / 1 days;
    }

    /**
     * @notice Reserve status: 2 = healthy (>=4×), 1 = adequate (>=2×), 0 = alert (<2×).
     */
    function reserveStatus() external view returns (uint8) {
        if (reserveRatio >= RATIO_HEALTHY)  return 2;
        if (reserveRatio >= RATIO_ADEQUATE) return 1;
        return 0;
    }

    /**
     * @notice Dollar equivalent of a token amount at current rate.
     * @param tokenAmount Amount in S or V tokens (× 1e18)
     * @return usdcValue  USDC equivalent (× 1e6)
     */
    function toUSDC(uint256 tokenAmount) external view returns (uint256) {
        // tokenAmount (1e18) × fiscRate (1e6) / 1e18 = result (1e6)
        return (tokenAmount * fiscRate) / 1e18;
    }

    /**
     * @notice Full Fisc state snapshot — for wallets and dashboards.
     */
    function snapshot() external view returns (
        uint256 _fiscRate,
        uint256 _reserveUSDC,
        uint256 _reserveRatio,
        uint8   _reserveStatus,
        uint256 _lrtRate,
        uint256 _breadBasketPriceS,
        uint256 _ubiAmount,
        uint256 _periodEnd,
        uint256 _daysLeft,
        address _colony
    ) {
        uint8 status;
        if (reserveRatio >= RATIO_HEALTHY)  status = 2;
        else if (reserveRatio >= RATIO_ADEQUATE) status = 1;
        else status = 0;

        uint256 daysLeft;
        if (block.timestamp < periodEnd) daysLeft = (periodEnd - block.timestamp) / 1 days;

        _fiscRate          = fiscRate;
        _reserveUSDC       = reserveUSDC;
        _reserveRatio      = reserveRatio;
        _reserveStatus     = status;
        _lrtRate           = lrtRate;
        _breadBasketPriceS = breadBasketPriceS;
        _ubiAmount         = ubiAmount;
        _periodEnd         = periodEnd;
        _daysLeft          = daysLeft;
        _colony            = colony;
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    /**
     * @dev Recompute reserveRatio from current state.
     *      ratio = reserveUSDC (1e6) / (totalVOutstanding (1e18) × fiscRate (1e6) / 1e18)
     *            = reserveUSDC × 1e18 / (totalVOutstanding × fiscRate / 1e18)
     *            = reserveUSDC × 1e18 × 1e18 / (totalVOutstanding × fiscRate)
     *      scaled to 1e4: multiply numerator by 1e4.
     *
     *      If totalVOutstanding == 0: ratio = RATIO_HEALTHY (no V in circulation = healthy).
     */
    function _recomputeRatio() internal {
        if (totalVOutstanding == 0 || fiscRate == 0) {
            reserveRatio = RATIO_HEALTHY;
            return;
        }
        // reserveUSDC in 1e6, totalVOutstanding in 1e18, fiscRate in 1e6
        // V value in USDC (1e6) = totalVOutstanding * fiscRate / 1e18
        // ratio (1e4) = reserveUSDC * 1e18 * 1e4 / (totalVOutstanding * fiscRate)
        uint256 numerator   = reserveUSDC * 1e18 * 1e4;
        uint256 denominator = totalVOutstanding * fiscRate / 1e18;
        if (denominator == 0) {
            reserveRatio = RATIO_HEALTHY;
        } else {
            reserveRatio = numerator / denominator;
        }
    }
}
