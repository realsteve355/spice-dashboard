/**
 * AToken — unified A-token contract. ERC-721 underneath, but with five forms:
 *   UNILATERAL                — physical assets owned outright
 *   EQUITY_ASSET / EQUITY_LIABILITY  — paired company shares
 *   OBLIGATION_ASSET / OBLIGATION_LIABILITY — paired fixed-obligation
 *
 * Almost every external function is `onlyColony`. We deploy with `colony =
 * deployer` so the deployer signer can drive the full surface in tests.
 * Holders, companies, and counterparties are separate signers.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const FORM = {
  UNILATERAL: 0,
  EQUITY_ASSET: 1,
  EQUITY_LIABILITY: 2,
  OBLIGATION_ASSET: 3,
  OBLIGATION_LIABILITY: 4,
};

const E = (n) => ethers.parseEther(String(n));

describe("AToken", () => {
  async function deploy() {
    const [colony, alice, bob, carol, company, otherCo] = await ethers.getSigners();
    const AToken = await ethers.getContractFactory("AToken");
    // Constructor takes the colony address — tests use the deployer signer as colony.
    const at = await AToken.deploy(colony.address, "Fairbrook");
    return { at, colony, alice, bob, carol, company, otherCo };
  }

  describe("deployment", () => {
    it("name = 'SPICE A-Token', symbol = 'ATOKE'", async () => {
      const { at } = await loadFixture(deploy);
      expect(await at.name()).to.equal("SPICE A-Token");
      expect(await at.symbol()).to.equal("ATOKE");
    });

    it("colony and colonyName set from constructor", async () => {
      const { at, colony } = await loadFixture(deploy);
      expect(await at.colony()).to.equal(colony.address);
      expect(await at.colonyName()).to.equal("Fairbrook");
    });

    it("nextId starts at 1 (zero-id ambiguity avoided)", async () => {
      const { at } = await loadFixture(deploy);
      expect(await at.nextId()).to.equal(1n);
    });
  });

  // ── ERC-721 transfer block ───────────────────────────────────────────────
  describe("ERC-721 transfer block", () => {
    it("transferFrom reverts — must use Colony.transferAsset / transferEquity", async () => {
      const { at, alice, bob } = await loadFixture(deploy);
      await expect(
        at.connect(alice).transferFrom(alice.address, bob.address, 1)
      ).to.be.revertedWith("AToken: use Colony.transferAsset or Colony.transferEquity");
    });

    it("approve reverts — approvals disabled", async () => {
      const { at, alice, bob } = await loadFixture(deploy);
      await expect(
        at.connect(alice).approve(bob.address, 1)
      ).to.be.revertedWith("AToken: approvals disabled - use Colony");
    });
  });

  // ── Form 1 — Unilateral asset ────────────────────────────────────────────
  describe("registerAsset — threshold rules", () => {
    it("only colony can call", async () => {
      const { at, alice } = await loadFixture(deploy);
      await expect(
        at.connect(alice).registerAsset(alice.address, "Robot", E(600), 0, false, 0, 1)
      ).to.be.revertedWith("AToken: only Colony");
    });

    it("rejects assets below all three threshold criteria", async () => {
      // value 100 S, weight 10 kg, no AI — fails all three
      const { at, colony, alice } = await loadFixture(deploy);
      await expect(
        at.connect(colony).registerAsset(alice.address, "Tiny", E(100), 10, false, 0, 1)
      ).to.be.revertedWith("AToken: below registration threshold");
    });

    it("accepts when value > 500 S", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "Vehicle", E(600), 10, false, 0, 1);
      expect(await at.ownerOf(1)).to.equal(alice.address);
    });

    it("accepts when weight > 50 kg (even if value low)", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "Heavy", E(100), 60, false, 0, 1);
      expect(await at.ownerOf(1)).to.equal(alice.address);
    });

    it("accepts when hasAutonomousAI = true (even if value/weight low)", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "AI bot", E(100), 10, true, 0, 1);
      expect(await at.ownerOf(1)).to.equal(alice.address);
    });

    it("rejects zero holder", async () => {
      const { at, colony } = await loadFixture(deploy);
      await expect(
        at.connect(colony).registerAsset(ethers.ZeroAddress, "X", E(600), 0, false, 0, 1)
      ).to.be.revertedWith("AToken: zero holder");
    });

    it("stores label, value, weight, AI flag, depreciation, registration epoch", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "Tractor", E(800), 70, false, 100, 5);
      expect(await at.assetLabel(1)).to.equal("Tractor");
      const a = await at.assetData(1);
      expect(a[0]).to.equal(E(800));   // valueSTokens
      expect(a[1]).to.equal(70n);      // weightKg
      expect(a[2]).to.equal(false);    // hasAutonomousAI
      expect(a[3]).to.equal(100n);     // depreciationBps
      expect(a[4]).to.equal(5n);       // registrationEpoch
    });

    it("emits AssetRegistered(id, holder, value)", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await expect(at.connect(colony).registerAsset(alice.address, "X", E(600), 0, false, 0, 1))
        .to.emit(at, "AssetRegistered")
        .withArgs(1, alice.address, E(600));
    });

    it("nextId increments after registration", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "A", E(600), 0, false, 0, 1);
      await at.connect(colony).registerAsset(alice.address, "B", E(600), 0, false, 0, 1);
      expect(await at.nextId()).to.equal(3n);
    });
  });

  describe("transferAsset", () => {
    it("only colony can call", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "X", E(600), 0, false, 0, 1);
      await expect(
        at.connect(alice).transferAsset(1, bob.address, E(700))
      ).to.be.revertedWith("AToken: only Colony");
    });

    it("moves token to new holder and updates declared value", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "X", E(600), 0, false, 0, 1);
      await at.connect(colony).transferAsset(1, bob.address, E(750));
      expect(await at.ownerOf(1)).to.equal(bob.address);
      expect((await at.assetData(1))[0]).to.equal(E(750));
    });

    it("rejects transfer of equity tokens via this path (form check)", async () => {
      const { at, colony, alice, bob, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [], []);
      await expect(
        at.connect(colony).transferAsset(1, bob.address, E(100))
      ).to.be.revertedWith("AToken: not an asset token");
    });
  });

  describe("currentAssetValue — depreciation", () => {
    it("returns full value when depreciationBps = 0", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "X", E(1000), 0, false, 0, 1);
      expect(await at.currentAssetValue(1, 100)).to.equal(E(1000));
    });

    it("returns full value when currentEpoch <= registrationEpoch", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "X", E(1000), 0, false, 100, 10);
      expect(await at.currentAssetValue(1, 10)).to.equal(E(1000));
      expect(await at.currentAssetValue(1, 5)).to.equal(E(1000));
    });

    it("applies linear depreciation per epoch (100 bps × 10 epochs = 10%)", async () => {
      // value 1000, dep 100 bps/epoch = 1%/epoch, 10 epochs elapsed
      // expected = 1000 × (10000 - 1000) / 10000 = 900
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "X", E(1000), 0, false, 100, 1);
      expect(await at.currentAssetValue(1, 11)).to.equal(E(900));
    });

    it("returns 0 once total depreciation hits 100% (10000 bps)", async () => {
      // 200 bps × 50 epochs = 10000 bps → 0
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "X", E(1000), 0, false, 200, 1);
      expect(await at.currentAssetValue(1, 51)).to.equal(0n);
      expect(await at.currentAssetValue(1, 100)).to.equal(0n);
    });

    it("rejects non-asset tokens (form check)", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [], []);
      await expect(
        at.currentAssetValue(1, 5)
      ).to.be.revertedWith("AToken: not an asset token");
    });
  });

  // ── Form 2 — Equity ──────────────────────────────────────────────────────
  describe("issueEquity", () => {
    it("only colony can call", async () => {
      const { at, alice, company } = await loadFixture(deploy);
      await expect(
        at.connect(alice).issueEquity(company.address, alice.address, 1000, [], [])
      ).to.be.revertedWith("AToken: only Colony");
    });

    it("creates EQUITY_ASSET (holder) and EQUITY_LIABILITY (company) — first call", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [], []);
      // Token 1: liability (company); Token 2: asset (holder)
      expect(await at.ownerOf(1)).to.equal(company.address);
      expect(await at.ownerOf(2)).to.equal(alice.address);
    });

    it("reuses the same liability token for subsequent issuances to same company", async () => {
      const { at, colony, alice, bob, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [], []);
      await at.connect(colony).issueEquity(company.address, bob.address,   500, [], []);
      // First call: 1=liability, 2=alice asset; Second call: 3=bob asset (no new liability)
      expect(await at.ownerOf(1)).to.equal(company.address);
      expect(await at.ownerOf(2)).to.equal(alice.address);
      expect(await at.ownerOf(3)).to.equal(bob.address);
      expect(await at.nextId()).to.equal(4n);
    });

    it("immediate vest when no schedule passed (vested = total)", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [], []);
      const [total, vested] = await at.getVestingStake(2);
      expect(total).to.equal(1000n);
      expect(vested).to.equal(1000n);
    });

    it("with schedule: starts at vested = 0", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1200, [1, 2, 3], [400, 400, 400]);
      const [total, vested] = await at.getVestingStake(2);
      expect(total).to.equal(1200n);
      expect(vested).to.equal(0n);
    });

    it("rejects when tranche bps don't sum to stake", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await expect(
        at.connect(colony).issueEquity(company.address, alice.address, 1000, [1, 2], [400, 400])
      ).to.be.revertedWith("AToken: tranche bps must sum to stakeBps");
    });

    it("rejects when schedule arrays mismatch", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await expect(
        at.connect(colony).issueEquity(company.address, alice.address, 1000, [1, 2], [1000])
      ).to.be.revertedWith("AToken: schedule length mismatch");
    });

    it("rejects zero stake / zero holder / zero company", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await expect(
        at.connect(colony).issueEquity(company.address, alice.address, 0, [], [])
      ).to.be.revertedWith("AToken: zero stake");
      await expect(
        at.connect(colony).issueEquity(ethers.ZeroAddress, alice.address, 1000, [], [])
      ).to.be.revertedWith("AToken: zero company");
      await expect(
        at.connect(colony).issueEquity(company.address, ethers.ZeroAddress, 1000, [], [])
      ).to.be.revertedWith("AToken: zero holder");
    });
  });

  describe("claimVestedTranches", () => {
    it("unlocks tranches whose epoch ≤ currentEpoch and updates vestedBps", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      // Three tranches of 400 bps at epochs 2, 4, 6
      await at.connect(colony).issueEquity(company.address, alice.address, 1200, [2, 4, 6], [400, 400, 400]);
      // At epoch 5: epochs 2 and 4 should have vested (800 bps); epoch 6 still locked
      const tx = await at.connect(colony).claimVestedTranches(2, 5);
      await tx.wait();
      const [total, vested] = await at.getVestingStake(2);
      expect(vested).to.equal(800n);
      expect(total).to.equal(1200n);
    });

    it("idempotent — calling again at the same epoch does nothing", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1200, [2, 4, 6], [400, 400, 400]);
      await at.connect(colony).claimVestedTranches(2, 5);
      await at.connect(colony).claimVestedTranches(2, 5);  // no-op
      const [, vested] = await at.getVestingStake(2);
      expect(vested).to.equal(800n);
    });

    it("fully vests once currentEpoch passes the last tranche", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1200, [2, 4, 6], [400, 400, 400]);
      await at.connect(colony).claimVestedTranches(2, 100);
      const [total, vested] = await at.getVestingStake(2);
      expect(vested).to.equal(total);
    });
  });

  describe("forfeitUnvested", () => {
    it("reduces totalStakeBps to vestedBps", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1200, [2, 4, 6], [400, 400, 400]);
      await at.connect(colony).claimVestedTranches(2, 5);  // 800 vested
      await at.connect(colony).forfeitUnvested(2);
      const [total, vested] = await at.getVestingStake(2);
      expect(total).to.equal(800n);
      expect(vested).to.equal(800n);
    });

    it("deactivates the token when nothing vested (totalStakeBps == 0)", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [10], [1000]);
      // Nothing vested yet at epoch 1
      await at.connect(colony).forfeitUnvested(2);
      // Token should be burned (ownerOf reverts with OZ ERC721NonexistentToken)
      await expect(at.ownerOf(2)).to.be.reverted;
    });
  });

  describe("transferEquity — vested-only", () => {
    it("rejects transfer of unvested bps", async () => {
      const { at, colony, alice, bob, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [10], [1000]);
      await expect(
        at.connect(colony).transferEquity(2, bob.address, 500)
      ).to.be.revertedWith("AToken: insufficient vested stake");
    });

    it("creates a fresh fully-vested token for the recipient", async () => {
      const { at, colony, alice, bob, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [], []);
      await at.connect(colony).transferEquity(2, bob.address, 400);
      // alice's token (id 2) reduced; bob gets a new token (id 3) with 400 bps
      const [aliceTotal, aliceVested] = await at.getVestingStake(2);
      const [bobTotal,   bobVested]   = await at.getVestingStake(3);
      expect(aliceTotal).to.equal(600n);
      expect(aliceVested).to.equal(600n);
      expect(bobTotal).to.equal(400n);
      expect(bobVested).to.equal(400n);
    });

    it("rejects self-transfer", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [], []);
      await expect(
        at.connect(colony).transferEquity(2, alice.address, 100)
      ).to.be.revertedWith("AToken: self-transfer");
    });
  });

  // ── Form 3 — Obligation ──────────────────────────────────────────────────
  describe("issueObligation — unsecured + UBI cap", () => {
    it("creates paired tokens (asset to creditor, liability to obligor)", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(50), 6, 0, E(1000));
      // Token 1 = obligation_liability (bob); Token 2 = obligation_asset (alice)
      expect(await at.ownerOf(1)).to.equal(bob.address);
      expect(await at.ownerOf(2)).to.equal(alice.address);
    });

    it("rejects zero monthly amount or zero epochs", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await expect(
        at.connect(colony).issueObligation(alice.address, bob.address, 0, 6, 0, E(1000))
      ).to.be.revertedWith("AToken: zero payment amount");
      await expect(
        at.connect(colony).issueObligation(alice.address, bob.address, E(50), 0, 0, E(1000))
      ).to.be.revertedWith("AToken: zero epochs");
    });

    it("enforces UBI cap on unsecured for citizen obligors", async () => {
      // First obligation: 800 S/mo against a 1000 cap — OK
      // Second: 300 S/mo would push total to 1100 > 1000 — rejected
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(800), 6, 0, E(1000));
      await expect(
        at.connect(colony).issueObligation(alice.address, bob.address, E(300), 6, 0, E(1000))
      ).to.be.revertedWith("AToken: obligation would exceed UBI cap");
    });

    it("cap exactly met is accepted", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(1000), 6, 0, E(1000));
      // OK — second token 2 was minted
      expect(await at.nextId()).to.equal(3n);
    });

    it("maxMonthlyS = 0 disables cap (used for company obligors)", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      // No cap → both giant obligations accepted
      await at.connect(colony).issueObligation(alice.address, bob.address, E(5000), 6, 0, 0);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(5000), 6, 0, 0);
      expect(await at.nextId()).to.equal(5n);
    });

    it("totalMonthlyUnsecuredObligations sums correctly", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(200), 6, 0, E(1000));
      await at.connect(colony).issueObligation(alice.address, bob.address, E(300), 6, 0, E(1000));
      expect(await at.totalMonthlyUnsecuredObligations(bob.address)).to.equal(E(500));
    });
  });

  describe("issueObligation — secured + collateral escrow", () => {
    it("locks collateral asset in escrow on activation", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      // Bob owns asset id 1 worth 5000 S
      await at.connect(colony).registerAsset(bob.address, "Truck", E(5000), 0, false, 0, 1);
      // Alice lends; bob pledges asset 1 as collateral. No UBI cap because secured.
      await at.connect(colony).issueObligation(alice.address, bob.address, E(2000), 6, 1, E(1000));
      expect(await at.escrowedFor(1)).to.equal(2n); // liability id is 2
    });

    it("rejects transferAsset of an escrowed token", async () => {
      const { at, colony, alice, bob, carol } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(bob.address, "Truck", E(5000), 0, false, 0, 1);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(2000), 6, 1, 0);
      await expect(
        at.connect(colony).transferAsset(1, carol.address, E(5000))
      ).to.be.revertedWith("AToken: token is in escrow");
    });

    it("rejects re-collateralisation of an already-escrowed token", async () => {
      const { at, colony, alice, bob, carol } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(bob.address, "Truck", E(5000), 0, false, 0, 1);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(2000), 6, 1, 0);
      await expect(
        at.connect(colony).issueObligation(carol.address, bob.address, E(1000), 6, 1, 0)
      ).to.be.revertedWith("AToken: collateral already in escrow");
    });

    it("rejects when collateral is not owned by the obligor", async () => {
      const { at, colony, alice, bob, carol } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(carol.address, "Truck", E(5000), 0, false, 0, 1);
      await expect(
        at.connect(colony).issueObligation(alice.address, bob.address, E(2000), 6, 1, 0)
      ).to.be.revertedWith("AToken: obligor must own the collateral");
    });
  });

  describe("markObligationPaid — settlement progression", () => {
    it("increments epochsPaid; not yet completed", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(100), 3, 0, E(1000));
      const tx = await at.connect(colony).markObligationPaid(1);
      await tx.wait();
      const ob = await at.getObligation(1);
      // returns: obligor, creditor, monthlyAmountS, totalEpochs, epochsPaid, collateralId, defaulted
      expect(ob[4]).to.equal(1n);   // epochsPaid = 1
      expect(await at.ownerOf(1)).to.equal(bob.address);  // still active
    });

    it("on final epoch: deactivates both tokens and emits ObligationCompleted", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(100), 2, 0, E(1000));
      await at.connect(colony).markObligationPaid(1);
      await expect(at.connect(colony).markObligationPaid(1))
        .to.emit(at, "ObligationCompleted")
        .withArgs(1);
      // Both tokens burned
      await expect(at.ownerOf(1)).to.be.reverted;
      await expect(at.ownerOf(2)).to.be.reverted;
    });

    it("completion releases escrowed collateral back to obligor (still owner)", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(bob.address, "Truck", E(5000), 0, false, 0, 1);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(100), 2, 1, 0);
      await at.connect(colony).markObligationPaid(2);
      await at.connect(colony).markObligationPaid(2);
      // Collateral now released — escrow cleared, bob still owns
      expect(await at.escrowedFor(1)).to.equal(0n);
      expect(await at.ownerOf(1)).to.equal(bob.address);
    });
  });

  describe("markObligationDefaulted — secured only", () => {
    it("rejects on unsecured obligation", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(100), 3, 0, E(1000));
      await expect(
        at.connect(colony).markObligationDefaulted(1, alice.address)
      ).to.be.revertedWith("AToken: unsecured - no collateral to seize");
    });

    it("transfers collateral to creditor and deactivates obligation pair", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(bob.address, "Truck", E(5000), 0, false, 0, 1);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(100), 6, 1, 0);
      await at.connect(colony).markObligationDefaulted(2, alice.address);
      // Collateral now belongs to alice (creditor)
      expect(await at.ownerOf(1)).to.equal(alice.address);
      // Obligation pair deactivated
      await expect(at.ownerOf(2)).to.be.reverted;
      await expect(at.ownerOf(3)).to.be.reverted;
    });
  });

  // ── Views ────────────────────────────────────────────────────────────────
  describe("Views", () => {
    it("tokensOf returns only active token IDs held by an address", async () => {
      const { at, colony, alice, company } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "X", E(600), 0, false, 0, 1);
      await at.connect(colony).issueEquity(company.address, alice.address, 1000, [], []);
      // alice holds asset 1 + equity 3 (id 2 is the liability to company)
      const ids = await at.tokensOf(alice.address);
      expect(ids.map(Number).sort()).to.deep.equal([1, 3]);
    });

    it("getEquityTable returns holders + total + vested per holder", async () => {
      const { at, colony, alice, bob, company } = await loadFixture(deploy);
      await at.connect(colony).issueEquity(company.address, alice.address, 600, [], []);
      await at.connect(colony).issueEquity(company.address, bob.address,   400, [10], [400]);
      const [holders, totals, vesteds] = await at.getEquityTable(company.address);
      expect(holders).to.deep.equal([alice.address, bob.address]);
      expect(totals.map(Number)).to.deep.equal([600, 400]);
      expect(vesteds.map(Number)).to.deep.equal([600, 0]); // alice immediate, bob still locked
    });

    it("activeObligationIds tracks active obligations and removes completed ones", async () => {
      const { at, colony, alice, bob } = await loadFixture(deploy);
      await at.connect(colony).issueObligation(alice.address, bob.address, E(100), 1, 0, E(1000));
      const active = await at.activeObligationIds();
      expect(active.map(Number)).to.deep.equal([1]);
      // Single epoch → completed on first markPaid
      await at.connect(colony).markObligationPaid(1);
      const after = await at.activeObligationIds();
      expect(after.length).to.equal(0);
    });

    it("getTokenHolder returns the active holder address", async () => {
      const { at, colony, alice } = await loadFixture(deploy);
      await at.connect(colony).registerAsset(alice.address, "X", E(600), 0, false, 0, 1);
      expect(await at.getTokenHolder(1)).to.equal(alice.address);
    });
  });
});
