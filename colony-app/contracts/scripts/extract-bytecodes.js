/**
 * Extract contract ABIs and bytecodes from Hardhat artifacts and write
 * deployArtifacts.js for use in CreateColony.jsx (browser-side deploy wizard).
 *
 * Usage:
 *   npx hardhat compile          (if contracts changed)
 *   node scripts/extract-bytecodes.js
 *
 * Output: colony-app/src/data/deployArtifacts.js
 *
 * Contracts included:
 *   - GToken, SToken, VToken, OToken     — token contracts deployed per colony
 *   - Colony                             — ABI only (deployed as BeaconProxy)
 *   - BeaconProxy                        — ABI + bytecode (deployed by user wizard)
 *   - UpgradeableBeacon                  — ABI + bytecode (company beacon)
 *   - CompanyImplementation              — ABI + bytecode
 *   - CompanyFactory                     — ABI + bytecode
 *   - AToken                             — ABI + bytecode
 *   - MCCBilling, MCCServices            — ABI + bytecode
 */

const fs   = require("fs");
const path = require("path");

const ARTIFACTS_DIR = path.join(__dirname, "../artifacts/src");
const OZ_DIR        = path.join(__dirname, "../artifacts/@openzeppelin");
const OUT_FILE      = path.join(__dirname, "../../src/data/deployArtifacts.js");

// Contracts to include — [name, artifactsRelPath, includesBytecode, optionalBaseDir]
// Colony is ABI-only: the wizard deploys BeaconProxy and attaches Colony ABI to it.
const CONTRACTS = [
  ["GToken",                 "GToken.sol/GToken.json",                                               true],
  ["SToken",                 "SToken.sol/SToken.json",                                               true],
  ["VToken",                 "VToken.sol/VToken.json",                                               true],
  ["OToken",                 "OToken.sol/OToken.json",                                               true],
  ["Colony",                 "Colony.sol/Colony.json",                                               false], // ABI only — deployed as BeaconProxy
  ["UpgradeableBeacon",      "contracts/proxy/beacon/UpgradeableBeacon.sol/UpgradeableBeacon.json",  true, OZ_DIR],
  ["BeaconProxy",            "contracts/proxy/beacon/BeaconProxy.sol/BeaconProxy.json",              true, OZ_DIR],
  ["CompanyImplementation",  "CompanyImplementation.sol/CompanyImplementation.json",                 true],
  ["CompanyFactory",         "CompanyFactory.sol/CompanyFactory.json",                               true],
  ["AToken",                 "AToken.sol/AToken.json",                                               true],
  ["MCCBilling",             "MCCBilling.sol/MCCBilling.json",                                       true],
  ["MCCServices",            "MCCServices.sol/MCCServices.json",                                     true],
  ["Governance",             "Governance.sol/Governance.json",                                       true],
];

function load(name, relPath, withBytecode, baseDir) {
  const base    = baseDir || ARTIFACTS_DIR;
  const full    = path.join(base, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`Artifact not found: ${full}\nRun: npx hardhat compile`);
  }
  const artifact = JSON.parse(fs.readFileSync(full, "utf8"));
  const entry    = { abi: artifact.abi };
  if (withBytecode) entry.bytecode = artifact.bytecode;
  return [name, entry];
}

const entries = CONTRACTS.map(([name, rel, withBytecode, baseDir]) =>
  load(name, rel, withBytecode, baseDir)
);

const obj = Object.fromEntries(entries);

const totalBytes = JSON.stringify(obj).length;
const out = `// AUTO-GENERATED from Hardhat artifacts — do not edit manually.
// Run: node scripts/extract-bytecodes.js to regenerate.
// Colony is ABI-only — colonies are deployed as BeaconProxy instances.

export const ARTIFACTS = ${JSON.stringify(obj, null, 2)};
`;

fs.writeFileSync(OUT_FILE, out);
console.log(`✓ deployArtifacts.js written (${(totalBytes / 1024).toFixed(0)} KB)`);
console.log(`  Contracts: ${entries.map(([n]) => n).join(", ")}`);
