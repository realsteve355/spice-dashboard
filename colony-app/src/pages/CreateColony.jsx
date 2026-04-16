import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import Layout from '../components/Layout'
import { useWallet } from '../App'

import { C } from '../theme'

// On-chain registry — makes colonies discoverable to all users on all devices
const REGISTRY_ADDRESS = '0x9d26CAB7bbe699b30Fa20DC71c99095f58A18e7d'
const REGISTRY_ABI = [
  'function register(address colony, string calldata name, string calldata slug) external',
]

const FIXED_PARAMS = [
  { label: 'UBI per citizen',        value: '1,000 S-tokens / month' },
  { label: 'Max monthly savings',    value: '200 S-tokens → V'       },
  { label: 'Adulthood',              value: '18 years'               },
  { label: 'MCC recall trigger',     value: 'Bill +20% above 12m avg'},
  { label: 'Constitutional change',  value: '80% referendum required'},
  { label: 'V-token expiry',         value: '100 years from mint'    },
  { label: 'Harberger fee',          value: '0.5% declared value/mo' },
]

// Deploy a contract from its artifact — returns { contract, addr }
async function deployContract(label, abi, bytecode, signer, ...args) {
  const factory  = new ethers.ContractFactory(abi, bytecode, signer)
  const contract = await factory.deploy(...args)
  await contract.deploymentTransaction().wait(1)
  const addr = await contract.getAddress()
  return { contract, addr }
}

