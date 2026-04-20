import { ethers } from 'ethers'

const RPC = 'https://sepolia.base.org'

const COLONY_ABI = [
  "function gToken() view returns (address)",
]

const GTOKEN_ABI = [
  "function nextTokenId() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function citizenName(uint256 tokenId) view returns (string)",
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const { colony } = req.query
  if (!colony || !ethers.isAddress(colony)) {
    return res.status(400).json({ error: 'colony address required' })
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC)

    // Step 1: get gToken address from Colony contract
    const colonyContract = new ethers.Contract(colony, COLONY_ABI, provider)
    const gTokenAddr = await colonyContract.gToken()

    // Step 2: read nextTokenId to know how many tokens exist
    const gToken = new ethers.Contract(gTokenAddr, GTOKEN_ABI, provider)
    const nextId = Number(await gToken.nextTokenId())

    // Step 3: for each minted token, fetch owner + name
    const citizens = []
    for (let tokenId = 1; tokenId < nextId; tokenId++) {
      try {
        const [owner, name] = await Promise.all([
          gToken.ownerOf(tokenId),
          gToken.citizenName(tokenId),
        ])
        citizens.push({ address: owner, name: name || owner })
      } catch {
        // token burned or reverted — skip
      }
    }

    citizens.sort((a, b) => a.name.localeCompare(b.name))
    return res.status(200).json({ citizens })
  } catch (err) {
    console.error('[/api/citizens]', err?.message)
    return res.status(500).json({ error: err?.message })
  }
}
