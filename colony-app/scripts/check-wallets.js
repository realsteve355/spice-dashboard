/**
 * check-wallets.js — show the addresses that correspond to the keys in .env.seed
 * Run: node --env-file=.env.seed scripts/check-wallets.js
 */
import { ethers } from 'ethers'

const RPC      = 'https://sepolia.base.org'
const provider = new ethers.JsonRpcProvider(RPC, { chainId: 84532, name: 'base-sepolia' })
const NAMES    = ['Alice', 'Bob', 'Charlie', 'Diana', 'Erik']

console.log('\nWallet addresses derived from your .env.seed keys:\n')

for (let i = 0; i < 5; i++) {
  const key = process.env[`BOT_${i}_KEY`]
  if (!key) { console.log(`BOT_${i}: not set`); continue }
  const wallet = new ethers.Wallet(key)
  const bal    = await provider.getBalance(wallet.address)
  const eth    = parseFloat(ethers.formatEther(bal))
  console.log(`BOT_${i} (${NAMES[i].padEnd(7)})  ${wallet.address}  ${eth.toFixed(4)} ETH`)
}

console.log('\nFund any wallets showing 0.0000 ETH at:')
console.log('https://www.alchemy.com/faucets/base-sepolia\n')
