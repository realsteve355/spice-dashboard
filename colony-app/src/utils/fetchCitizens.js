import { ethers } from 'ethers'

const CITIZEN_JOINED_TOPIC = ethers.id("CitizenJoined(address,uint256,string)")
const CITIZEN_IFACE = new ethers.Interface([
  "event CitizenJoined(address indexed citizen, uint256 gTokenId, string name)",
])

const LOG_RPC = 'https://sepolia.base.org'
const FALLBACK_RPC = 'https://base-sepolia-rpc.publicnode.com'

export async function fetchCitizens(colonyAddr) {
  const map = {}

  // Strategy 1: single fromBlock:0 call on the official RPC
  try {
    const rpc  = new ethers.JsonRpcProvider(LOG_RPC)
    const logs = await rpc.getLogs({
      address:   colonyAddr,
      fromBlock: 0,
      toBlock:   'latest',
      topics:    [CITIZEN_JOINED_TOPIC],
    })
    for (const log of logs) {
      try {
        const { args } = CITIZEN_IFACE.parseLog({ topics: log.topics, data: log.data })
        map[args.citizen.toLowerCase()] = { address: args.citizen, name: args.name }
      } catch {}
    }
    if (Object.keys(map).length > 0) {
      return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch {}

  // Strategy 2: chunked fallback on publicnode
  try {
    const rpc     = new ethers.JsonRpcProvider(FALLBACK_RPC)
    const toBlock = await rpc.getBlockNumber()
    const CHUNK   = 9000
    for (let i = 0; i < 20; i++) {
      const chunkTo   = toBlock - i * CHUNK
      const chunkFrom = Math.max(0, chunkTo - CHUNK + 1)
      if (chunkFrom > chunkTo) break
      try {
        const logs = await rpc.getLogs({
          address:   colonyAddr,
          fromBlock: chunkFrom,
          toBlock:   chunkTo,
          topics:    [CITIZEN_JOINED_TOPIC],
        })
        for (const log of logs) {
          try {
            const { args } = CITIZEN_IFACE.parseLog({ topics: log.topics, data: log.data })
            map[args.citizen.toLowerCase()] = { address: args.citizen, name: args.name }
          } catch {}
        }
        if (Object.keys(map).length > 0 && i >= 3) break
      } catch {}
    }
  } catch {}

  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
}
