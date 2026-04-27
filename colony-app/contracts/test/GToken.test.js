/**
 * GToken — soulbound ERC-721 governance token. One per citizen, minted by the
 * Colony contract (the GToken owner). Cannot be transferred.
 *
 * These tests exercise the contract directly using a test wallet as "owner"
 * (substituting for the Colony contract).
 */

const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("GToken", () => {
  async function deploy() {
    const [owner, alice, bob, carol] = await ethers.getSigners();
    const GToken = await ethers.getContractFactory("GToken");
    const gtoken = await GToken.deploy("Fairbrook", "FBR");
    return { gtoken, owner, alice, bob, carol };
  }

  describe("deployment", () => {
    it("sets name = '<ticker> Governance' and symbol = 'G-<ticker>'", async () => {
      const { gtoken } = await loadFixture(deploy);
      expect(await gtoken.name()).to.equal("FBR Governance");
      expect(await gtoken.symbol()).to.equal("G-FBR");
    });

    it("stores colonyName", async () => {
      const { gtoken } = await loadFixture(deploy);
      expect(await gtoken.colonyName()).to.equal("Fairbrook");
    });

    it("nextTokenId starts at 1", async () => {
      const { gtoken } = await loadFixture(deploy);
      expect(await gtoken.nextTokenId()).to.equal(1n);
    });
  });

  describe("mint", () => {
    it("only owner can mint", async () => {
      const { gtoken, alice, bob } = await loadFixture(deploy);
      await expect(
        gtoken.connect(alice).mint(bob.address, "Bob")
      ).to.be.revertedWithCustomError(gtoken, "OwnableUnauthorizedAccount");
    });

    it("assigns tokenId 1 to the first mint, increments thereafter", async () => {
      const { gtoken, owner, alice, bob } = await loadFixture(deploy);
      await gtoken.connect(owner).mint(alice.address, "Alice");
      await gtoken.connect(owner).mint(bob.address,   "Bob");
      expect(await gtoken.ownerOf(1)).to.equal(alice.address);
      expect(await gtoken.ownerOf(2)).to.equal(bob.address);
      expect(await gtoken.nextTokenId()).to.equal(3n);
    });

    it("stores citizen name and timestamp on mint", async () => {
      const { gtoken, owner, alice } = await loadFixture(deploy);
      const tx = await gtoken.connect(owner).mint(alice.address, "Alice");
      const receipt = await tx.wait();
      const blockTime = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      expect(await gtoken.citizenName(1)).to.equal("Alice");
      expect(await gtoken.issuedAt(1)).to.equal(blockTime);
    });

    it("emits standard ERC-721 Transfer(0, holder, id) on mint", async () => {
      const { gtoken, owner, alice } = await loadFixture(deploy);
      await expect(gtoken.connect(owner).mint(alice.address, "Alice"))
        .to.emit(gtoken, "Transfer")
        .withArgs(ethers.ZeroAddress, alice.address, 1);
    });
  });

  describe("soulbound transfer-block", () => {
    it("transferFrom reverts with the soulbound message", async () => {
      const { gtoken, owner, alice, bob } = await loadFixture(deploy);
      await gtoken.connect(owner).mint(alice.address, "Alice");
      await expect(
        gtoken.connect(alice).transferFrom(alice.address, bob.address, 1)
      ).to.be.revertedWith("GToken: soulbound, non-transferable");
    });

    it("safeTransferFrom reverts with the soulbound message", async () => {
      const { gtoken, owner, alice, bob } = await loadFixture(deploy);
      await gtoken.connect(owner).mint(alice.address, "Alice");
      await expect(
        gtoken.connect(alice)["safeTransferFrom(address,address,uint256)"](
          alice.address, bob.address, 1
        )
      ).to.be.revertedWith("GToken: soulbound, non-transferable");
    });

    it("approve+transferFrom path is also blocked", async () => {
      const { gtoken, owner, alice, bob, carol } = await loadFixture(deploy);
      await gtoken.connect(owner).mint(alice.address, "Alice");
      await gtoken.connect(alice).approve(bob.address, 1);
      await expect(
        gtoken.connect(bob).transferFrom(alice.address, carol.address, 1)
      ).to.be.revertedWith("GToken: soulbound, non-transferable");
    });
  });

  describe("tokenOf lookup", () => {
    it("returns 0 for a non-citizen", async () => {
      const { gtoken, alice } = await loadFixture(deploy);
      expect(await gtoken.tokenOf(alice.address)).to.equal(0n);
    });

    it("returns the tokenId held by a citizen", async () => {
      const { gtoken, owner, alice, bob, carol } = await loadFixture(deploy);
      await gtoken.connect(owner).mint(alice.address, "Alice");
      await gtoken.connect(owner).mint(bob.address,   "Bob");
      await gtoken.connect(owner).mint(carol.address, "Carol");
      expect(await gtoken.tokenOf(alice.address)).to.equal(1n);
      expect(await gtoken.tokenOf(bob.address)).to.equal(2n);
      expect(await gtoken.tokenOf(carol.address)).to.equal(3n);
    });
  });

  describe("tokenURI metadata", () => {
    it("returns a base64 data URI for an existing token", async () => {
      const { gtoken, owner, alice } = await loadFixture(deploy);
      await gtoken.connect(owner).mint(alice.address, "Alice");
      const uri = await gtoken.tokenURI(1);
      expect(uri).to.match(/^data:application\/json;base64,/);
    });

    it("decoded JSON contains the citizen name, colony, and token ID", async () => {
      const { gtoken, owner, alice } = await loadFixture(deploy);
      await gtoken.connect(owner).mint(alice.address, "Alice");
      const uri = await gtoken.tokenURI(1);
      const json = JSON.parse(
        Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString("utf8")
      );
      expect(json.name).to.contain("Alice");
      expect(json.name).to.contain("Fairbrook");
      expect(json.description).to.contain("Soulbound");
      expect(json.attributes.find(a => a.trait_type === "Citizen").value).to.equal("Alice");
      expect(json.attributes.find(a => a.trait_type === "Colony").value).to.equal("Fairbrook");
      expect(json.attributes.find(a => a.trait_type === "Token ID").value).to.equal("1");
      expect(json.image).to.match(/^data:image\/svg\+xml;base64,/);
    });

    it("falls back to 'G-Token #0001' when name is empty", async () => {
      const { gtoken, owner, alice } = await loadFixture(deploy);
      await gtoken.connect(owner).mint(alice.address, "");
      const uri  = await gtoken.tokenURI(1);
      const json = JSON.parse(
        Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString("utf8")
      );
      expect(json.name).to.equal("G-Token #0001");
      expect(json.attributes.find(a => a.trait_type === "Citizen")).to.be.undefined;
    });

    it("zero-pads token ID in the SVG label", async () => {
      const { gtoken, owner } = await loadFixture(deploy);
      const signers = await ethers.getSigners();
      // Mint 12 tokens to walk through padding boundaries
      for (let i = 0; i < 12; i++) {
        await gtoken.connect(owner).mint(signers[i].address, `User${i}`);
      }
      const decode = async id => {
        const uri = await gtoken.tokenURI(id);
        const json = JSON.parse(
          Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString("utf8")
        );
        return Buffer.from(
          json.image.replace("data:image/svg+xml;base64,", ""), "base64"
        ).toString("utf8");
      };
      expect(await decode(1)).to.contain("#0001");
      expect(await decode(9)).to.contain("#0009");
      expect(await decode(10)).to.contain("#0010");
      expect(await decode(12)).to.contain("#0012");
    });

    it("reverts for a non-existent token", async () => {
      const { gtoken } = await loadFixture(deploy);
      await expect(gtoken.tokenURI(999)).to.be.revertedWith("GToken: nonexistent token");
    });
  });
});
