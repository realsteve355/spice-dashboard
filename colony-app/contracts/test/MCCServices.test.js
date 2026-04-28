/**
 * MCCServices — on-chain catalogue of MCC services.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MCCServices", () => {
  async function deploy() {
    const [founder, alice] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockColonyForMcc");
    const mock = await Mock.deploy(founder.address, ethers.ZeroAddress);
    const Services = await ethers.getContractFactory("MCCServices");
    const s = await Services.deploy(await mock.getAddress());
    return { s, mock, founder, alice };
  }

  describe("addService", () => {
    it("only founder can add", async () => {
      const { s, alice } = await loadFixture(deploy);
      await expect(s.connect(alice).addService("Water", "metered", "5 S/m³"))
        .to.be.revertedWith("MCCServices: not colony founder");
    });

    it("rejects empty name", async () => {
      const { s, founder } = await loadFixture(deploy);
      await expect(s.connect(founder).addService("", "monthly", "10 S"))
        .to.be.revertedWith("MCCServices: name required");
    });

    it("returns id 0 for first service, increments", async () => {
      const { s, founder } = await loadFixture(deploy);
      await s.connect(founder).addService("Water", "metered", "5 S/m³");
      await s.connect(founder).addService("Power", "metered", "0.10 S/kWh");
      expect(await s.serviceCount()).to.equal(2n);
    });

    it("emits ServiceAdded(id, name, price)", async () => {
      const { s, founder } = await loadFixture(deploy);
      await expect(s.connect(founder).addService("Power", "metered", "0.10 S/kWh"))
        .to.emit(s, "ServiceAdded").withArgs(0, "Power", "0.10 S/kWh");
    });
  });

  describe("editService", () => {
    it("rejects when service id not found", async () => {
      const { s, founder } = await loadFixture(deploy);
      await expect(s.connect(founder).editService(0, "x", "y", "z"))
        .to.be.revertedWith("MCCServices: not found");
    });

    it("updates fields and emits ServiceEdited", async () => {
      const { s, founder } = await loadFixture(deploy);
      await s.connect(founder).addService("Water", "metered", "5 S/m³");
      await expect(s.connect(founder).editService(0, "Water", "metered", "6 S/m³"))
        .to.emit(s, "ServiceEdited").withArgs(0, "Water", "6 S/m³");
      const list = await s.getServices();
      expect(list[3][0]).to.equal("6 S/m³");
    });

    it("rejects edits on a removed service", async () => {
      const { s, founder } = await loadFixture(deploy);
      await s.connect(founder).addService("Water", "metered", "5 S/m³");
      await s.connect(founder).removeService(0);
      await expect(s.connect(founder).editService(0, "x", "y", "z"))
        .to.be.revertedWith("MCCServices: service removed");
    });
  });

  describe("removeService", () => {
    it("soft-removes (active = false)", async () => {
      const { s, founder } = await loadFixture(deploy);
      await s.connect(founder).addService("Water", "metered", "5 S/m³");
      await s.connect(founder).addService("Power", "metered", "0.10 S/kWh");
      await s.connect(founder).removeService(0);
      const [ids, names] = await s.getServices();
      expect(ids.map(Number)).to.deep.equal([1]);
      expect(names).to.deep.equal(["Power"]);
    });

    it("serviceCount counts removed services too", async () => {
      const { s, founder } = await loadFixture(deploy);
      await s.connect(founder).addService("Water", "metered", "5 S/m³");
      await s.connect(founder).removeService(0);
      expect(await s.serviceCount()).to.equal(1n);
    });
  });

  describe("getServices", () => {
    it("returns parallel arrays of active services only", async () => {
      const { s, founder } = await loadFixture(deploy);
      await s.connect(founder).addService("Water", "metered", "5 S/m³");
      await s.connect(founder).addService("Power", "metered", "0.10 S/kWh");
      await s.connect(founder).addService("Waste", "monthly", "30 S");
      const [ids, names, billings, prices] = await s.getServices();
      expect(ids.map(Number)).to.deep.equal([0, 1, 2]);
      expect(names).to.deep.equal(["Water", "Power", "Waste"]);
      expect(billings).to.deep.equal(["metered", "metered", "monthly"]);
      expect(prices).to.deep.equal(["5 S/m³", "0.10 S/kWh", "30 S"]);
    });
  });
});
