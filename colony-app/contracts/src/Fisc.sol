// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IGovernance {
    /// @notice Returns the current holder of a colony role.
    /// role 0 = CEO, 1 = CFO, 2 = COO.
    function roleHolder(uint8 role) external view returns (address holder, uint256 termEnd, bool active);
}

/**
 * @title Fisc
 * @notice The monetary authority of a SPICE colony (Earth type).
 *
 * Phase 1 — manually governed with F9 algorithmic rate-setting.
 *
 * Access control:
 *   owner        — deployer / protocol admin. Admin ops only.
 *   rateOracle   — dedicated cron wallet. Can call updateRate() daily.
 *   CFO          — governance-elected. Can call updateRate() and set
 *                  algorithm parameters (sensitivity, LRT, bread price, UBI).
 *
 * F9 Rate algorithm:
 *   net_pressure   = externalInflationBps - abundanceBps
 *   policy_stance  = f(reserveRatio) — 0.0 to 1.0 scaled 1e4
 *   adjustment     = net_pressure × stance × RATE_SENSITIVITY / 1e8
 *   new_rate       = current_rate × (1 + adjustment / 10000)
 *   clamped to [minRate, maxRate] and max 2% daily change
 *
 * Rate scaling: fiscRate is $ per S/V token × 1e6
 *   e.g. $0.75/token = 750_000
 */
