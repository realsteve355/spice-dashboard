/**
 * MCCBilling — per-citizen bill tracking + monthly revenue counter.
 * Tests use MockColonyForMcc to control founder + citizen status.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const E = (n) => ethers.parseEther(String(n));

describe("MCCBilling", () => {
  async function deploy() {
    const [founder, alice, bob, carol, stranger] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockColonyForMcc");
    const mock = await Mock.deploy(founder.address, ethers.ZeroAddress);
    await mock.setCitizen(alice.address, true);
    await mock.setCitizen(bob.address,   true);
    await mock.setCitizen(carol.address, true);
    await mock.setCitizen(stranger.address, false);

    const Billing = await ethers.getContractFactory("MCCBilling");
    const b = await Billing.deploy(await mock.getAddress());
    return { b, mock, founder, alice, bob, carol, stranger };
  }

  describe("setBill", () => {
    it("only founder can set", async () => {
      const { b, alice } = await loadFixture(deploy);
      await expect(b.connect(alice).setBill(alice.address, 50))
        .to.be.revertedWith("MCCBilling: not founder");
    });

    it("rejects non-citizens", async () => {
      const { b, founder, stranger } = await loadFixture(deploy);
      await expect(b.connect(founder).setBill(stranger.address, 50))
        .to.be.revertedWith("MCCBilling: not a citizen");
    });

    it("stores amount × 1e18 (S-token wei)", async () => {
      const { b, founder, alice } = await loadFixture(deploy);
      await b.connect(founder).setBill(alice.address, 50);
      expect(await b.billOf(alice.address)).to.equal(E(50));
    });

    it("emits BillSet with the wei amount", async () => {
      const { b, founder, alice } = await loadFixture(deploy);
      await expect(b.connect(founder).setBill(alice.address, 50))
        .to.emit(b, "BillSet").withArgs(alice.address, E(50));
    });

    it("setBillBatch sets many at once", async () => {
      const { b, founder, alice, bob, carol } = await loadFixture(deploy);
      await b.connect(founder).setBillBatch(
        [alice.address, bob.address, carol.address],
        [10, 20, 30]
      );
      expect(await b.billOf(alice.address)).to.equal(E(10));
      expect(await b.billOf(bob.address)).to.equal(E(20));
      expect(await b.billOf(carol.address)).to.equal(E(30));
    });

    it("setBillBatch rejects length mismatch", async () => {
      const { b, founder, alice, bob } = await loadFixture(deploy);
      await expect(
        b.connect(founder).setBillBatch([alice.address, bob.address], [10])
      ).to.be.revertedWith("MCCBilling: length mismatch");
    });
  });

  describe("recordPayment", () => {
    it("only founder can call", async () => {
      const { b, founder, alice } = await loadFixture(deploy);
      await b.connect(founder).setBill(alice.address, 50);
      await expect(
        b.connect(alice).recordPayment(alice.address)
      ).to.be.revertedWith("MCCBilling: not founder");
    });

    it("rejects when no outstanding bill", async () => {
      const { b, founder, alice } = await loadFixture(deploy);
      await expect(
        b.connect(founder).recordPayment(alice.address)
      ).to.be.revertedWith("MCCBilling: no outstanding bill");
    });

    it("clears bill, increments totalRevenueMTD, emits both events", async () => {
      const { b, founder, alice } = await loadFixture(deploy);
      await b.connect(founder).setBill(alice.address, 75);
      await expect(b.connect(founder).recordPayment(alice.address))
        .to.emit(b, "PaymentRecorded").withArgs(alice.address, E(75))
        .and.to.emit(b, "BillCleared").withArgs(alice.address);
      expect(await b.billOf(alice.address)).to.equal(0n);
      expect(await b.totalRevenueMTD()).to.equal(E(75));
    });

    it("accumulates revenue across multiple payments", async () => {
      const { b, founder, alice, bob } = await loadFixture(deploy);
      await b.connect(founder).setBillBatch([alice.address, bob.address], [40, 60]);
      await b.connect(founder).recordPayment(alice.address);
      await b.connect(founder).recordPayment(bob.address);
      expect(await b.totalRevenueMTD()).to.equal(E(100));
    });
  });

  describe("clearBill", () => {
    it("clears without recording revenue", async () => {
      const { b, founder, alice } = await loadFixture(deploy);
      await b.connect(founder).setBill(alice.address, 50);
      await b.connect(founder).clearBill(alice.address);
      expect(await b.billOf(alice.address)).to.equal(0n);
      expect(await b.totalRevenueMTD()).to.equal(0n);
    });

    it("only founder can call", async () => {
      const { b, alice } = await loadFixture(deploy);
      await expect(
        b.connect(alice).clearBill(alice.address)
      ).to.be.revertedWith("MCCBilling: not founder");
    });
  });

  describe("resetMonth", () => {
    it("zeroes the revenue counter", async () => {
      const { b, founder, alice } = await loadFixture(deploy);
      await b.connect(founder).setBill(alice.address, 100);
      await b.connect(founder).recordPayment(alice.address);
      expect(await b.totalRevenueMTD()).to.equal(E(100));
      await b.connect(founder).resetMonth();
      expect(await b.totalRevenueMTD()).to.equal(0n);
    });

    it("emits MonthReset", async () => {
      const { b, founder } = await loadFixture(deploy);
      await expect(b.connect(founder).resetMonth()).to.emit(b, "MonthReset");
    });

    it("only founder can call", async () => {
      const { b, alice } = await loadFixture(deploy);
      await expect(b.connect(alice).resetMonth())
        .to.be.revertedWith("MCCBilling: not founder");
    });
  });

  describe("getBills batch view", () => {
    it("returns parallel array of amounts", async () => {
      const { b, founder, alice, bob, carol } = await loadFixture(deploy);
      await b.connect(founder).setBillBatch([alice.address, bob.address], [10, 20]);
      const result = await b.getBills([alice.address, bob.address, carol.address]);
      expect(result.map(v => v)).to.deep.equal([E(10), E(20), 0n]);
    });
  });
});
