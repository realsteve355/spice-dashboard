/**
 * VToken — long-term savings token. Citizens convert S→V capped at 200/month.
 * Companies have no cap. V is non-transferable peer-to-peer; only the Colony
 * (owner) can mint, burn, or move tokens.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const TWO_HUNDRED = ethers.parseEther("200");

describe("VToken", () => {
  async function deploy() {
    const [owner, alice, bob, company] = await ethers.getSigners();
    const VToken = await ethers.getContractFactory("VToken");
    const v = await VToken.deploy("FBR");
    return { v, owner, alice, bob, company };
  }

  describe("deployment", () => {
    it("name = '<ticker> V-Token', symbol = 'V-<ticker>'", async () => {
      const { v } = await loadFixture(deploy);
      expect(await v.name()).to.equal("FBR V-Token");
      expect(await v.symbol()).to.equal("V-FBR");
    });

    it("MAX_SAVE_PER_MONTH constant is 200 × 1e18", async () => {
      const { v } = await loadFixture(deploy);
      expect(await v.MAX_SAVE_PER_MONTH()).to.equal(TWO_HUNDRED);
    });

    it("currentEpoch starts at 1", async () => {
      const { v } = await loadFixture(deploy);
      expect(await v.currentEpoch()).to.equal(1n);
    });
  });

  describe("citizen mint — 200/month cap", () => {
    it("only owner can mint", async () => {
      const { v, alice } = await loadFixture(deploy);
      await expect(
        v.connect(alice).mint(alice.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(v, "OwnableUnauthorizedAccount");
    });

    it("allows up to exactly 200 in one mint", async () => {
      const { v, owner, alice } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, TWO_HUNDRED);
      expect(await v.balanceOf(alice.address)).to.equal(TWO_HUNDRED);
      expect(await v.savedThisEpoch(alice.address, 1)).to.equal(TWO_HUNDRED);
    });

    it("rejects a single mint above 200", async () => {
      const { v, owner, alice } = await loadFixture(deploy);
      await expect(
        v.connect(owner).mint(alice.address, ethers.parseEther("201"))
      ).to.be.revertedWith("VToken: exceeds monthly savings limit");
    });

    it("allows splitting up to 200 across multiple mints in one epoch", async () => {
      const { v, owner, alice } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, ethers.parseEther("100"));
      await v.connect(owner).mint(alice.address, ethers.parseEther("80"));
      await v.connect(owner).mint(alice.address, ethers.parseEther("20"));
      expect(await v.balanceOf(alice.address)).to.equal(TWO_HUNDRED);
    });

    it("rejects a top-up that pushes the epoch total above 200", async () => {
      const { v, owner, alice } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, ethers.parseEther("150"));
      await expect(
        v.connect(owner).mint(alice.address, ethers.parseEther("51"))
      ).to.be.revertedWith("VToken: exceeds monthly savings limit");
    });

    it("cap is per-citizen, not global — Alice and Bob can each save 200", async () => {
      const { v, owner, alice, bob } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, TWO_HUNDRED);
      await v.connect(owner).mint(bob.address,   TWO_HUNDRED);
      expect(await v.balanceOf(alice.address)).to.equal(TWO_HUNDRED);
      expect(await v.balanceOf(bob.address)).to.equal(TWO_HUNDRED);
    });

    it("cap resets at epoch advance — Alice can save another 200 next month", async () => {
      const { v, owner, alice } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, TWO_HUNDRED);
      await v.connect(owner).advanceEpoch();
      await v.connect(owner).mint(alice.address, TWO_HUNDRED);
      expect(await v.balanceOf(alice.address)).to.equal(ethers.parseEther("400"));
      expect(await v.savedThisEpoch(alice.address, 1)).to.equal(TWO_HUNDRED);
      expect(await v.savedThisEpoch(alice.address, 2)).to.equal(TWO_HUNDRED);
    });
  });

  describe("company mint — no cap", () => {
    it("only owner can mintCompany", async () => {
      const { v, alice, company } = await loadFixture(deploy);
      await expect(
        v.connect(alice).mintCompany(company.address, ethers.parseEther("10000"))
      ).to.be.revertedWithCustomError(v, "OwnableUnauthorizedAccount");
    });

    it("allows arbitrary amount above 200 in a single mint", async () => {
      const { v, owner, company } = await loadFixture(deploy);
      const big = ethers.parseEther("50000");
      await v.connect(owner).mintCompany(company.address, big);
      expect(await v.balanceOf(company.address)).to.equal(big);
    });

    it("does NOT touch savedThisEpoch tracking (companies are not citizens)", async () => {
      const { v, owner, company } = await loadFixture(deploy);
      await v.connect(owner).mintCompany(company.address, ethers.parseEther("10000"));
      expect(await v.savedThisEpoch(company.address, 1)).to.equal(0n);
    });
  });

  describe("burn", () => {
    it("only owner can burn", async () => {
      const { v, owner, alice } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, ethers.parseEther("100"));
      await expect(
        v.connect(alice).burn(alice.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(v, "OwnableUnauthorizedAccount");
    });

    it("reduces balance on burn", async () => {
      const { v, owner, alice } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, ethers.parseEther("100"));
      await v.connect(owner).burn(alice.address, ethers.parseEther("40"));
      expect(await v.balanceOf(alice.address)).to.equal(ethers.parseEther("60"));
    });

    it("burning V does NOT free up monthly savings allowance", async () => {
      const { v, owner, alice } = await loadFixture(deploy);
      // Save 200 (cap reached), then redeem (burn) 100 — still cannot mint more this epoch
      await v.connect(owner).mint(alice.address, TWO_HUNDRED);
      await v.connect(owner).burn(alice.address, ethers.parseEther("100"));
      await expect(
        v.connect(owner).mint(alice.address, ethers.parseEther("1"))
      ).to.be.revertedWith("VToken: exceeds monthly savings limit");
    });
  });

  describe("non-transferable", () => {
    it("transfer() reverts", async () => {
      const { v, owner, alice, bob } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, ethers.parseEther("100"));
      await expect(
        v.connect(alice).transfer(bob.address, ethers.parseEther("50"))
      ).to.be.revertedWith("VToken: non-transferable");
    });

    it("transferFrom() reverts", async () => {
      const { v, owner, alice, bob } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, ethers.parseEther("100"));
      await v.connect(alice).approve(bob.address, ethers.parseEther("50"));
      await expect(
        v.connect(bob).transferFrom(alice.address, bob.address, ethers.parseEther("50"))
      ).to.be.revertedWith("VToken: non-transferable");
    });

    it("colonyTransfer() works (Colony-mediated dividends, inheritance)", async () => {
      const { v, owner, alice, bob } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, ethers.parseEther("100"));
      await v.connect(owner).colonyTransfer(alice.address, bob.address, ethers.parseEther("40"));
      expect(await v.balanceOf(alice.address)).to.equal(ethers.parseEther("60"));
      expect(await v.balanceOf(bob.address)).to.equal(ethers.parseEther("40"));
    });

    it("colonyTransfer() is owner-gated", async () => {
      const { v, owner, alice, bob } = await loadFixture(deploy);
      await v.connect(owner).mint(alice.address, ethers.parseEther("100"));
      await expect(
        v.connect(alice).colonyTransfer(alice.address, bob.address, ethers.parseEther("40"))
      ).to.be.revertedWithCustomError(v, "OwnableUnauthorizedAccount");
    });
  });

  describe("advanceEpoch", () => {
    it("only owner can advance", async () => {
      const { v, alice } = await loadFixture(deploy);
      await expect(
        v.connect(alice).advanceEpoch()
      ).to.be.revertedWithCustomError(v, "OwnableUnauthorizedAccount");
    });

    it("increments currentEpoch by 1", async () => {
      const { v, owner } = await loadFixture(deploy);
      expect(await v.currentEpoch()).to.equal(1n);
      await v.connect(owner).advanceEpoch();
      expect(await v.currentEpoch()).to.equal(2n);
      await v.connect(owner).advanceEpoch();
      expect(await v.currentEpoch()).to.equal(3n);
    });
  });
});
