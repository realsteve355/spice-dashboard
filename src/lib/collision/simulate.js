const YEARS = 15, BASE = 2026;

function r(v){ return Math.round(v*10)/10; }

export default function simulate(p) {
  const INIT_LS = 0.62, INIT_AI = 0.15, INIT_U = 0.04; // wage income share, AI penetration, unemployment
  let ls=INIT_LS, ai=INIT_AI, u=INIT_U, wage=100, gdp=100;
  let asset=100, cons=100, debt=p.debt, ar=p.auto;
  let crisisTriggered = false, crisisYear = null;
  let marketRate = p.rate;  // tracks across years — bond market has memory
  let currentPrimaryDef = p.def;

  const s = {
    years:[], gdp:[], wage:[], ls:[], u:[], debt:[], asset:[], cons:[],
    capShare:[], tax:[], demand:[], ai:[], score:[], spice:[], welfare:[],
    assetInflation:[], consInflation:[], printing:[], marketYield:[], primaryDeficit:[],
    goldIndex:[], cryptoExit:[], fiatPower:[],
    inflation:[], realRate:[]
  };
  let goldPrice=100, fiatPower=100, cryptoExit=0, yccMon=0;

  for(let y=0; y<=YEARS; y++){

    // ── RECORD STATE ──────────────────────────────────────────────────────
    s.years.push(BASE+y);
    s.gdp.push(r(gdp));
    s.wage.push(r(wage));
    s.ls.push(r(ls*100));
    s.u.push(r(u*100));
    s.debt.push(r(debt*100));
    s.asset.push(r(asset));
    s.cons.push(r(cons));
    s.capShare.push(r((1-ls)*100));
    s.tax.push(r(ls*0.22*100 + (1-ls)*p.captax*100));
    s.welfare.push(r(u * 100 * 0.4));
    s.marketYield.push(r(marketRate * 100));        // ← single push per year
    s.primaryDeficit.push(r(currentPrimaryDef * 100)); // ← single push per year

    const mpc = Math.max(0.3, 0.95 - (p.gini-1)*0.08);
    const ubiBoost = p.ubi * wage * 0.6;
    s.demand.push(r(wage * mpc + ubiBoost));
    s.ai.push(r(ai*100));

    const assetInflYoY = y>0 ? ((asset-s.asset[y-1])/s.asset[y-1]*100) : 5;
    const consInflYoY  = y>0 ? ((cons -s.cons[y-1]) /s.cons[y-1] *100) : 2.8;
    s.assetInflation.push(r(assetInflYoY));
    s.consInflation.push(r(consInflYoY));
    s.printing.push(r(p.qe*100));

    // ── FLIGHT FROM FIAT (record state at start of year) ─────────────────
    s.goldIndex.push(r(goldPrice));
    s.cryptoExit.push(r(cryptoExit));
    s.fiatPower.push(r(fiatPower));

    // ── INFLATION (composite: consumer + monetary) ─────────────────────
    // Demand deflation from AI displacement (deflationary) vs
    // monetary expansion from QE/YCC (inflationary).
    // The Collision thesis: both happen simultaneously — different price baskets.
    const demDefl = y > 0 ? ((s.cons[y] - s.cons[y-1]) / s.cons[y-1] * 100) : 2.8;
    const monInfl = p.qe * 0.9 + yccMon * 12;  // yccMon from previous step
    const compositeInfl = demDefl + monInfl;
    s.inflation.push(r(compositeInfl));
    const rr = (s.marketYield[y]||0) - compositeInfl;
    s.realRate.push(r(rr));

    // Crisis score
    // Crisis scoring — calibrated to historical precedents:
    // Italy 2011 panic: ~120% debt. Greece shutdown: ~130%. UK gilt crisis: trajectory fear.
    // Score is not academic — 150% debt with rising yields IS a crisis, full stop.
    let cs=0;

    // DEBT — the primary fiscal stress signal
    if(debt>0.90) cs+=5;   // approaching danger zone (Japan ~100% normal; US/UK now)
    if(debt>1.10) cs+=10;  // Italy 2011 panic territory — bond spreads blow out here
    if(debt>1.30) cs+=15;  // Greece 2010 — markets question solvency
    if(debt>1.60) cs+=15;  // No major advanced economy has stabilised above this without YCC/default
    if(debt>2.00) cs+=10;  // Restructuring mathematically inevitable

    // YIELDS — bond market has spoken
    if(marketRate>0.055) cs+=5;  // 5.5%+: elevated, markets pricing risk
    if(marketRate>0.075) cs+=10; // 7.5%+: Italy 2011 peak; genuine funding crisis
    if(marketRate>0.10)  cs+=10; // 10%+: emergency territory, IMF time
    if(marketRate>0.15)  cs+=5;  // 15%+: systemic failure

    // LABOUR SHARE — fiscal base collapse
    if(ls<0.58) cs+=5;   // below post-war average — warning sign
    if(ls<0.50) cs+=10;  // structural tax base erosion underway
    if(ls<0.40) cs+=10;  // severe — welfare costs exploding, revenues cratering
    if(ls<0.28) cs+=5;   // extreme hollowing

    // UNEMPLOYMENT — social + fiscal crisis combined
    if(u>0.08)  cs+=5;   // above normal — fiscal drag beginning
    if(u>0.12)  cs+=8;   // social crisis threshold — political instability
    if(u>0.20)  cs+=8;   // depression-level — historical precedent for regime change
    if(u>0.35)  cs+=4;   // structural collapse

    cs=Math.min(cs,100);
    s.score.push(r(cs));
    if(cs>=35 && !crisisTriggered){ crisisTriggered=true; crisisYear=BASE+y; }

    const spiceReturn = 8 + cs*1.1 + (asset/100-1)*15;
    s.spice.push(r(spiceReturn));

    if(y===YEARS) break;  // ← record final state, then stop

    // ── STEP FORWARD ──────────────────────────────────────────────────────
    // ADOPTION LAG: automation effects ramp in over lag period.
    // During lag: hiring freezes and awareness grow but displacement is minimal.
    // After lag: full automation rate kicks in. Ramp is linear over 1 year after lag ends.
    const lagYears = p.lag;
    const rampStart = lagYears;
    const rampEnd   = lagYears + 1.0;  // 1-year ramp-up after lag
    const adoptionFactor = y <= rampStart ? 0
                         : y >= rampEnd   ? 1
                         : (y - rampStart) / (rampEnd - rampStart);

    ar = Math.min(ar * (1 + (p.rec - 1) * adoptionFactor), 0.45);
    const gross = Math.min(ai + ar * adoptionFactor, 0.95) - ai;
    const net = gross * (1 - p.reinstate);
    ai = Math.min(ai+gross, 0.95);

    const ubiReinstate = p.ubi * 0.3;
    const effectiveNet = net * (1 - ubiReinstate);
    const captaxDampener = p.captax * 0.5;
    const lsDecline = effectiveNet * 1.2 * (1 - captaxDampener);
    ls = Math.max(ls - lsDecline, 0.06);

    u = Math.min(u + effectiveNet*0.55, 0.65);
    u *= 0.94;

    const prodGain = gross*(p.prod-1);
    const demandDrag = effectiveNet*(2-p.reinstate)*0.25;
    gdp *= (1 + prodGain - demandDrag*0.4);
    // Real wage index: starts at 100 = baseline purchasing power
    // Falls as wage income share declines (workers get smaller slice of growing pie)
    // Rises slightly if wage income share holds while GDP grows (not typical in this model)
    // Consumer price adjustment: deflation helps workers, inflation hurts them
    const consumerPriceLevel = cons / 100;  // cons starts at 100
    wage = (ls / INIT_LS) * (gdp / 100) * (100 / Math.max(consumerPriceLevel, 0.5));

    const capGain = prodGain*1.9 + p.qe*0.8 + (p.captax < 0.15 ? 0.03 : 0);
    asset *= (1 + Math.max(capGain-0.02, -0.08));

    const demandDeflation = -effectiveNet*0.7*(1-p.ubi*0.6);
    const monetaryInflation = p.qe*0.25 + (debt>1.5 ? 0.02 : 0);
    const ubiInflation = p.ubi*0.015;
    cons *= (1 + demandDeflation + monetaryInflation + ubiInflation + 0.025);

    // ── FISCAL ────────────────────────────────────────────────────────────
    // DOMESTIC CAPITAL CAPTURE: domcap = fraction of AI profits taxable domestically.
    // UK/Europe: 20-40% (profits go to US firms). US itself: 70-90%.
    // This is why non-US sovereigns face a double bind — lose labour tax base AND
    // cannot tax the capital that replaced it because it's in Silicon Valley.
    const labTaxFrac = ls * 0.22;
    const capTaxFrac = (1 - ls) * p.captax * p.domcap;  // only domestically-captured profits taxable
    const vatFrac    = Math.max(ls * 0.85, 0.10) * 0.12;
    const totalRevFrac = labTaxFrac + capTaxFrac + vatFrac;
    const baselineRevFrac = INIT_LS*0.22 + (1-INIT_LS)*0.08*0.5 + 0.85*INIT_LS*0.12;
    const welfareFrac = 0.02 + u * 0.25;
    const ubiFrac     = p.ubi * Math.max(1 - ls/INIT_LS, 0) * 0.8;
    currentPrimaryDef = p.def
      + (welfareFrac - 0.02)
      + ubiFrac
      - Math.max(totalRevFrac - baselineRevFrac, -0.15);

    // ── DYNAMIC BOND MARKET ───────────────────────────────────────────────
    const impliedDebtGrowth = currentPrimaryDef + debt * Math.max(marketRate - 0.03, 0);
    const debt2YrFwd = debt + impliedDebtGrowth * 2;

    let riskPremium = 0;
    if(debt2YrFwd > 1.1) riskPremium += (debt2YrFwd - 1.1) * 0.04;
    if(debt2YrFwd > 1.5) riskPremium += (debt2YrFwd - 1.5) * 0.06;
    if(debt2YrFwd > 2.0) riskPremium += (debt2YrFwd - 2.0) * 0.10;
    if(ls < 0.50) riskPremium += (0.50 - ls) * 0.15;
    if(ls < 0.35) riskPremium += (0.35 - ls) * 0.20;
    if(currentPrimaryDef > 0.06) riskPremium += (currentPrimaryDef - 0.06) * 0.30;
    if(currentPrimaryDef > 0.12) riskPremium += (currentPrimaryDef - 0.12) * 0.50;

    // ══════════════════════════════════════════════════════════════════════
    // CRYPTO ADOPTION — FIVE CHANNELS
    // This is the model's most novel variable. Every other input has
    // historical precedent. Crypto as sovereign escape valve is genuinely new.
    // ══════════════════════════════════════════════════════════════════════

    // CHANNEL 1: BOND MARKET SENSITIVITY
    // Crypto gives capital a frictionless exit. Bond market knows it.
    // Risk premium spikes at LOWER debt levels because the credible threat
    // of exit changes the game. Greece had days before capital controls.
    // With crypto-native populations, you have hours.
    // Effect: amplifies risk premium, non-linearly at high adoption
    const cryptoSensitivity = 1 + Math.pow(p.crypto, 1.4) * 1.2;
    riskPremium *= cryptoSensitivity;

    // CHANNEL 2: CAPITAL FLIGHT SPEED — panic arrives faster and deeper
    // At high adoption, the panic threshold compresses dramatically.
    // Same fiscal deterioration, much faster market reaction.
    const panicCondition = debt2YrFwd > 1.8 && ls < 0.45 && currentPrimaryDef > 0.08;
    const cryptoPanicAmplifier = 1 + p.crypto * 0.6;
    if(panicCondition) {
      riskPremium += Math.pow((debt2YrFwd - 1.8), 1.5) * 0.30 * cryptoPanicAmplifier;
    }
    // Even pre-panic: early threshold compression
    if(debt2YrFwd > 1.3 && p.crypto > 0.4) {
      riskPremium += (debt2YrFwd - 1.3) * p.crypto * 0.04;
    }

    // CHANNEL 3: SEIGNIORAGE EROSION
    // Governments fund part of deficits via money creation. If citizens
    // hold crypto rather than domestic currency, the monetary base shrinks
    // and seigniorage revenue falls — widening the deficit directly.
    // Turkey 2021: crypto adoption surged as lira collapsed.
    // The central bank couldn't defend currency partly because crypto
    // made capital controls ineffective.
    const seigniorageErosion = p.crypto * 0.008 * (1 + Math.max(debt - 1.0, 0));
    currentPrimaryDef += seigniorageErosion;

    // CHANNEL 4: TAX BASE LEAKAGE
    // Crypto enables income/wealth outside reporting systems.
    // Low adoption: marginal. High adoption: meaningfully shrinks taxable base.
    // Argentina, Nigeria: significant informal crypto economy emerging.
    // Compounds with wage income share collapse — double hit on revenues.
    const taxLeakage = p.crypto * 0.005 * (1 - ls) * 1.5;
    currentPrimaryDef += taxLeakage;

    // CHANNEL 5: YCC EFFECTIVENESS DEGRADATION
    // Financial repression requires a CAPTIVE savings pool.
    // Crypto directly undermines this — you can't repress savers who
    // have already exited. At high adoption, YCC becomes progressively
    // harder to sustain. Applied in the YCC section below.
    // (Stored as cryptoYCCDrag, used in effectiveMarketRate calculation)
    const cryptoYCCDrag = p.ycc ? p.crypto * 0.3 : 0;

    // QE suppression — diminishing returns
    const qeSuppression = Math.min(p.qe * 0.4, riskPremium * 0.55);
    const netPremium = Math.max(riskPremium - qeSuppression, 0);

    // ── YCC REGIME SWITCH ─────────────────────────────────────────────────
    // FREE MARKET: yields rise freely → debt service explodes → debt/GDP spiral
    // YCC: yields capped → gap monetised → currency weakens → different crisis path
    let effectiveMarketRate, yccMonetisation = 0;
    if(p.ycc) {
      // CHANNEL 5: YCC EFFECTIVENESS DEGRADATION via crypto adoption
      // As crypto adoption rises, the captive savings pool that YCC requires shrinks.
      // The effective cap "leaks" — the central bank must print more to maintain it,
      // or accept a higher effective rate than the stated cap.
      // At max crypto adoption, YCC is ~40% less effective.
      const effectiveCap = p.ycccap * (1 + cryptoYCCDrag);  // cap drifts higher with crypto
      effectiveMarketRate = Math.min(p.rate + netPremium, effectiveCap);
      const suppressedPremium = Math.max((p.rate + netPremium) - effectiveCap, 0);
      // Additional monetisation required to fight crypto exit
      const cryptoFightingCost = p.crypto * 0.02 * debt;
      yccMonetisation = suppressedPremium * debt * 0.5 + cryptoFightingCost;
      yccMon = yccMonetisation;
      cons *= (1 + yccMonetisation * 0.4);
      asset *= (1 + yccMonetisation * 0.3);
    } else {
      effectiveMarketRate = Math.min(p.rate + netPremium, 0.22);
      yccMon = 0;
    }

    // Yields sticky upward — once bond market reprices, hard to bring back
    marketRate = Math.max(marketRate * 0.85 + effectiveMarketRate * 0.15, effectiveMarketRate);

    // ── BLANCHARD r - g ───────────────────────────────────────────────────
    // KEY DISTINCTION: GDP grows (AI productivity) but TAXABLE growth is far smaller.
    // Debt/GDP uses the headline GDP denominator — but the government can only service
    // debt from tax revenues, which follow the taxable base, not total output.
    //
    // In the AI transition:
    // - Wage income (taxed at ~22%) collapses with wage income share
    // - Investment income (taxed at captax %, but only domestically-captured portion)
    // - Consumer spending (VAT proxy) follows the wage bill, not GDP
    //
    // The denominator (GDP) grows with AI productivity.
    // The numerator (debt) grows with deficits + interest costs.
    // The RATIO falls only if nominal GDP growth > effective interest rate.
    // In practice: AI productivity goes to capital; fiscal revenues go with labour.
    // The denominator grows in headline terms but the government can't capture it.

    // Effective GDP growth for debt/GDP denominator:
    // AI productivity genuinely grows GDP (denominator gets bigger)
    // BUT: fiscal capacity only grows from taxable portions
    const gdpGrowth = prodGain - demandDrag * 0.4 + monetaryInflation + 0.015;

    // Fiscal drag: as wage income share falls, revenue falls faster than GDP grows
    // This is the core mechanism — GDP rises, government share of it collapses
    const fiscalCaptureFall = Math.max(INIT_LS - ls, 0) * 1.8;  // revenue lost per unit LS decline

    // Effective g for debt/GDP: GDP growth minus fiscal capture loss
    // This prevents the model from letting productivity gains "pay off" debt
    // that the government can't actually access
    const effectiveG = gdpGrowth - fiscalCaptureFall;

    const rMinusG = marketRate - effectiveG;
    debt = Math.max(debt + currentPrimaryDef + debt * rMinusG - yccMonetisation * 0.1, 0.10);
    debt = Math.min(debt, 4.0);

    // ── FLIGHT FROM FIAT ──────────────────────────────────────────────────
    // Gold: responds to fiscal stress, QE, and confidence loss
    // — rises when real rates negative, debt unsustainable, or YCC active
    // — also amplified by crypto adoption (more alternatives = less gold alone, but model adds)
    const realRate = marketRate - Math.max(monetaryInflation + demandDeflation + 0.025, -0.02);
    const fiscalStress = Math.max(debt - 0.9, 0);           // stress starts above 90% debt
    const qeSignal    = p.qe * 3.0;
    const yccSignal   = p.ycc ? yccMonetisation * 8 : 0;
    const negRateSignal = Math.max(-realRate * 6, 0);
    // Crypto adoption amplifies gold demand too — both are fiat alternatives
    // When crypto exits accelerate, gold follows (institutional rotation)
    const cryptoGoldCorrelation = p.crypto * fiscalStress * 0.08;
    const goldReturn = 0.01 + fiscalStress * 0.06 + qeSignal * 0.04
                     + yccSignal + negRateSignal + cryptoGoldCorrelation;
    goldPrice *= (1 + Math.min(goldReturn, 0.45));

    // Crypto exit: % of savings actively seeking non-sovereign store of value
    // This models the OBSERVABLE outcome of the five channels above:
    // - Seigniorage erosion → currency loses purchasing power → BTC looks better
    // - Tax leakage → informal economy grows → stablecoins spread
    // - YCC degradation → real rates deeply negative → crypto as savings vehicle
    // - Capital flight → crisis mode → max exit speed
    //
    // Historical anchors:
    // Turkey 2022: ~20% adoption after 80% lira collapse
    // Argentina: ~10-15% of savings in stablecoins/BTC during peso crises
    // Nigeria: ~30%+ crypto awareness, growing formal adoption
    //
    // Feedback loop: crypto exit → less tax revenue → worse deficit →
    //   higher risk premium → more crypto exit (self-reinforcing above threshold)
    const negRealRateBoost = Math.max(-realRate * 0.3, 0); // negative real rates → crypto
    const yccBoost = p.ycc ? yccMonetisation * 5 : 0;      // YCC monetisation → distrust
    const cryptoBaseDriver = p.crypto * (
      0.5                                        // base adoption growth
      + fiscalStress * 2.0                       // fiscal stress accelerates exit
      + Math.max(0.58 - ls, 0) * 2.5            // wage income share collapse → desperation
      + negRealRateBoost                         // deeply negative real rates → rational exit
      + yccBoost                                 // YCC monetisation → currency distrust
    );
    // Feedback: once cryptoExit > 5%, it becomes self-reinforcing (network effect)
    const networkBoost = cryptoExit > 0.05 ? cryptoExit * 0.15 : 0;
    cryptoExit = Math.min(cryptoExit + (cryptoBaseDriver + networkBoost) * 0.9,
                          p.crypto > 0 ? 15 + p.crypto * 8 : 2); // max exit scales with adoption

    // Fiat purchasing power erodes via QE, YCC monetisation, confidence,
    // AND the crypto shrinking pool effect: as adoption rises, remaining
    // fiat holders bear more of the seigniorage burden — each unit loses more.
    const cryptoShrinkingPool = cryptoExit * p.crypto * 0.003;
    const fiatErosion = p.qe * 0.18 + yccMonetisation * 0.25
                      + fiscalStress * 0.02 + cryptoShrinkingPool;
    fiatPower *= (1 - fiatErosion);
    fiatPower = Math.max(fiatPower, 5);
  }

  s.crisisYear = crisisYear;
  return s;
}
