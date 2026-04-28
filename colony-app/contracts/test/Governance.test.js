/**
 * Governance — multi-candidate plurality elections + obligation mutual consent.
 *
 * Tests use MockColonyForGov so we control citizenship, age, and join time.
 * Time travel via hardhat-network-helpers crosses voting / timelock windows.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } =
  require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ROLE = { CEO: 0, CFO: 1, COO: 2 };
const NOMINATION_WINDOW = 15 * 60;
const VOTING_WINDOW     = 30 * 60;
const TIMELOCK          =  5 * 60;
const TERM              = 365 * 24 * 60 * 60;

describe("Governance", () => {
  async function deploy() {
    const [deployer, alice, bob, carol, dave, erika] = await ethers.getSigners();

    const Mock = await ethers.getContractFactory("MockColonyForGov");
    const mock = await Mock.deploy();

    // Make alice/bob/carol/dave/erika all adult citizens born in 1990, joined long ago
    const PEOPLE = [alice, bob, carol, dave, erika];
    for (const p of PEOPLE) {
      await mock.setCitizen(p.address, true);
      await mock.setBirthYear(p.address, 1990);
      await mock.setJoinedAt(p.address, 1);  // long before any test
    }

    const Gov = await ethers.getContractFactory("Governance");
    const gov = await Gov.deploy(
      await mock.getAddress(),
      alice.address,   // initial CEO
      bob.address,     // initial CFO
      carol.address,   // initial COO
    );
    return { gov, mock, deployer, alice, bob, carol, dave, erika };
  }

  describe("constructor", () => {
    it("sets initial CEO/CFO/COO with full term", async () => {
      const { gov, alice, bob, carol } = await loadFixture(deploy);
      const [ceoAddr,   ceoEnd,   ceoActive  ] = await gov.roleHolder(ROLE.CEO);
      const [cfoAddr,   ,         cfoActive  ] = await gov.roleHolder(ROLE.CFO);
      const [cooAddr,   ,         cooActive  ] = await gov.roleHolder(ROLE.COO);
      expect(ceoAddr).to.equal(alice.address);
      expect(cfoAddr).to.equal(bob.address);
      expect(cooAddr).to.equal(carol.address);
      expect(ceoActive && cfoActive && cooActive).to.equal(true);
      const now = await time.latest();
      expect(Number(ceoEnd)).to.be.closeTo(now + TERM, 5);
    });

    it("ceoActive = true after deploy, false once term expires", async () => {
      const { gov } = await loadFixture(deploy);
      expect(await gov.ceoActive()).to.equal(true);
      await time.increase(TERM + 1);
      expect(await gov.ceoActive()).to.equal(false);
    });
  });

  describe("openElection", () => {
    it("only citizens may open", async () => {
      const { gov, mock, deployer } = await loadFixture(deploy);
      // deployer is not a citizen
      await mock.setCitizen(deployer.address, false);
      await expect(
        gov.connect(deployer).openElection(ROLE.CEO)
      ).to.be.revertedWith("Gov: not a citizen");
    });

    it("creates election with NOMINATION + VOTING windows", async () => {
      const { gov, alice } = await loadFixture(deploy);
      const tx = await gov.connect(alice).openElection(ROLE.CEO);
      await tx.wait();
      const e = await gov.elections(1);
      const now = await time.latest();
      expect(e.role).to.equal(ROLE.CEO);
      expect(e.openedBy).to.equal(alice.address);
      expect(Number(e.nominationEndsAt)).to.be.closeTo(now + NOMINATION_WINDOW, 5);
      expect(Number(e.votingEndsAt)).to.be.closeTo(now + NOMINATION_WINDOW + VOTING_WINDOW, 5);
    });

    it("emits ElectionOpened(id, role, openedBy)", async () => {
      const { gov, alice } = await loadFixture(deploy);
      await expect(gov.connect(alice).openElection(ROLE.CEO))
        .to.emit(gov, "ElectionOpened")
        .withArgs(1, ROLE.CEO, alice.address);
    });

    it("rejects opening when an active election already exists for role", async () => {
      const { gov, alice, bob } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await expect(
        gov.connect(bob).openElection(ROLE.CEO)
      ).to.be.revertedWith("Gov: election already active");
    });

    it("auto-finalises a stale election before opening a new one", async () => {
      const { gov, alice, bob } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      // Skip past voting window without finalising
      await time.increase(NOMINATION_WINDOW + VOTING_WINDOW + 1);
      // Open another for same role — should auto-finalise the prior (which has no candidates → cancelled)
      await gov.connect(bob).openElection(ROLE.CEO);
      const stale = await gov.elections(1);
      expect(stale.cancelled).to.equal(true);
      // New election lives under id 2
      const fresh = await gov.elections(2);
      expect(fresh.openedBy).to.equal(bob.address);
    });
  });

  describe("nominateCandidate", () => {
    it("only during nomination window", async () => {
      const { gov, alice, bob } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await time.increase(NOMINATION_WINDOW + 1);
      await expect(
        gov.connect(alice).nominateCandidate(1, bob.address)
      ).to.be.revertedWith("Gov: nomination phase closed");
    });

    it("only citizen-nominators (candidate citizenship is NOT enforced)", async () => {
      const { gov, mock, alice, bob, deployer } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      // deployer is not a citizen → nominator check
      await mock.setCitizen(deployer.address, false);
      await expect(
        gov.connect(deployer).nominateCandidate(1, bob.address)
      ).to.be.revertedWith("Gov: not a citizen");
      // Note: contract does NOT require the *candidate* to be a citizen at nomination time
    });

    it("rejects duplicate candidate", async () => {
      const { gov, alice, bob, carol } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, bob.address);
      await expect(
        gov.connect(carol).nominateCandidate(1, bob.address)
      ).to.be.revertedWith("Gov: already nominated");
    });

    it("rejects zero-address candidate", async () => {
      const { gov, alice } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await expect(
        gov.connect(alice).nominateCandidate(1, ethers.ZeroAddress)
      ).to.be.revertedWith("Gov: zero candidate");
    });

    it("getCandidates lists all nominees", async () => {
      const { gov, alice, bob, carol, dave } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, bob.address);
      await gov.connect(alice).nominateCandidate(1, carol.address);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      const list = await gov.getCandidates(1);
      expect(list).to.deep.equal([bob.address, carol.address, dave.address]);
    });
  });

  describe("vote", () => {
    it("only during voting window (after nominations close)", async () => {
      const { gov, alice, bob } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, bob.address);
      // Still in nomination phase — cannot vote yet
      await expect(
        gov.connect(alice).vote(1, bob.address)
      ).to.be.revertedWith("Gov: nomination still open");
      // Move to voting phase
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, bob.address);
      expect(await gov.getCandidateVotes(1, bob.address)).to.equal(1n);
    });

    it("rejects double-vote from same wallet", async () => {
      const { gov, alice, bob, carol } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, bob.address);
      await gov.connect(alice).nominateCandidate(1, carol.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, bob.address);
      await expect(
        gov.connect(alice).vote(1, carol.address)
      ).to.be.revertedWith("Gov: already voted");
    });

    it("rejects vote for a non-candidate", async () => {
      const { gov, alice, bob, carol } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, bob.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await expect(
        gov.connect(alice).vote(1, carol.address)
      ).to.be.revertedWith("Gov: not a candidate");
    });
  });

  describe("finaliseElection", () => {
    async function setupElection(fixt) {
      const { gov, alice } = fixt;
      await gov.connect(alice).openElection(ROLE.CEO);
    }

    it("rejects finalise before voting window closes", async () => {
      const { gov, alice, bob } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, bob.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, bob.address);
      await expect(
        gov.connect(alice).finaliseElection(1)
      ).to.be.revertedWith("Gov: voting still open");
    });

    it("plurality winner wins; sets timelockEndsAt", async () => {
      const fixt = await loadFixture(deploy);
      const { gov, alice, bob, carol, dave, erika } = fixt;
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await gov.connect(alice).nominateCandidate(1, erika.address);
      await time.increase(NOMINATION_WINDOW + 1);
      // 3 votes for dave, 1 for erika
      await gov.connect(alice).vote(1, dave.address);
      await gov.connect(bob).vote(1, dave.address);
      await gov.connect(carol).vote(1, dave.address);
      await gov.connect(erika).vote(1, erika.address);
      await time.increase(VOTING_WINDOW + 1);
      await gov.connect(alice).finaliseElection(1);
      const e = await gov.elections(1);
      expect(e.winner).to.equal(dave.address);
      const now = await time.latest();
      expect(Number(e.timelockEndsAt)).to.be.closeTo(now + TIMELOCK, 5);
    });

    it("tie → election cancelled, ElectionFailed emitted", async () => {
      const { gov, alice, bob, carol, dave, erika } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await gov.connect(alice).nominateCandidate(1, erika.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, dave.address);
      await gov.connect(bob).vote(1, erika.address);
      await time.increase(VOTING_WINDOW + 1);
      await expect(gov.connect(carol).finaliseElection(1))
        .to.emit(gov, "ElectionFailed")
        .withArgs(1, ROLE.CEO, "tie");
      const e = await gov.elections(1);
      expect(e.cancelled).to.equal(true);
    });

    it("no candidates → cancelled with 'no candidates' reason", async () => {
      const { gov, alice } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await time.increase(NOMINATION_WINDOW + VOTING_WINDOW + 1);
      await expect(gov.connect(alice).finaliseElection(1))
        .to.emit(gov, "ElectionFailed")
        .withArgs(1, ROLE.CEO, "no candidates");
    });

    it("candidates present but no votes → cancelled", async () => {
      const { gov, alice, dave } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await time.increase(NOMINATION_WINDOW + VOTING_WINDOW + 1);
      await expect(gov.connect(alice).finaliseElection(1))
        .to.emit(gov, "ElectionFailed")
        .withArgs(1, ROLE.CEO, "no votes cast");
    });
  });

  describe("executeElection", () => {
    it("rejects execute before timelock ends", async () => {
      const { gov, alice, dave } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, dave.address);
      await time.increase(VOTING_WINDOW + 1);
      await gov.connect(alice).finaliseElection(1);
      // timelock NOT yet elapsed
      await expect(
        gov.connect(alice).executeElection(1)
      ).to.be.revertedWith("Gov: timelock active");
    });

    it("installs winner as new role-holder with fresh term after timelock", async () => {
      const { gov, alice, dave } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, dave.address);
      await time.increase(VOTING_WINDOW + 1);
      await gov.connect(alice).finaliseElection(1);
      await time.increase(TIMELOCK + 1);
      await gov.connect(alice).executeElection(1);
      const [holder, termEnd, active] = await gov.roleHolder(ROLE.CEO);
      expect(holder).to.equal(dave.address);
      expect(active).to.equal(true);
      const now = await time.latest();
      expect(Number(termEnd)).to.be.closeTo(now + TERM, 5);
    });

    it("rejects double execution", async () => {
      const { gov, alice, dave } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, dave.address);
      await time.increase(VOTING_WINDOW + 1);
      await gov.connect(alice).finaliseElection(1);
      await time.increase(TIMELOCK + 1);
      await gov.connect(alice).executeElection(1);
      await expect(
        gov.connect(alice).executeElection(1)
      ).to.be.revertedWith("Gov: already executed");
    });
  });

  describe("resign", () => {
    it("only the current holder may resign", async () => {
      const { gov, bob } = await loadFixture(deploy);
      // bob is the CFO (per fixture); calling resign on CEO from bob → not the holder
      await expect(
        gov.connect(bob).resign(ROLE.CEO)
      ).to.be.revertedWith("Gov: not CEO");
    });

    it("clears the holder + emits RoleVacated", async () => {
      const { gov, alice } = await loadFixture(deploy);
      await expect(gov.connect(alice).resign(ROLE.CEO))
        .to.emit(gov, "RoleVacated")
        .withArgs(ROLE.CEO, alice.address);
      const [holder, , active] = await gov.roleHolder(ROLE.CEO);
      expect(holder).to.equal(ethers.ZeroAddress);
      expect(active).to.equal(false);
    });
  });

  describe("M-22 — auto-handover of MCC O-token on CEO election", () => {
    async function deployWithOToken() {
      const fixt = await loadFixture(deploy);
      const { gov, mock, deployer, alice } = fixt;
      // Deploy a real OToken whose `colony` is the mock (so isCitizen works)
      const OToken = await ethers.getContractFactory("OToken");
      const oToken = await OToken.deploy("Fairbrook", await mock.getAddress());
      // Mint the MCC O-token (id 1, orgType=MCC) to the founding CEO (alice)
      await oToken.connect(deployer).mint(alice.address, "Fairbrook MCC", 1);
      // Wire: OToken trusts Governance; Governance knows OToken
      await oToken.connect(deployer).setElectionAuthority(await gov.getAddress());
      await gov.setOToken(await oToken.getAddress());
      return { ...fixt, oToken };
    }

    it("setOToken can only be called once", async () => {
      const { gov, alice } = await loadFixture(deploy);
      await gov.setOToken(alice.address);  // any non-zero, just to set it
      await expect(
        gov.setOToken(alice.address)
      ).to.be.revertedWith("Gov: oToken already set");
    });

    it("setOToken rejects zero address", async () => {
      const { gov } = await loadFixture(deploy);
      await expect(
        gov.setOToken(ethers.ZeroAddress)
      ).to.be.revertedWith("Gov: zero oToken");
    });

    async function runElection(fixt) {
      const { gov, alice, dave } = fixt;
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, dave.address);
      await time.increase(VOTING_WINDOW + 1);
      await gov.connect(alice).finaliseElection(1);
      await time.increase(TIMELOCK + 1);
      return gov.connect(alice).executeElection(1);
    }

    it("when wired, executeElection auto-transfers the MCC O-token to the new CEO", async () => {
      const fixt = await deployWithOToken();
      const { oToken, dave } = fixt;
      await runElection(fixt);
      expect(await oToken.ownerOf(1)).to.equal(dave.address);
    });

    it("emits MccOTokenAutoHandedOver(newCeo)", async () => {
      const fixt = await deployWithOToken();
      const { gov, dave } = fixt;
      await expect(runElection(fixt))
        .to.emit(gov, "MccOTokenAutoHandedOver")
        .withArgs(dave.address);
    });

    it("when NOT wired, executeElection still installs the new CEO (no handover, no error)", async () => {
      const fixt = await loadFixture(deploy);
      await runElection(fixt);
      const [holder] = await fixt.gov.roleHolder(ROLE.CEO);
      expect(holder).to.equal(fixt.dave.address);
    });

    it("non-CEO elections do NOT trigger handover", async () => {
      const fixt = await deployWithOToken();
      const { gov, oToken, alice, dave } = fixt;
      // Run a CFO election — alice the only voter elects dave
      await gov.connect(alice).openElection(ROLE.CFO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await gov.connect(alice).vote(1, dave.address);
      await time.increase(VOTING_WINDOW + 1);
      await gov.connect(alice).finaliseElection(1);
      await time.increase(TIMELOCK + 1);
      await gov.connect(alice).executeElection(1);
      // O-token still with founding CEO (alice)
      expect(await oToken.ownerOf(1)).to.equal(alice.address);
    });
  });

  describe("voter eligibility — age and join time", () => {
    it("under-18 cannot vote", async () => {
      const { gov, mock, alice, dave, erika } = await loadFixture(deploy);
      // Make erika an underage citizen
      await mock.setBirthYear(erika.address, 2020);
      await gov.connect(alice).openElection(ROLE.CEO);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await expect(
        gov.connect(erika).vote(1, dave.address)
      ).to.be.revertedWith("Gov: not eligible to vote");
    });

    it("citizen who joined AFTER election opened cannot vote", async () => {
      const { gov, mock, alice, dave, erika } = await loadFixture(deploy);
      await gov.connect(alice).openElection(ROLE.CEO);
      // Set erika's joinedAt to 'now' (just after election opened)
      const nowTs = await time.latest();
      await mock.setJoinedAt(erika.address, nowTs + 100);
      await gov.connect(alice).nominateCandidate(1, dave.address);
      await time.increase(NOMINATION_WINDOW + 1);
      await expect(
        gov.connect(erika).vote(1, dave.address)
      ).to.be.revertedWith("Gov: not eligible to vote");
    });
  });
});
