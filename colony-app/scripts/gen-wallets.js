import { ethers } from 'ethers'

console.log('# Paste these into your .env.seed file\n')
for (let i = 0; i < 5; i++) {
  const w = ethers.Wallet.createRandom()
  console.log(`BOT_${i}_KEY=${w.privateKey}`)
  console.log(`# BOT_${i}_ADDRESS=${w.address}\n`)
}
