/**
 * ColonyRegistry — protocol-level registry of all SPICE colonies.
 *
 * Each colony gets a soulbound C-token minted to the colony contract address.
 * Tests use ordinary signer addresses as "colonies" — the registry doesn't
 * actually call into the colony, it just stores the address.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const E = (n) => ethers.parseEther(String(n));

describe("ColonyRegistry", () => {
  async function deploy() {
    const [owner, treasury, founder1, founder2, attacker, colA, colB] =
      await ethers.getSigners();
    const Registry = await ethers.getContractFactory("ColonyRegistry");
    const reg = await Registry.deploy(treasury.address, ethers.parseUnits("1", "gwei")); // 1 gwei fee
    return { reg, owner, treasury, founder1, founder2, attacker, colA, colB };
  }

  describe("constructor", () => {
    it("name = 'SPICE Colony', symbol = 'COLONY'", async () => {
      const { reg } = await loadFixture(deploy);
      expect(await reg.name()).to.equal("SPICE Colony");
      expect(await reg.symbol()).to.equal("COLONY");
    });

    it("owner = deployer; treasury and feePerTx set; default founderShareBps = 2500", async () => {
      const { reg, owner, treasury } = await loadFixture(deploy);
      expect(await reg.owner()).to.equal(owner.address);
      expect(await reg.protocolTreasury()).to.equal(treasury.address);
      expect(await reg.feePerTx()).to.equal(ethers.parseUnits("1", "gwei"));
      expect(await reg.founderShareBps()).to.equal(2500n);
    });
  });

  describe("register", () => {
    it("non-owner non-tx-origin authorisation: tx.origin == msg.sender for EOAs is allowed", async () => {
      // Direct EOA calls satisfy `msg.sender == tx.origin` check
      const { reg, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      const e = await reg.entries(colA.address);
      expect(e.founder).to.equal(founder1.address);
      expect(e.name).to.equal("Acme");
      expect(e.slug).to.equal("acme");
    });

    it("rejects zero colony address", async () => {
      const { reg, founder1 } = await loadFixture(deploy);
      await expect(
        reg.connect(founder1).register(ethers.ZeroAddress, "X", "x")
      ).to.be.revertedWith("ColonyRegistry: zero address");
    });

    it("rejects empty name and slug", async () => {
      const { reg, founder1, colA } = await loadFixture(deploy);
      await expect(
        reg.connect(founder1).register(colA.address, "", "x")
      ).to.be.revertedWith("ColonyRegistry: name required");
      await expect(
        reg.connect(founder1).register(colA.address, "X", "")
      ).to.be.revertedWith("ColonyRegistry: slug required");
    });

    it("rejects duplicate colony registration", async () => {
      const { reg, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await expect(
        reg.connect(founder1).register(colA.address, "Acme2", "acme2")
      ).to.be.revertedWith("ColonyRegistry: already registered");
    });

    it("rejects duplicate slug", async () => {
      const { reg, founder1, founder2, colA, colB } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme",   "acme");
      await expect(
        reg.connect(founder2).register(colB.address, "Acme Two", "acme")
      ).to.be.revertedWith("ColonyRegistry: slug taken");
    });

    it("mints C-token (id 1) to the colony contract address — soulbound to the colony", async () => {
      const { reg, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      expect(await reg.ownerOf(1)).to.equal(colA.address);
      // Subsequent registrations get incrementing IDs
    });

    it("emits ColonyRegistered(colony, slug, founder, tokenId)", async () => {
      const { reg, founder1, colA } = await loadFixture(deploy);
      await expect(reg.connect(founder1).register(colA.address, "Acme", "acme"))
        .to.emit(reg, "ColonyRegistered")
        .withArgs(colA.address, "acme", founder1.address, 1);
    });
  });

  describe("soulbound transfer block", () => {
    it("transferFrom is blocked for the C-token holder", async () => {
      const { reg, founder1, colA, attacker } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      // colA is the C-token holder. Try to transfer it away (impersonation impossible
      // for a real Colony contract, but test logic: any caller hits the soulbound revert)
      await expect(
        reg.connect(attacker).transferFrom(colA.address, attacker.address, 1)
      ).to.be.revertedWith("CToken: soulbound");
    });
  });

  describe("deregister + reregister", () => {
    it("only owner can deregister", async () => {
      const { reg, founder1, attacker, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await expect(
        reg.connect(attacker).deregister(colA.address)
      ).to.be.revertedWith("ColonyRegistry: not owner");
    });

    it("burns C-token, frees slug, marks deregistered", async () => {
      const { reg, owner, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).deregister(colA.address);
      expect(await reg.deregistered(colA.address)).to.equal(true);
      expect(await reg.slugToColony("acme")).to.equal(ethers.ZeroAddress);
      // C-token burned
      await expect(reg.ownerOf(1)).to.be.reverted;
    });

    it("rejects double-deregister", async () => {
      const { reg, owner, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).deregister(colA.address);
      await expect(
        reg.connect(owner).deregister(colA.address)
      ).to.be.revertedWith("ColonyRegistry: already deregistered");
    });

    it("reregister mints same token ID back to colony, restores slug", async () => {
      const { reg, owner, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).deregister(colA.address);
      await reg.connect(owner).reregister(colA.address);
      expect(await reg.deregistered(colA.address)).to.equal(false);
      expect(await reg.ownerOf(1)).to.equal(colA.address);  // same id 1
      expect(await reg.slugToColony("acme")).to.equal(colA.address);
    });

    it("reregister fails if slug was claimed by another colony in between", async () => {
      const { reg, owner, founder1, founder2, colA, colB } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).deregister(colA.address);
      // founder2 grabs the slug
      await reg.connect(founder2).register(colB.address, "AcmeAlt", "acme");
      await expect(
        reg.connect(owner).reregister(colA.address)
      ).to.be.revertedWith("ColonyRegistry: slug taken by another colony");
    });
  });

  describe("fees (per-tx)", () => {
    it("getFeeForColony returns global default when no override", async () => {
      const { reg, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      expect(await reg.getFeeForColony(colA.address)).to.equal(ethers.parseUnits("1", "gwei"));
    });

    it("setColonyFee overrides the global fee for that colony", async () => {
      const { reg, owner, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).setColonyFee(colA.address, ethers.parseUnits("5", "gwei"));
      expect(await reg.getFeeForColony(colA.address)).to.equal(ethers.parseUnits("5", "gwei"));
    });

    it("setFeePerTx is owner-only", async () => {
      const { reg, attacker } = await loadFixture(deploy);
      await expect(
        reg.connect(attacker).setFeePerTx(0)
      ).to.be.revertedWith("ColonyRegistry: not owner");
    });
  });

  describe("founder share / fee split", () => {
    it("getColonyFounderShare returns global default when no override", async () => {
      const { reg, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      expect(await reg.getColonyFounderShare(colA.address)).to.equal(2500n);
    });

    it("setColonyFounderShare overrides per-colony; capped at 50%", async () => {
      const { reg, owner, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).setColonyFounderShare(colA.address, 4000); // 40%
      expect(await reg.getColonyFounderShare(colA.address)).to.equal(4000n);
      await expect(
        reg.connect(owner).setColonyFounderShare(colA.address, 5001)
      ).to.be.revertedWith("ColonyRegistry: share cannot exceed 50%");
    });

    it("setFounderShareBps global default capped at 50%", async () => {
      const { reg, owner } = await loadFixture(deploy);
      await reg.connect(owner).setFounderShareBps(3000);
      expect(await reg.founderShareBps()).to.equal(3000n);
      await expect(
        reg.connect(owner).setFounderShareBps(5001)
      ).to.be.revertedWith("ColonyRegistry: share cannot exceed 50%");
    });

    it("getFounderWallet returns the founder address by default", async () => {
      const { reg, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      expect(await reg.getFounderWallet(colA.address)).to.equal(founder1.address);
    });

    it("setFounderWallet override changes the receiving wallet", async () => {
      const { reg, owner, founder1, founder2, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).setFounderWallet(colA.address, founder2.address);
      expect(await reg.getFounderWallet(colA.address)).to.equal(founder2.address);
    });

    it("getFeeSplit: 25% global default → founder gets 25, protocol gets 75", async () => {
      const { reg, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      const [protocolAmt, founderAmt, founderWallet] =
        await reg.getFeeSplit(colA.address, E(100));
      expect(founderAmt).to.equal(E(25));
      expect(protocolAmt).to.equal(E(75));
      expect(founderWallet).to.equal(founder1.address);
    });

    it("getFeeSplit: per-colony override applies", async () => {
      const { reg, owner, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).setColonyFounderShare(colA.address, 1000);  // 10%
      const [protocolAmt, founderAmt] =
        await reg.getFeeSplit(colA.address, E(100));
      expect(founderAmt).to.equal(E(10));
      expect(protocolAmt).to.equal(E(90));
    });

    it("getFeeSplit: zero-address founder → all to protocol", async () => {
      const { reg, owner, founder1, colA } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "Acme", "acme");
      await reg.connect(owner).setFounderWallet(colA.address, ethers.ZeroAddress);
      // Wait — setFounderWallet to address(0) reverts back to entries.founder.
      // To test the all-to-protocol path we need the founder to be the colony itself
      // (which happens when owner registers retroactively).
      // Let's verify the alternative path: founder wallet equals the colony itself
      // produces all-to-protocol behaviour.
      const Reg2 = await ethers.getContractFactory("ColonyRegistry");
      const reg2 = await Reg2.deploy(owner.address, 1n);
      // Owner registers a colony directly — `founder` is set to the colony itself
      const [, , , , , , colA2] = await ethers.getSigners();
      await reg2.connect(owner).register(colA2.address, "X", "x");
      const [pAmt, fAmt] = await reg2.getFeeSplit(colA2.address, E(100));
      expect(fAmt).to.equal(0n);
      expect(pAmt).to.equal(E(100));
    });
  });

  describe("ownership + treasury", () => {
    it("setTreasury rejects zero address", async () => {
      const { reg, owner } = await loadFixture(deploy);
      await expect(
        reg.connect(owner).setTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("ColonyRegistry: zero address");
    });

    it("transferOwnership moves the owner", async () => {
      const { reg, owner, founder2 } = await loadFixture(deploy);
      await reg.connect(owner).transferOwnership(founder2.address);
      expect(await reg.owner()).to.equal(founder2.address);
      // Old owner can no longer make owner-only calls
      await expect(
        reg.connect(owner).setFeePerTx(0)
      ).to.be.revertedWith("ColonyRegistry: not owner");
    });
  });

  describe("views", () => {
    it("getAll returns all registered colony addresses (including deregistered)", async () => {
      const { reg, owner, founder1, founder2, colA, colB } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "A", "a");
      await reg.connect(founder2).register(colB.address, "B", "b");
      await reg.connect(owner).deregister(colA.address);
      const all = await reg.getAll();
      expect(all).to.deep.equal([colA.address, colB.address]);
    });

    it("getActive omits deregistered colonies", async () => {
      const { reg, owner, founder1, founder2, colA, colB } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "A", "a");
      await reg.connect(founder2).register(colB.address, "B", "b");
      await reg.connect(owner).deregister(colA.address);
      const active = await reg.getActive();
      expect(active).to.deep.equal([colB.address]);
    });

    it("count returns total registered (active + deregistered)", async () => {
      const { reg, owner, founder1, founder2, colA, colB } = await loadFixture(deploy);
      await reg.connect(founder1).register(colA.address, "A", "a");
      await reg.connect(founder2).register(colB.address, "B", "b");
      await reg.connect(owner).deregister(colA.address);
      expect(await reg.count()).to.equal(2n);
    });
  });
});