contract Fisc is Ownable {

    // ── Core state ────────────────────────────────────────────────────────────

    /// Exchange rate: $ per S/V token, scaled 1e6.
    uint256 public fiscRate;

    /// USDC held in reserve, scaled 1e6 (USDC native decimals).
    uint256 public reserveUSDC;

    /// Total V-tokens outstanding, scaled 1e18.
    uint256 public totalVOutstanding;

    /// Reserve ratio = reserveUSDC / (totalVOutstanding × fiscRate), scaled 1e4.
    uint256 public reserveRatio;

    /// LRT rate in basis points (e.g. 1500 = 15%).
    uint256 public latRate;

    /// Bread basket price in S-tokens (integer).
    uint256 public breadBasketPriceS;

    /// UBI amount per citizen per period in S-tokens (integer).
    uint256 public ubiAmount;

    /// Unix timestamp of end of current period (calendar month).
    uint256 public periodEnd;

    /// Linked Colony contract address.
    address public colony;

    // ── Access control ────────────────────────────────────────────────────────

    /// Dedicated oracle wallet used by the automated daily cron.
    /// Can call updateRate(). Set by owner; never has other privileges.
    address public rateOracle;

    /// Colony Governance contract. Used to look up the current CFO (role 1).
    /// May be address(0) if governance is not yet deployed.
    address public governance;

    // ── F9 Rate algorithm parameters ──────────────────────────────────────────

    /// Rate sensitivity: how aggressively rate moves per unit of pressure.
    /// Scaled 1e4. Default 100 = 1% rate change per 1% net pressure at full stance.
    uint256 public rateSensitivity = 100;

    /// Minimum allowed rate ($ per token × 1e6). Default $0.10.
    uint256 public minRate = 100_000;

    /// Maximum allowed rate ($ per token × 1e6). Default $2.00.
    uint256 public maxRate = 2_000_000;

    /// Maximum single-day rate change in bps. Default 200 = 2%.
    uint256 public maxDailyChangeBps = 200;

    /// Timestamp of last rate update via F9.
    uint256 public lastRateUpdate;

    /// Last net pressure applied (bps, signed). For dashboard display.
    int256  public lastNetPressureBps;

    /// Last policy stance applied (0–10000). For dashboard display.
    uint256 public lastPolicyStance;

    // ── Rate history (last 30 daily rates) ───────────────────────────────────

    uint256[30] public rateHistory;
    uint256     public rateHistoryCount;  // how many entries recorded so far (max 30)
    uint256     public rateHistoryHead;   // next write position (circular)

    // ── Reserve ratio thresholds ──────────────────────────────────────────────

    uint256 public constant RATIO_HEALTHY  = 40_000; // >= 4.0×
    uint256 public constant RATIO_ADEQUATE = 20_000; // >= 2.0×

    // ── Events ────────────────────────────────────────────────────────────────

    event RateChanged(uint256 oldRate, uint256 newRate, uint256 reserveRatio, int256 netPressureBps, uint256 policyStance);
    event ReserveUpdated(uint256 reserveUSDC, uint256 reserveRatio);
    event ReserveAlert(uint256 reserveUSDC, uint256 reserveRatio);
    event LATRateChanged(uint256 oldRate, uint256 newRate);
    event BreadBasketChanged(uint256 oldPrice, uint256 newPrice);
    event PeriodAdvanced(uint256 newPeriodEnd, uint256 epoch);
    event ParameterChanged(string name, uint256 oldValue, uint256 newValue);
    event RateOracleSet(address indexed previous, address indexed next);
    event GovernanceSet(address indexed previous, address indexed next);

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(
        address _colony,
        uint256 _fiscRate,
        uint256 _reserveUSDC,
        uint256 _totalVOutstanding,
        uint256 _latRate,
        uint256 _breadBasketPriceS,
        uint256 _ubiAmount,
        uint256 _periodEnd,
        address _governance,  // may be address(0); set later via setGovernance()
        address _rateOracle   // may be address(0); set later via setRateOracle()
    ) Ownable(msg.sender) {
        require(_colony != address(0),    "Fisc: zero colony");
        require(_fiscRate > 0,            "Fisc: rate must be > 0");
        require(_breadBasketPriceS > 0,   "Fisc: bread price must be > 0");
        require(_ubiAmount > 0,           "Fisc: UBI must be > 0");
        require(_periodEnd > block.timestamp, "Fisc: period end in past");

        colony            = _colony;
        fiscRate          = _fiscRate;
        reserveUSDC       = _reserveUSDC;
        totalVOutstanding = _totalVOutstanding;
        latRate           = _latRate;
        breadBasketPriceS = _breadBasketPriceS;
        ubiAmount         = _ubiAmount;
        periodEnd         = _periodEnd;
        governance        = _governance;
        rateOracle        = _rateOracle;

        _recordRate(_fiscRate);
        _recomputeRatio();
    }

    // ── Access control modifiers ──────────────────────────────────────────────

    /// Owner, rate oracle, or active CFO from governance.
    modifier onlyRateAuthority() {
        if (msg.sender != owner() && msg.sender != rateOracle) {
            bool isCFO;
            if (governance != address(0)) {
                (address cfo, , bool active) = IGovernance(governance).roleHolder(1);
                isCFO = (msg.sender == cfo && active);
            }
            require(isCFO, "Fisc: not rate authority");
        }
        _;
    }

    /// Owner or active CFO from governance.
    modifier onlyOwnerOrCFO() {
        if (msg.sender != owner()) {
            bool isCFO;
            if (governance != address(0)) {
                (address cfo, , bool active) = IGovernance(governance).roleHolder(1);
                isCFO = (msg.sender == cfo && active);
            }
            require(isCFO, "Fisc: not owner or CFO");
        }
        _;
    }

    // ── F9 — Algorithmic rate update ──────────────────────────────────────────

    /**
     * @notice Update exchange rate using the F9 bread-basket-anchor algorithm.
     *         Owner calls daily with current external price pressure.
     *
     * @param externalInflationBps  % change in external dollar prices × 100
     *        e.g. 3.5% annual CPI = 350. Positive = dollar weakening.
     * @param abundanceBps          % reduction in local production costs × 100
     *        e.g. 2% AI deflation = 200. Positive = local goods getting cheaper.
     *
     * net_pressure = externalInflation - abundance
     *   positive: external inflation dominant — token should strengthen
     *   negative: abundance dominant — token can weaken safely
     */
    function updateRate(int256 externalInflationBps, int256 abundanceBps) external onlyRateAuthority {
        require(
            lastRateUpdate == 0 || block.timestamp >= lastRateUpdate + 20 hours,
            "Fisc: rate updated too recently"
        );

        int256 netPressure = externalInflationBps - abundanceBps;

        // Policy stance: how aggressively to defend the bread price
        // Based on reserve health. 0 = no defence (reserve critical), 10000 = full defence.
        uint256 stance;
        if (reserveRatio >= RATIO_HEALTHY) {
            stance = 10_000;
        } else if (reserveRatio >= RATIO_ADEQUATE) {
            stance = (reserveRatio - RATIO_ADEQUATE) * 10_000
                     / (RATIO_HEALTHY - RATIO_ADEQUATE);
        } else {
            stance = 0;
            emit ReserveAlert(reserveUSDC, reserveRatio);
        }

        // adjustment (bps) = netPressure × stance × sensitivity / 1e8
        // e.g. netPressure=350, stance=10000, sensitivity=100
        //   → 350 × 10000 × 100 / 1e8 = 350 bps = 3.5%
        int256 adjustmentBps = (netPressure * int256(stance) * int256(rateSensitivity)) / 1e8;

        // new_rate = current × (1 + adjustment/10000)
        int256 newRateInt = int256(fiscRate) + (int256(fiscRate) * adjustmentBps / 10_000);

        // Clamp to daily max change
        uint256 maxChange = fiscRate * maxDailyChangeBps / 10_000;
        uint256 newRate;
        if (newRateInt <= 0) {
            newRate = minRate;
        } else {
            newRate = uint256(newRateInt);
            if (newRate > fiscRate + maxChange) newRate = fiscRate + maxChange;
            if (newRate < fiscRate - maxChange) newRate = fiscRate - maxChange;
        }

        // Clamp to absolute bounds
        if (newRate < minRate) newRate = minRate;
        if (newRate > maxRate) newRate = maxRate;

        uint256 oldRate = fiscRate;
        fiscRate           = newRate;
        lastRateUpdate     = block.timestamp;
        lastNetPressureBps = netPressure;
        lastPolicyStance   = stance;

        _recordRate(newRate);
        _recomputeRatio();

        emit RateChanged(oldRate, newRate, reserveRatio, netPressure, stance);
    }

    // ── Owner setters ─────────────────────────────────────────────────────────

    function setFiscRate(uint256 _fiscRate) external onlyOwner {
        require(_fiscRate > 0, "Fisc: rate must be > 0");
        uint256 old = fiscRate;
        fiscRate = _fiscRate;
        _recordRate(_fiscRate);
        _recomputeRatio();
        emit RateChanged(old, _fiscRate, reserveRatio, 0, 0);
    }

    function setReserveUSDC(uint256 _reserveUSDC) external onlyOwner {
        reserveUSDC = _reserveUSDC;
        _recomputeRatio();
        emit ReserveUpdated(_reserveUSDC, reserveRatio);
    }

    function setTotalVOutstanding(uint256 _totalV) external onlyOwner {
        totalVOutstanding = _totalV;
        _recomputeRatio();
        emit ParameterChanged("totalVOutstanding", 0, _totalV);
    }

    function setLatRate(uint256 _latRate) external onlyOwnerOrCFO {
        require(_latRate <= 6000, "Fisc: LAT cannot exceed 60%");
        uint256 old = latRate;
        latRate = _latRate;
        emit LATRateChanged(old, _latRate);
    }

    function setBreadBasketPrice(uint256 _priceS) external onlyOwnerOrCFO {
        require(_priceS > 0, "Fisc: price must be > 0");
        uint256 old = breadBasketPriceS;
        breadBasketPriceS = _priceS;
        emit BreadBasketChanged(old, _priceS);
    }

    function setUbiAmount(uint256 _ubiAmount) external onlyOwnerOrCFO {
        require(_ubiAmount > 0, "Fisc: UBI must be > 0");
        uint256 old = ubiAmount;
        ubiAmount = _ubiAmount;
        emit ParameterChanged("ubiAmount", old, _ubiAmount);
    }

    function setRateSensitivity(uint256 _sensitivity) external onlyOwnerOrCFO {
        require(_sensitivity <= 10_000, "Fisc: sensitivity too high");
        rateSensitivity = _sensitivity;
        emit ParameterChanged("rateSensitivity", 0, _sensitivity);
    }

    function setRateOracle(address _oracle) external onlyOwner {
        emit RateOracleSet(rateOracle, _oracle);
        rateOracle = _oracle;
    }

    function setGovernance(address _governance) external onlyOwner {
        emit GovernanceSet(governance, _governance);
        governance = _governance;
    }

    function advancePeriod(uint256 _newPeriodEnd, uint256 _epoch) external onlyOwner {
        require(_newPeriodEnd > block.timestamp, "Fisc: period end in past");
        periodEnd = _newPeriodEnd;
        emit PeriodAdvanced(_newPeriodEnd, _epoch);
    }

    function updateAll(
        uint256 _fiscRate,
        uint256 _reserveUSDC,
        uint256 _totalVOutstanding,
        uint256 _latRate,
        uint256 _breadBasketPriceS,
        uint256 _ubiAmount,
        uint256 _periodEnd
    ) external onlyOwner {
        require(_fiscRate > 0,          "Fisc: rate must be > 0");
        require(_breadBasketPriceS > 0, "Fisc: bread price must be > 0");
        require(_ubiAmount > 0,         "Fisc: UBI must be > 0");
        require(_periodEnd > block.timestamp, "Fisc: period end in past");

        uint256 oldRate   = fiscRate;
        fiscRate          = _fiscRate;
        reserveUSDC       = _reserveUSDC;
        totalVOutstanding = _totalVOutstanding;
        latRate           = _latRate;
        breadBasketPriceS = _breadBasketPriceS;
        ubiAmount         = _ubiAmount;
        periodEnd         = _periodEnd;

        _recordRate(_fiscRate);
        _recomputeRatio();
        emit RateChanged(oldRate, _fiscRate, reserveRatio, 0, 0);
        emit ReserveUpdated(_reserveUSDC, reserveRatio);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function secondsUntilPeriodEnd() external view returns (uint256) {
        if (block.timestamp >= periodEnd) return 0;
        return periodEnd - block.timestamp;
    }

    function daysUntilPeriodEnd() external view returns (uint256) {
        if (block.timestamp >= periodEnd) return 0;
        return (periodEnd - block.timestamp) / 1 days;
    }

    function reserveStatus() external view returns (uint8) {
        if (reserveRatio >= RATIO_HEALTHY)  return 2;
        if (reserveRatio >= RATIO_ADEQUATE) return 1;
        return 0;
    }

    function toUSDC(uint256 tokenAmount) external view returns (uint256) {
        return (tokenAmount * fiscRate) / 1e18;
    }

    /// @notice Last N rate history entries (most recent last). Returns up to 30.
    function getRateHistory() external view returns (uint256[] memory rates) {
        uint256 count = rateHistoryCount < 30 ? rateHistoryCount : 30;
        rates = new uint256[](count);
        if (count == 0) return rates;
        // Reconstruct chronological order from circular buffer
        for (uint256 i = 0; i < count; i++) {
            uint256 idx = (rateHistoryHead + 30 - count + i) % 30;
            rates[i] = rateHistory[idx];
        }
    }

    /// @notice Full state snapshot for wallets and dashboards.
    function snapshot() external view returns (
        uint256 _fiscRate,
        uint256 _reserveUSDC,
        uint256 _reserveRatio,
        uint8   _reserveStatus,
        uint256 _latRate,
        uint256 _breadBasketPriceS,
        uint256 _ubiAmount,
        uint256 _periodEnd,
        uint256 _daysLeft,
        address _colony
    ) {
        uint8 status;
        if (reserveRatio >= RATIO_HEALTHY)       status = 2;
        else if (reserveRatio >= RATIO_ADEQUATE) status = 1;

        uint256 daysLeft;
        if (block.timestamp < periodEnd) daysLeft = (periodEnd - block.timestamp) / 1 days;

        _fiscRate          = fiscRate;
        _reserveUSDC       = reserveUSDC;
        _reserveRatio      = reserveRatio;
        _reserveStatus     = status;
        _latRate           = latRate;
        _breadBasketPriceS = breadBasketPriceS;
        _ubiAmount         = ubiAmount;
        _periodEnd         = periodEnd;
        _daysLeft          = daysLeft;
        _colony            = colony;
    }

    /// @notice Rate algorithm state for dashboard display.
    function rateAlgorithmState() external view returns (
        uint256 _rateSensitivity,
        uint256 _minRate,
        uint256 _maxRate,
        uint256 _maxDailyChangeBps,
        uint256 _lastRateUpdate,
        int256  _lastNetPressureBps,
        uint256 _lastPolicyStance
    ) {
        _rateSensitivity    = rateSensitivity;
        _minRate            = minRate;
        _maxRate            = maxRate;
        _maxDailyChangeBps  = maxDailyChangeBps;
        _lastRateUpdate     = lastRateUpdate;
        _lastNetPressureBps = lastNetPressureBps;
        _lastPolicyStance   = lastPolicyStance;
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    function _recomputeRatio() internal {
        if (totalVOutstanding == 0 || fiscRate == 0) {
            reserveRatio = RATIO_HEALTHY;
            return;
        }
        uint256 numerator   = reserveUSDC * 1e18 * 1e4;
        uint256 denominator = totalVOutstanding * fiscRate / 1e18;
        reserveRatio = denominator == 0 ? RATIO_HEALTHY : numerator / denominator;
    }

    function _recordRate(uint256 rate) internal {
        rateHistory[rateHistoryHead % 30] = rate;
        rateHistoryHead++;
        if (rateHistoryCount < 30) rateHistoryCount++;
    }
}
