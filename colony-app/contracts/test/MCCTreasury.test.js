/**
 * MCCTreasury — colony's S-token wallet, separate from the founder's EOA.
 * Roles: FD (Financial Director), Chair (full), founder (implicit Chair).
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const E = (n) => ethers.parseEther(String(n));

describe("MCCTreasury", () => {
  async function deploy() {
    const [founder, fd, chair, alice, attacker] = await ethers.getSigners();

    // Real SToken so MCCTreasury can call balanceOf + transfer through it
    const SToken = await ethers.getContractFactory("SToken");
    const s = await SToken.deploy("FBR");

    const MockColony = await ethers.getContractFactory("MockColonyForMcc");
    const mock = await MockColony.deploy(founder.address, await s.getAddress());

    const Treasury = await ethers.getContractFactory("MCCTreasury");
    const t = await Treasury.deploy(await mock.getAddress());

    // Fund the treasury with some S so withdrawals are testable
    await s.issueUbiRaw(await t.getAddress(), E(10000));

    return { t, s, mock, founder, fd, chair, alice, attacker };
  }

  describe("constructor + state", () => {
    it("ROLE constants are NONE=0, FD=1, CHAIR=2", async () => {
      const { t } = await loadFixture(deploy);
      expect(await t.ROLE_NONE()).to.equal(0n);
      expect(await t.ROLE_FD()).to.equal(1n);
      expect(await t.ROLE_CHAIR()).to.equal(2n);
    });

    it("colony and sToken are pulled in from the colony reference", async () => {
      const { t, mock, s } = await loadFixture(deploy);
      expect(await t.colony()).to.equal(await mock.getAddress());
      expect(await t.sToken()).to.equal(await s.getAddress());
    });

    it("balance() reads the treasury's S-token balance", async () => {
      const { t } = await loadFixture(deploy);
      expect(await t.balance()).to.equal(E(10000));
    });
  });

  describe("setRole", () => {
    it("rejects calls from non-Chair / non-founder", async () => {
      const { t, attacker, alice } = await loadFixture(deploy);
      await expect(t.connect(attacker).setRole(alice.address, 1))
        .to.be.revertedWith("MCCTreasury: not Chair");
    });

    it("founder can grant FD role", async () => {
      const { t, founder, fd } = await loadFixture(deploy);
      await t.connect(founder).setRole(fd.address, 1);
      expect(await t.roleOf(fd.address)).to.equal(1n);
      expect(await t.isFD(fd.address)).to.equal(true);
    });

    it("founder can grant Chair role; that Chair can then grant other roles", async () => {
      const { t, founder, chair, alice } = await loadFixture(deploy);
      await t.connect(founder).setRole(chair.address, 2);
      await t.connect(chair).setRole(alice.address, 1);
      expect(await t.roleOf(alice.address)).to.equal(1n);
    });

    it("rejects invalid role values (>2)", async () => {
      const { t, founder, alice } = await loadFixture(deploy);
      await expect(t.connect(founder).setRole(alice.address, 5))
        .to.be.revertedWith("MCCTreasury: invalid role");
    });

    it("emits RoleSet on grant + revoke", async () => {
      const { t, founder, fd } = await loadFixture(deploy);
      await expect(t.connect(founder).setRole(fd.address, 1))
        .to.emit(t, "RoleSet").withArgs(fd.address, 1);
      await expect(t.connect(founder).setRole(fd.address, 0))
        .to.emit(t, "RoleSet").withArgs(fd.address, 0);
      expect(await t.roleOf(fd.address)).to.equal(0n);
    });
  });

  describe("withdraw", () => {
    it("rejects callers without FD or above", async () => {
      const { t, attacker, alice } = await loadFixture(deploy);
      await expect(t.connect(attacker).withdraw(alice.address, E(10), "test"))
        .to.be.revertedWith("MCCTreasury: not FD");
    });

    it("founder can withdraw without an explicit role", async () => {
      const { t, s, founder, alice } = await loadFixture(deploy);
      await t.connect(founder).withdraw(alice.address, E(100), "salary");
      expect(await s.balanceOf(alice.address)).to.equal(E(100));
      expect(await t.balance()).to.equal(E(9900));
    });

    it("FD can withdraw", async () => {
      const { t, s, founder, fd, alice } = await loadFixture(deploy);
      await t.connect(founder).setRole(fd.address, 1);
      await t.connect(fd).withdraw(alice.address, E(50), "stipend");
      expect(await s.balanceOf(alice.address)).to.equal(E(50));
    });

    it("emits Withdrawal(to, amount, reason)", async () => {
      const { t, founder, alice } = await loadFixture(deploy);
      await expect(t.connect(founder).withdraw(alice.address, E(25), "expense"))
        .to.emit(t, "Withdrawal").withArgs(alice.address, E(25), "expense");
    });
  });

  describe("isFD + roleName views", () => {
    it("isFD true for founder regardless of explicit role", async () => {
      const { t, founder } = await loadFixture(deploy);
      expect(await t.isFD(founder.address)).to.equal(true);
    });

    it("roleName returns 'Founder' for founder with no explicit role", async () => {
      const { t, founder } = await loadFixture(deploy);
      expect(await t.roleName(founder.address)).to.equal("Founder");
    });

    it("roleName returns 'Chair' / 'FD' / 'None'", async () => {
      const { t, founder, chair, fd, alice } = await loadFixture(deploy);
      await t.connect(founder).setRole(chair.address, 2);
      await t.connect(founder).setRole(fd.address, 1);
      expect(await t.roleName(chair.address)).to.equal("Chair");
      expect(await t.roleName(fd.address)).to.equal("FD");
      expect(await t.roleName(alice.address)).to.equal("None");
    });

    it("members returns all addresses ever granted a role", async () => {
      const { t, founder, fd, chair } = await loadFixture(deploy);
      await t.connect(founder).setRole(fd.address, 1);
      await t.connect(founder).setRole(chair.address, 2);
      expect(await t.members()).to.deep.equal([fd.address, chair.address]);
    });
  });
});