export default function CreateColony() {
  const navigate  = useNavigate()
  const { isConnected, connect, address, signer } = useWallet()

  const [step, setStep]           = useState(1)
  const [name, setName]           = useState('')
  const [ticker, setTicker]       = useState('')
  const [tickerEdited, setTickerEdited] = useState(false)
  const [description, setDesc]    = useState('')
  const [boards, setBoards]       = useState([''])
  const [accepted, setAccepted]   = useState(false)

  const [deploying, setDeploying] = useState(false)
  const [deployLog, setDeployLog] = useState([])   // array of { text, done }
  const [deployError, setDeployError] = useState(null)
  const [deployedAddrs, setDeployedAddrs] = useState(null)

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  function handleNameChange(e) {
    const v = e.target.value
    setName(v)
    if (!tickerEdited) {
      const words = v.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean)
      const derived = words.map(w => w[0]).join('').toUpperCase().slice(0, 5) || v.slice(0, 3).toUpperCase()
      setTicker(derived)
    }
  }

  function handleTickerChange(e) {
    setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))
    setTickerEdited(true)
  }

  function addBoard() { setBoards(b => [...b, '']) }
  function updateBoard(i, v) { setBoards(b => b.map((x, idx) => idx === i ? v : x)) }
  function removeBoard(i) { setBoards(b => b.filter((_, idx) => idx !== i)) }

  async function handleDeploy() {
    if (!window.ethereum) { setDeployError('MetaMask not found.'); return }
    setDeploying(true)
    setDeployError(null)
    setDeployLog([])

    // Lazy-load the compiled artifacts (215 KB) — only when user triggers deploy
    let ARTIFACTS
    try {
      const mod = await import('../data/deployArtifacts.js')
      ARTIFACTS = mod.ARTIFACTS
    } catch (e) {
      setDeployError('Failed to load contract artifacts: ' + e.message)
      setDeploying(false)
      return
    }

    const addLog = (text, done = false) =>
      setDeployLog(prev => [...prev, { text, done }])

    const run = async (label, fn) => {
      addLog(`${label}…`)
      const result = await fn()
      setDeployLog(prev => {
        const next = [...prev]
        next[next.length - 1] = { text: `✓ ${label}`, done: true }
        return next
      })
      return result
    }

    try {
      // Get a fresh signer directly from MetaMask — avoids stale state from a previous
      // connect() call or a chain switch that happened after the signer was stored.
      const freshProvider = new ethers.BrowserProvider(window.ethereum)

      // Verify network before spending any gas
      const network = await freshProvider.getNetwork()
      if (Number(network.chainId) !== 84532) {
        setDeployError(`Wrong network. MetaMask is on chain ${network.chainId}. Please switch to Base Sepolia (84532) and try again.`)
        setDeploying(false)
        return
      }

      const freshSigner = await freshProvider.getSigner()
      const deployer    = await freshSigner.getAddress()

      // Warn on very low balance — each deploy needs ~0.01 ETH on Base Sepolia
      const balance = await freshProvider.getBalance(deployer)
      if (balance < ethers.parseEther('0.005')) {
        setDeployError(`Insufficient ETH. Your balance is ${Number(ethers.formatEther(balance)).toFixed(4)} ETH. You need at least 0.005 Base Sepolia ETH for gas. Get some from the Base Sepolia faucet at faucet.quicknode.com or faucet.triangleplatform.com.`)
        setDeploying(false)
        return
      }

      // Check slug availability before spending any gas
      const registryRead = new ethers.Contract(
        REGISTRY_ADDRESS,
        ['function slugToColony(string) view returns (address)'],
        freshProvider
      )
      const existingAddr = await registryRead.slugToColony(slug)
      if (existingAddr !== ethers.ZeroAddress) {
        setDeployError(`The name "${name}" is already taken in the global directory (slug: "${slug}"). Please go back and choose a different colony name.`)
        setDeploying(false)
        return
      }

      const zero = ethers.ZeroAddress

      // ── 1–3. Tokens ──────────────────────────────────────────────────────────
      const { contract: gTokenC, addr: gTokenAddr } = await run(
        `Deploy GToken (${ticker})`, () =>
        deployContract('GToken', ARTIFACTS.GToken.abi, ARTIFACTS.GToken.bytecode, freshSigner, name, ticker)
      )
      const { contract: sTokenC, addr: sTokenAddr } = await run(
        `Deploy SToken (S-${ticker})`, () =>
        deployContract('SToken', ARTIFACTS.SToken.abi, ARTIFACTS.SToken.bytecode, freshSigner, ticker)
      )
      const { contract: vTokenC, addr: vTokenAddr } = await run(
        `Deploy VToken (V-${ticker})`, () =>
        deployContract('VToken', ARTIFACTS.VToken.abi, ARTIFACTS.VToken.bytecode, freshSigner, ticker)
      )

      // ── 4. Colony ─────────────────────────────────────────────────────────────
      const { contract: colonyC, addr: colonyAddr } = await run(
        'Deploy Colony (Fisc)', () =>
        deployContract('Colony', ARTIFACTS.Colony.abi, ARTIFACTS.Colony.bytecode, freshSigner,
          name, zero, gTokenAddr, sTokenAddr, vTokenAddr)
      )

      // ── 5. Transfer token ownership to Colony ─────────────────────────────────
      await run('Transfer GToken ownership to Colony', async () => {
        const tx = await gTokenC.connect(freshSigner).transferOwnership(colonyAddr)
        await tx.wait(1)
      })
      await run('Transfer SToken ownership to Colony', async () => {
        const tx = await sTokenC.connect(freshSigner).transferOwnership(colonyAddr)
        await tx.wait(1)
      })
      await run('Transfer VToken ownership to Colony', async () => {
        const tx = await vTokenC.connect(freshSigner).transferOwnership(colonyAddr)
        await tx.wait(1)
      })

      // ── 6. OToken ─────────────────────────────────────────────────────────────
      const { contract: oTokenC, addr: oTokenAddr } = await run(
        'Deploy OToken (org identity)', () =>
        deployContract('OToken', ARTIFACTS.OToken.abi, ARTIFACTS.OToken.bytecode, freshSigner, name, colonyAddr)
      )

      // ── 7. OToken wiring ──────────────────────────────────────────────────────
      await run('Mint MCC O-token to founder', async () => {
        const tx = await oTokenC.connect(freshSigner).mint(deployer, name + ' MCC', 1)
        await tx.wait(1)
      })
      await run('Transfer OToken ownership to Colony', async () => {
        const tx = await oTokenC.connect(freshSigner).transferOwnership(colonyAddr)
        await tx.wait(1)
      })
      await run('Wire OToken into Colony', async () => {
        const tx = await colonyC.connect(freshSigner).setOToken(oTokenAddr)
        await tx.wait(1)
      })

      // ── 8–10. Company contracts ───────────────────────────────────────────────
      const { addr: implAddr } = await run(
        'Deploy CompanyImplementation', () =>
        deployContract('CompanyImplementation', ARTIFACTS.CompanyImplementation.abi, ARTIFACTS.CompanyImplementation.bytecode, freshSigner)
      )
      const { addr: beaconAddr } = await run(
        'Deploy UpgradeableBeacon', () =>
        deployContract('UpgradeableBeacon', ARTIFACTS.UpgradeableBeacon.abi, ARTIFACTS.UpgradeableBeacon.bytecode, freshSigner, implAddr, deployer)
      )
      const { contract: factoryC, addr: factoryAddr } = await run(
        'Deploy CompanyFactory', () =>
        deployContract('CompanyFactory', ARTIFACTS.CompanyFactory.abi, ARTIFACTS.CompanyFactory.bytecode, freshSigner, colonyAddr, oTokenAddr, beaconAddr)
      )
      await run('Wire CompanyFactory into Colony', async () => {
        const tx = await colonyC.connect(freshSigner).setCompanyFactory(factoryAddr)
        await tx.wait(1)
      })

      // ── 11–12. MCC contracts ─────────────────────────────────────────────────
      const { addr: billingAddr } = await run(
        'Deploy MCCBilling', () =>
        deployContract('MCCBilling', ARTIFACTS.MCCBilling.abi, ARTIFACTS.MCCBilling.bytecode, freshSigner, colonyAddr)
      )
      const { addr: servicesAddr } = await run(
        'Deploy MCCServices', () =>
        deployContract('MCCServices', ARTIFACTS.MCCServices.abi, ARTIFACTS.MCCServices.bytecode, freshSigner, colonyAddr)
      )

      // ── Save to localStorage first — colony is usable even if registry call fails ─
      const stored = JSON.parse(localStorage.getItem('spice_user_colonies') || '{}')
      stored[slug] = {
        name,
        address:     colonyAddr,
        mccBilling:  billingAddr,
        mccServices: servicesAddr,
      }
      localStorage.setItem('spice_user_colonies', JSON.stringify(stored))

      // ── Register on-chain so all users on all devices can discover it ─────────
      // Non-fatal — colony is fully deployed and usable even without registry listing.
      try {
        await run('Register colony in global directory', async () => {
          const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, freshSigner)
          const tx = await registry.register(colonyAddr, name, slug)
          await tx.wait(1)
        })
      } catch (regErr) {
        const reason = regErr?.reason || regErr?.shortMessage || ''
        setDeployLog(prev => {
          const next = [...prev]
          next[next.length - 1] = {
            text: `⚠ Directory registration skipped (${reason || 'slug may already be taken'}) — colony still usable via direct link`,
            done: true,
          }
          return next
        })
      }

      setDeployedAddrs({ colony: colonyAddr, billing: billingAddr, services: servicesAddr })
      setDeploying(false)
      setStep(4)

    } catch (e) {
      const msg = e?.reason || e?.shortMessage || e?.message || 'Deploy failed'
      setDeployError(msg)
      setDeploying(false)
    }
  }

  if (!isConnected) return (
    <Layout title="Create a Colony" back="/">
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 1.6 }}>
          You need a wallet to create a colony.
        </div>
        <button onClick={connect} style={primaryBtn}>Connect Wallet</button>
      </div>
    </Layout>
  )

  return (
    <Layout title="Create a Colony" back="/">
      <div style={{ padding: '20px 16px 0' }}>

        {/* Step indicator */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: step >= n ? C.gold : C.border,
              }} />
            ))}
          </div>
        )}

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div>
            <div style={stepTitle}>Name your colony</div>
            <div style={stepSub}>This becomes your colony's permanent identity on the blockchain.</div>

            <div style={fieldGroup}>
              <label style={fieldLabel}>Colony name</label>
              <input
                style={input}
                placeholder="e.g. Turing Campus"
                value={name}
                onChange={handleNameChange}
                autoFocus
              />
              {slug && (
                <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
                  URL: app.zpc.finance/colony/<span style={{ color: C.gold }}>{slug}</span>
                </div>
              )}
            </div>

            <div style={fieldGroup}>
              <label style={fieldLabel}>Token ticker (1–5 letters)</label>
              <input
                style={input}
                placeholder="e.g. TC"
                value={ticker}
                onChange={handleTickerChange}
                maxLength={5}
              />
              {ticker && (
                <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
                  tokens:&nbsp;
                  <span style={{ color: C.gold }}>S-{ticker}</span>
                  &nbsp;·&nbsp;
                  <span style={{ color: C.gold }}>V-{ticker}</span>
                  &nbsp;·&nbsp;
                  <span style={{ color: C.gold }}>G-{ticker}</span>
                </div>
              )}
            </div>

            <div style={fieldGroup}>
              <label style={fieldLabel}>Description <span style={{ color: C.faint }}>(optional)</span></label>
              <textarea
                style={{ ...input, height: 80, resize: 'none' }}
                placeholder="A short description of your colony and its purpose."
                value={description}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name.trim() || !ticker.trim()}
              style={{ ...primaryBtn, opacity: name.trim() && ticker.trim() ? 1 : 0.4 }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Step 2: MCC Board ── */}
        {step === 2 && (
          <div>
            <div style={stepTitle}>Designate the MCC board</div>
            <div style={stepSub}>
              The MCC provides essential services and bills citizens monthly.
              The founding board is not elected — the first election is at Year 1 end.
            </div>

            {boards.map((addr, i) => (
              <div key={i} style={fieldGroup}>
                <label style={fieldLabel}>
                  {i === 0 ? 'Board member 1 (you)' : `Board member ${i + 1}`}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...input, flex: 1 }}
                    placeholder={i === 0 ? address : '0x...'}
                    value={i === 0 ? address : addr}
                    onChange={e => i > 0 && updateBoard(i, e.target.value)}
                    readOnly={i === 0}
                  />
                  {i > 0 && (
                    <button
                      onClick={() => removeBoard(i)}
                      style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '0 12px', cursor: 'pointer', color: C.faint }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}

            {boards.length < 6 && (
              <button
                onClick={addBoard}
                style={{ ...ghostBtn, width: '100%', marginBottom: 20 }}
              >
                + Add board member
              </button>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ ...ghostBtn, flex: 1 }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ ...primaryBtn, flex: 2 }}>Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Constitution & Deploy ── */}
        {step === 3 && (
          <div>
            {!deploying && !deployError && (
              <>
                <div style={stepTitle}>Review the founding constitution</div>
                <div style={stepSub}>
                  These rules are fixed. They may only be amended by 80% referendum of all registered citizens.
                </div>

                {/* Fixed parameters */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.faint, letterSpacing: '0.1em' }}>
                    FIXED PARAMETERS
                  </div>
                  {FIXED_PARAMS.map((p, i) => (
                    <div key={i} style={{
                      padding: '10px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: i < FIXED_PARAMS.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <span style={{ fontSize: 11, color: C.sub }}>{p.label}</span>
                      <span style={{ fontSize: 11, color: C.gold, fontWeight: 500 }}>{p.value}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 11, color: C.sub, lineHeight: 1.7 }}>
                  <span style={{ color: C.gold }}>Colony:</span> {name}<br />
                  <span style={{ color: C.gold }}>Tokens:</span> S-{ticker} · V-{ticker} · G-{ticker}<br />
                  <span style={{ color: C.gold }}>URL:</span> app.zpc.finance/colony/{slug}<br />
                  <span style={{ color: C.gold }}>MCC board:</span> {boards.length} member{boards.length !== 1 ? 's' : ''}<br />
                  <span style={{ color: C.gold }}>Network:</span> Base Sepolia
                </div>

                <div style={{ background: '#fffbf0', border: `1px solid ${C.gold}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
                  Deploying requires <strong>18 MetaMask confirmations</strong> — 10 contract deploys + 8 setup transactions. Keep MetaMask open throughout. The final step registers your colony in the global directory so anyone can find it.
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={e => setAccepted(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: C.gold, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
                    I have read and accept the founding constitution. I understand that these rules are fixed and may only be amended by 80% referendum.
                  </span>
                </label>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setStep(2)} style={{ ...ghostBtn, flex: 1 }}>← Back</button>
                  <button
                    onClick={handleDeploy}
                    disabled={!accepted}
                    style={{ ...primaryBtn, flex: 2, opacity: accepted ? 1 : 0.4 }}
                  >
                    Deploy Colony →
                  </button>
                </div>
              </>
            )}

            {/* Deploy progress log */}
            {deploying && (
              <div>
                <div style={stepTitle}>Deploying to Base Sepolia</div>
                <div style={stepSub}>Confirm each transaction in MetaMask as it appears.</div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
                  {deployLog.map((entry, i) => (
                    <div key={i} style={{
                      fontSize: 11, lineHeight: 1.8,
                      color: entry.done ? C.green : C.sub,
                    }}>
                      {entry.text}
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 8, fontStyle: 'italic' }}>
                    Waiting for MetaMask…
                  </div>
                </div>
              </div>
            )}

            {/* Deploy error */}
            {deployError && !deploying && (
              <div>
                <div style={stepTitle}>Deploy failed</div>
                <div style={{ background: '#fee2e2', border: `1px solid #fca5a5`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: C.red, lineHeight: 1.6 }}>{deployError}</div>
                </div>
                {deployLog.length > 0 && (
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    {deployLog.map((entry, i) => (
                      <div key={i} style={{ fontSize: 11, lineHeight: 1.8, color: entry.done ? C.green : C.sub }}>
                        {entry.text}
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { setDeployError(null); setDeployLog([]) }} style={{ ...ghostBtn, width: '100%' }}>
                  ← Try again
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Confirmation ── */}
        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⬡</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: C.text, marginBottom: 8 }}>
              Colony deployed
            </div>
            <div style={{ fontSize: 13, color: C.gold, marginBottom: 4 }}>{name}</div>
            {deployedAddrs && (
              <div style={{ fontSize: 10, color: C.faint, marginBottom: 24, lineHeight: 1.9, fontFamily: 'monospace' }}>
                Colony: {deployedAddrs.colony.slice(0, 10)}…{deployedAddrs.colony.slice(-6)}<br />
                MCCBilling: {deployedAddrs.billing.slice(0, 10)}…{deployedAddrs.billing.slice(-6)}<br />
                MCCServices: {deployedAddrs.services.slice(0, 10)}…{deployedAddrs.services.slice(-6)}
              </div>
            )}

            {/* Share */}
            <div style={{
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 16, marginBottom: 20, textAlign: 'left',
            }}>
              <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.1em', marginBottom: 10 }}>SHARE YOUR COLONY</div>
              <div style={{
                fontSize: 12, color: C.sub, background: C.bg,
                padding: '10px 12px', borderRadius: 6, marginBottom: 10,
                wordBreak: 'break-all',
              }}>
                app.zpc.finance/colony/{slug}
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(`https://app.zpc.finance/colony/${slug}`)}
                style={{ ...ghostBtn, width: '100%' }}
              >
                Copy invite link
              </button>
            </div>

            <button
              onClick={() => navigate(`/colony/${slug}?address=${deployedAddrs?.colony || ''}`)}
              style={{ ...primaryBtn, width: '100%' }}
            >
              Go to Colony →
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}

const primaryBtn = {
  padding: '13px 16px', background: C.gold, color: C.bg,
  border: 'none', borderRadius: 8, fontSize: 13,
  cursor: 'pointer', letterSpacing: '0.04em', fontWeight: 500,
  width: '100%',
}

const ghostBtn = {
  padding: '12px 16px', background: C.white, color: C.sub,
  border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12,
  cursor: 'pointer', letterSpacing: '0.04em',
}

const stepTitle = { fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 8 }
const stepSub   = { fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 20 }
const fieldGroup = { marginBottom: 16 }
const fieldLabel = { display: 'block', fontSize: 11, color: C.faint, letterSpacing: '0.08em', marginBottom: 6 }
const input = {
  width: '100%', padding: '11px 12px',
  border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 13, color: C.text, background: C.white,
  outline: 'none',
}
