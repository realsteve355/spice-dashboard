import simulate from "./simulate.js";

// Default slider values, converted exactly as P() does in collision.html
const params = {
  auto:     15   / 100,  // sl-auto default 15
  reinstate:20   / 100,  // sl-reinstate default 20
  prod:     4.0,         // sl-prod default 4.0
  rec:      1.20,        // sl-rec default 1.20
  lag:      1,           // sl-lag default 1
  debt:     98   / 100,  // sl-debt default 98
  def:      4    / 100,  // sl-def default 4
  rate:     4.5  / 100,  // sl-rate default 4.5
  captax:   8    / 100,  // sl-captax default 8
  domcap:   50   / 100,  // sl-domcap default 50
  qe:       2    / 100,  // sl-qe default 2
  ubi:      0    / 100,  // sl-ubi default 0
  gini:     3,           // sl-gini default 3
  crypto:   1    / 10,   // sl-crypto default 1
  ycc:      false,
  ycccap:   2.0  / 100,  // sl-ycccap default 2.0
};

const result = simulate(params);

console.log("Years simulated:", result.years.length);
console.log("Crisis year:", result.crisisYear);
console.log("\nYear-by-year summary:");
result.years.forEach((year, i) => {
  console.log(
    `  ${year}  debt=${result.debt[i]}%  score=${result.score[i]}  wage=${result.wage[i]}  u=${result.u[i]}%`
  );
});
