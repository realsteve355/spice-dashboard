# SPICE Colony — Token Design
*Canonical reference for the five-token system. All contracts and UI must conform to this document.*

---

## The Five Tokens

| Token | Standard | Count | Transferable | Purpose |
|-------|----------|-------|-------------|---------|
| **G** | ERC-721 | 1 per citizen | No — soulbound | Citizen identity and governance voting |
| **O** | ERC-721 | 1 per organisation | Role only — between citizens | Organisation identity and on-chain authority |
| **S** | ERC-20 | Unlimited | Yes | Colony currency — daily spending, UBI |
| **V** | ERC-20 | Unlimited | Restricted | Long-term savings and company capital |
| **A** | ERC-721 | 1 per asset | Yes | Physical asset ownership |
| **L** | ERC-721 | 1 per land parcel | Harberger only | Surface land — Harberger stewardship |

*A and L are both issued by the AssetRegistry contract using an AssetType enum. They are listed separately above because they have different transfer rules.*

---

## G-Token — Citizen Governance

**One per adult citizen. Soulbound. Never transfers.**

Issued by the colony (GToken contract) when a citizen signs the founding constitution on-chain. The G-token is the on-chain proof of citizenship. It is non-transferable, non-inheritable, and non-purchasable. It is retired on registered death.

**What the G-token confers:**

- One vote in the annual MCC board election
- One vote in any recall referendum
- One vote in constitutional referenda requiring citizen approval
- The right to receive MCC dividends if the board proposes and G-token holders approve

**What the G-token does not confer:**

- Commercial ownership of MCC
- Any claim on colony assets
- Voting rights in private company governance (shareholders govern companies; citizens govern MCC)

**Issuance rules:**

| Rule | Detail |
|------|--------|
| Issued by | Colony contract on `join()` |
| Eligibility | Any person who signs the founding constitution |
| Timing | At the moment of registration |
| Children | No G-token until adulthood (18). Guardian manages wallet. |
| Death | G-token retired — cannot pass to heirs |

**On-chain implementation:** ERC-721 with soulbound transfer block. Transfers permitted only from address(0) (minting). On-chain SVG metadata. `tokenOf(address)` returns citizen's token ID.

---

## O-Token — Organisation Identity

**One per registered organisation. Held by the authorised representative. Transfers when the role changes.**

The O-token is the on-chain identity of an organisation within the colony. Any registered entity — a company, the MCC, a cooperative, a civic association — holds exactly one O-token. It is held by whoever currently fills the organisation's authorised signatory role (company secretary, MCC chair, or equivalent).

The O-token is not a voting instrument. Organisations do not vote in colony governance. Citizens vote. The secretary of a company votes as a citizen, using their personal G-token.

**What the O-token confers:**

- Proof of organisation registration within the colony
- Authority to sign on-chain transactions on behalf of the organisation: dividend distributions, treasury operations, service updates, asset transfers
- Identity visible to any citizen inspecting the registry — who the organisation is, who currently speaks for it

**Transfer rules:**

- O-token transfers only between citizens registered within the same colony
- Current holder initiates the transfer to the incoming secretary/representative
- Cannot be transferred to an unregistered address or to another organisation
- Cannot be sold — it represents a role, not a financial instrument

**Issuance rules:**

| Rule | Detail |
|------|--------|
| Issued by | CompanyFactory on `deployCompany()` |
| Timing | At the moment of organisation registration |
| Initial holder | The registering citizen (founding secretary) |
| MCC | MCC O-token issued on colony deployment, held by colony founder initially |
| Count | Exactly one per organisation — no duplicates |

**On-chain implementation:** ERC-721. Transfers permitted between registered citizens. On-chain SVG metadata includes organisation name, type (COMPANY / MCC / COOPERATIVE / CIVIC), registration number, and current holder.

**Organisation types:**

| Type | Description |
|------|-------------|
| COMPANY | For-profit enterprise registered with the Fisc |
| MCC | The colony's essential infrastructure provider |
| COOPERATIVE | Member-owned enterprise with shared governance |
| CIVIC | Non-profit civic association |

---

## S-Token — Spending Currency

**Issued monthly as UBI. Expires at month end. Cannot be saved.**

1,000 S-tokens issued to every registered citizen on the 1st of each month by the Fisc (Colony contract). Companies earn S-tokens from customers. All S-tokens not spent by month end are destroyed. No exceptions.

| Property | Detail |
|----------|--------|
| Issued by | Fisc (Colony contract) via `issueUbi()` |
| Amount | 1,000 per adult citizen per month (fixed) |
| Expiry | Midnight on the last day of each month |
| Holders | Citizens, companies, MCC |
| Transfer | Via `colony.send(to, amount, note)` — any address |
| Purpose | Pay MCC bills, pay companies, pay other citizens, convert to V-tokens |

Companies receive S-tokens at their company wallet address. The colony `send()` function does not require the recipient to be a citizen — any address may receive S-tokens.

---

## V-Token — Savings and Capital

**Permanent store of value. Earned by conversion from S. Expires after 100 years (citizen holdings only).**

Citizens may convert up to 200 S-tokens per month to V-tokens. Companies convert ALL net monthly S-token earnings to V-tokens at month end. V-tokens never expire for companies. Citizen V-tokens expire 100 years after their mint date — long enough to outlast any realistic lifespan, preventing multi-generational dynastic accumulation.

