/**
 * OToken — organisation identity token. Role-bound (not soulbound). Held by a
 * company secretary or MCC chair; transferred only via handOver(), and only to
 * a registered citizen of the colony. Standard ERC-721 transfers blocked.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ORG_TYPE = { Company: 0, MCC: 1, Cooperative: 2, Civic: 3 };

describe("OToken", () => {
  async function deploy() {
    const [owner, alice, bob, carol, stranger] = await ethers.getSigners();

    const Mock = await ethers.getContractFactory("MockColonyCitizenship");
    const mock = await Mock.deploy();

    const OToken = await ethers.getContractFactory("OToken");
    const o = await OToken.deploy("Fairbrook", await mock.getAddress());

    // Default: alice, bob, carol are citizens; stranger is not
    await mock.setCitizen(alice.address,   true);
    await mock.setCitizen(bob.address,     true);
    await mock.setCitizen(carol.address,   true);
    await mock.setCitizen(stranger.address, false);

    return { o, mock, owner, alice, bob, carol, stranger };
  }

  describe("deployment", () => {
    it("name = '<colony> Org', symbol = 'OTOKEN'", async () => {
      const { o } = await loadFixture(deploy);
      expect(await o.name()).to.equal("Fairbrook Org");
      expect(await o.symbol()).to.equal("OTOKEN");
    });

    it("colony address is set from constructor", async () => {
      const { o, mock } = await loadFixture(deploy);
      expect(await o.colony()).to.equal(await mock.getAddress());
    });

    it("nextTokenId starts at 1", async () => {
      const { o } = await loadFixture(deploy);
      expect(await o.nextTokenId()).to.equal(1n);
    });
  });

  describe("mint", () => {
    it("only owner can mint", async () => {
      const { o, alice } = await loadFixture(deploy);
      await expect(
        o.connect(alice).mint(alice.address, "Acme", ORG_TYPE.Company)
      ).to.be.revertedWithCustomError(o, "OwnableUnauthorizedAccount");
    });

    it("mints token 1 first, increments thereafter", async () => {
      const { o, owner, alice, bob } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme",  ORG_TYPE.Company);
      await o.connect(owner).mint(bob.address,   "Civic", ORG_TYPE.Civic);
      expect(await o.ownerOf(1)).to.equal(alice.address);
      expect(await o.ownerOf(2)).to.equal(bob.address);
      expect(await o.nextTokenId()).to.equal(3n);
    });

    it("stores org info on mint", async () => {
      const { o, owner, alice } = await loadFixture(deploy);
      const tx = await o.connect(owner).mint(alice.address, "Acme Bakery", ORG_TYPE.Company);
      const receipt = await tx.wait();
      const blockTime = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      const org = await o.orgs(1);
      expect(org.name).to.equal("Acme Bakery");
      expect(org.orgType).to.equal(ORG_TYPE.Company);
      expect(org.registeredAt).to.equal(blockTime);
    });

    it("emits OrgRegistered with all fields", async () => {
      const { o, owner, alice } = await loadFixture(deploy);
      await expect(o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company))
        .to.emit(o, "OrgRegistered")
        .withArgs(1, alice.address, ORG_TYPE.Company, "Acme");
    });
  });

  describe("standard ERC-721 transfers are blocked", () => {
    it("transferFrom reverts with 'use handOver()'", async () => {
      const { o, owner, alice, bob } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company);
      await expect(
        o.connect(alice).transferFrom(alice.address, bob.address, 1)
      ).to.be.revertedWith("OToken: use handOver()");
    });

    it("safeTransferFrom reverts with 'use handOver()'", async () => {
      const { o, owner, alice, bob } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company);
      await expect(
        o.connect(alice)["safeTransferFrom(address,address,uint256)"](
          alice.address, bob.address, 1
        )
      ).to.be.revertedWith("OToken: use handOver()");
    });
  });

  describe("handOver", () => {
    it("only the current holder can hand over", async () => {
      const { o, owner, alice, bob, carol } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company);
      await expect(
        o.connect(bob).handOver(1, carol.address)
      ).to.be.revertedWith("OToken: not the current holder");
    });

    it("rejects handover to a non-citizen", async () => {
      const { o, owner, alice, stranger } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company);
      await expect(
        o.connect(alice).handOver(1, stranger.address)
      ).to.be.revertedWith("OToken: recipient is not a citizen");
    });

    it("transfers ownership when both checks pass", async () => {
      const { o, owner, alice, bob } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company);
      await o.connect(alice).handOver(1, bob.address);
      expect(await o.ownerOf(1)).to.equal(bob.address);
    });

    it("emits RoleHandedOver(tokenId, from, to)", async () => {
      const { o, owner, alice, bob } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company);
      await expect(o.connect(alice).handOver(1, bob.address))
        .to.emit(o, "RoleHandedOver")
        .withArgs(1, alice.address, bob.address);
    });

    it("after handover, the new holder can hand over again", async () => {
      const { o, owner, alice, bob, carol } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company);
      await o.connect(alice).handOver(1, bob.address);
      await o.connect(bob).handOver(1, carol.address);
      expect(await o.ownerOf(1)).to.equal(carol.address);
    });

    it("after handover, the previous holder cannot hand over again", async () => {
      const { o, owner, alice, bob, carol } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme", ORG_TYPE.Company);
      await o.connect(alice).handOver(1, bob.address);
      await expect(
        o.connect(alice).handOver(1, carol.address)
      ).to.be.revertedWith("OToken: not the current holder");
    });
  });

  describe("tokensOf — multi-org holder", () => {
    it("returns empty array for a holder with no O-tokens", async () => {
      const { o, alice } = await loadFixture(deploy);
      expect(await o.tokensOf(alice.address)).to.deep.equal([]);
    });

    it("returns all O-tokens held by an address", async () => {
      const { o, owner, alice } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "First",  ORG_TYPE.Company);
      await o.connect(owner).mint(alice.address, "Second", ORG_TYPE.Cooperative);
      await o.connect(owner).mint(alice.address, "Third",  ORG_TYPE.Civic);
      const tokens = await o.tokensOf(alice.address);
      expect(tokens.map(Number)).to.deep.equal([1, 2, 3]);
    });

    it("excludes tokens that have been handed away", async () => {
      const { o, owner, alice, bob } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "First",  ORG_TYPE.Company);
      await o.connect(owner).mint(alice.address, "Second", ORG_TYPE.Cooperative);
      await o.connect(alice).handOver(1, bob.address);
      const aliceTokens = await o.tokensOf(alice.address);
      const bobTokens   = await o.tokensOf(bob.address);
      expect(aliceTokens.map(Number)).to.deep.equal([2]);
      expect(bobTokens.map(Number)).to.deep.equal([1]);
    });
  });

  describe("tokenURI metadata", () => {
    it("reverts for a non-existent token", async () => {
      const { o } = await loadFixture(deploy);
      await expect(o.tokenURI(999)).to.be.revertedWith("OToken: nonexistent token");
    });

    it("returns a base64 data URI with org name and type", async () => {
      const { o, owner, alice } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Acme Bakery", ORG_TYPE.Company);
      const uri = await o.tokenURI(1);
      const json = JSON.parse(
        Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString("utf8")
      );
      expect(json.name).to.equal("O-Token #1");
      expect(json.description).to.contain("Acme Bakery");
      expect(json.description).to.contain("COMPANY");
    });

    it("uses MCC label for OrgType.MCC", async () => {
      const { o, owner, alice } = await loadFixture(deploy);
      await o.connect(owner).mint(alice.address, "Town MCC", ORG_TYPE.MCC);
      const uri = await o.tokenURI(1);
      const json = JSON.parse(
        Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString("utf8")
      );
      expect(json.description).to.contain("MCC");
    });
  });
});
