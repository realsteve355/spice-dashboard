/**
 * SToken — colony spending token. Issued monthly as UBI (1,000 S/citizen).
 * Citizens may transfer freely; Colony has owner-gated mint/burn/colonyTransfer
 * and an epoch counter that gates UBI idempotency.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const UBI = ethers.parseEther("1000");

describe("SToken", () => {
  async function deploy() {
    const [owner, alice, bob] = await ethers.getSigners();
    const SToken = await ethers.getContractFactory("SToken");
    const s = await SToken.deploy("FBR");
    return { s, owner, alice, bob };
  }

  describe("deployment", () => {
    it("name = '<ticker> S-Token', symbol = 'S-<ticker>'", async () => {
      const { s } = await loadFixture(deploy);
      expect(await s.name()).to.equal("FBR S-Token");
      expect(await s.symbol()).to.equal("S-FBR");
    });

    it("UBI_AMOUNT constant is 1000 × 1e18", async () => {
      const { s } = await loadFixture(deploy);
      expect(await s.UBI_AMOUNT()).to.equal(UBI);
    });

    it("currentEpoch starts at 1", async () => {
      const { s } = await loadFixture(deploy);
      expect(await s.currentEpoch()).to.equal(1n);
    });
  });

  describe("issueUbi", () => {
    it("only owner can issue UBI", async () => {
      const { s, alice } = await loadFixture(deploy);
      await expect(
        s.connect(alice).issueUbi(alice.address)
      ).to.be.revertedWithCustomError(s, "OwnableUnauthorizedAccount");
    });

    it("mints 1000 S to a citizen on first issue", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      expect(await s.balanceOf(alice.address)).to.equal(UBI);
    });

    it("records the epoch in lastUbiEpoch", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      expect(await s.lastUbiEpoch(alice.address)).to.equal(1n);
    });

    it("rejects double-claim within the same epoch (idempotent)", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await expect(
        s.connect(owner).issueUbi(alice.address)
      ).to.be.revertedWith("SToken: UBI already issued this month");
    });

    it("allows a re-claim after epoch advance", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await s.connect(owner).advanceEpoch();
      await s.connect(owner).issueUbi(alice.address);
      expect(await s.balanceOf(alice.address)).to.equal(ethers.parseEther("2000"));
      expect(await s.lastUbiEpoch(alice.address)).to.equal(2n);
    });
  });

  describe("issueUbiRaw — V→S redemption path", () => {
    it("only owner can call", async () => {
      const { s, alice } = await loadFixture(deploy);
      await expect(
        s.connect(alice).issueUbiRaw(alice.address, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(s, "OwnableUnauthorizedAccount");
    });

    it("bypasses the epoch idempotency check (used for V→S top-up)", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      // Same epoch: standard issueUbi would revert, but issueUbiRaw is fine
      await s.connect(owner).issueUbiRaw(alice.address, ethers.parseEther("250"));
      expect(await s.balanceOf(alice.address)).to.equal(ethers.parseEther("1250"));
    });

    it("does NOT update lastUbiEpoch", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbiRaw(alice.address, ethers.parseEther("100"));
      expect(await s.lastUbiEpoch(alice.address)).to.equal(0n);
    });
  });

  describe("burn", () => {
    it("only owner can burn", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await expect(
        s.connect(alice).burn(alice.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(s, "OwnableUnauthorizedAccount");
    });

    it("reduces balance on burn", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await s.connect(owner).burn(alice.address, ethers.parseEther("250"));
      expect(await s.balanceOf(alice.address)).to.equal(ethers.parseEther("750"));
    });

    it("reverts on burn-more-than-balance", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await expect(
        s.connect(owner).burn(alice.address, ethers.parseEther("2000"))
      ).to.be.reverted;  // OZ ERC20InsufficientBalance custom error
    });
  });

  describe("colonyTransfer", () => {
    it("only owner can call", async () => {
      const { s, owner, alice, bob } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await expect(
        s.connect(alice).colonyTransfer(alice.address, bob.address, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(s, "OwnableUnauthorizedAccount");
    });

    it("moves tokens between addresses without requiring approval", async () => {
      const { s, owner, alice, bob } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await s.connect(owner).colonyTransfer(alice.address, bob.address, ethers.parseEther("75"));
      expect(await s.balanceOf(alice.address)).to.equal(ethers.parseEther("925"));
      expect(await s.balanceOf(bob.address)).to.equal(ethers.parseEther("75"));
    });
  });

  describe("advanceEpoch", () => {
    it("only owner can advance", async () => {
      const { s, alice } = await loadFixture(deploy);
      await expect(
        s.connect(alice).advanceEpoch()
      ).to.be.revertedWithCustomError(s, "OwnableUnauthorizedAccount");
    });

    it("increments by 1", async () => {
      const { s, owner } = await loadFixture(deploy);
      await s.connect(owner).advanceEpoch();
      await s.connect(owner).advanceEpoch();
      await s.connect(owner).advanceEpoch();
      expect(await s.currentEpoch()).to.equal(4n);
    });

    it("does NOT burn existing balances (carry-over by design — see SToken.sol:40)", async () => {
      const { s, owner, alice } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await s.connect(owner).advanceEpoch();
      // Balance still 1000 — confirmed deviation from spec §1.1; production
      // burn-and-reissue not yet implemented.
      expect(await s.balanceOf(alice.address)).to.equal(UBI);
    });
  });

  describe("standard ERC-20 transfer (citizen-to-citizen)", () => {
    it("a citizen can transfer S directly without going through Colony", async () => {
      const { s, owner, alice, bob } = await loadFixture(deploy);
      await s.connect(owner).issueUbi(alice.address);
      await s.connect(alice).transfer(bob.address, ethers.parseEther("30"));
      expect(await s.balanceOf(alice.address)).to.equal(ethers.parseEther("970"));
      expect(await s.balanceOf(bob.address)).to.equal(ethers.parseEther("30"));
    });
  });
});