| Rule | Citizens | Companies |
|------|----------|-----------|
| Conversion cap | 200 S/month | All net S-token earnings |
| Expiry | 100 years from mint date | No expiry |
| Redeem | V → S at 1:1 any time | V → S at 1:1 any time |
| Dividends | Receive dividends in V-tokens | Pay dividends in V-tokens |
| Transfer | Non-transferable P2P | Via dividend distribution only |

V-token non-transferability between citizens is intentional. The only legitimate ways for V-tokens to move between wallets are: (1) dividend distributions from a company's registered equity structure, (2) inheritance on registered death, and (3) company redemption-and-payment cycles. No P2P V-token market exists — preventing wealth redistribution from bypassing the equity and inheritance system.

---

## A-Token — Physical Asset Ownership

**One per registered physical asset. ERC-721. Freely transferable between citizens and company wallets.**

Registration is required for any physical asset above the registration threshold. Below the threshold, possession implies ownership with no on-chain record needed.

**Registration threshold:** value > 500 S-token equivalent, OR weight > 50 kg, OR the asset has autonomous AI capability.

| Property | Detail |
|----------|--------|
| Issued by | AssetRegistry contract on `registerAsset()` |
| Holders | Citizens and company wallets |
| Transfer | `transferAsset(tokenId, to)` — standard ERC-721 transfer is blocked; use this function |
| Purpose | On-chain proof of asset ownership, verifiable by any party |

Company wallets may hold A-tokens directly. A robot, vehicle, or piece of AI hardware owned by a company is transferred to the company's contract address, appearing on the public registry as company-owned.

---

## L-Token — Surface Land (Harberger)

**One per surface land parcel. ERC-721. Force-purchase only — owner cannot refuse sale at declared price.**

Every surface land claim operates under Harberger stewardship. The owner declares a V-token value. Anyone may purchase the land at that price at any time. The owner pays 0.5% of the declared value per epoch in V-tokens to the colony treasury.

| Property | Detail |
|----------|--------|
| Issued by | AssetRegistry contract on `claimLand()` |
| Holders | Citizens and company wallets |
| Transfer | `purchaseLand(tokenId)` — buyer pays declared value in V-tokens; standard ERC-721 transfer blocked |
| Stewardship fee | 0.5% of declared value per epoch, paid in V-tokens |
| First registration | First-come-first-served on any unclaimed parcel |

---

## Who Can Hold What

| Token | Citizen | Company wallet | MCC wallet | Unregistered address |
|-------|---------|---------------|------------|----------------------|
| G | Yes (1 only) | No | No | No |
| O | Yes (as role-holder) | No | No | No |
| S | Yes | Yes | Yes | Yes (receive only) |
| V | Yes | Yes | Yes | No |
| A | Yes | Yes | Yes | No |
| L | Yes | Yes | Yes | No |

---

## Company Wallet Design

Each registered company is deployed as a smart contract via the CompanyFactory using the EIP-1167 minimal clone pattern. The contract address is the company's wallet. There is no separate EOA or key management requirement.

The company wallet:
- Receives S-tokens from `colony.send()` calls
- Holds V-tokens (company savings and capital reserves)
- Holds A-tokens (physical assets owned by the company)
- Holds L-tokens (surface land claims)
- Executes dividend distributions to equity holders
- Is identified by the O-token held by the company secretary

**Clone factory cost on Base L2:** approximately 45,000 gas per company (~$0.01). The CompanyImplementation contract is deployed once; each company is a minimal proxy to it.

---

## Governance — Who Votes and on What

Citizens vote in colony governance using their G-tokens. Organisations do not vote. The company secretary votes as a citizen, using their personal G-token, not the company's O-token.

| Decision | Voting instrument | Quorum |
|----------|------------------|--------|
| Annual MCC board election | G-token (citizens) | Simple majority |
| MCC recall referendum | G-token (citizens) | Triggered automatically at >20% bill rise |
| Constitutional amendment | G-token (citizens) | 80% of all registered citizens |
| MCC dividend proposal | G-token (citizens) | Majority approval |
| Company dividend distribution | Equity holders (S-token weighted) | Per company articles |
| Share transfer | Equity holder consent | Per company articles |

---

## Resolved Design Decisions

| Question | Decision |
|----------|----------|
| Organisations and G-tokens | Organisations do not hold G-tokens. Citizens vote; organisations act. |
| Organisation identity token | O-token — separate from G-token. One per org, role-transferable. |
| O-token voting | O-token confers no voting rights. It is an identity and authority token only. |
| Company as contract | Companies are smart contracts (EIP-1167 clones). Company wallet = contract address. |
| Company treasury | S-tokens, V-tokens held at company contract address natively via ERC-20 standard. |
| Dividend currency | V-tokens. Companies convert net S earnings to V, distribute V to equity holders. |
| Share ledger | Equity table in CompanyRegistry (equityHolders[], equityStakes[] in basis points). |
| Share transfers | On-chain ledger update. Citizens only. No open market. |
| Dividend distribution | Push-based (loop through equity holders). Pull-based for companies with >50 shareholders (future). |
| MCC O-token | MCC holds one O-token, initially issued to colony founder, transferable to designated MCC chair. |
| A-token and L-token | Both issued by AssetRegistry contract. A-token transfers freely; L-token via Harberger force-purchase only. |

---

*SPICE Colony Token Design · v1 · April 2026*
