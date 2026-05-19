// variants/mars/help.js
// Mars-colony HELP content for the Layout drawer.
// Includes V-token entries — Mars runs V-tokens for long-term savings.
export const HELP = {
  mall: {
    title: 'The Colony Mall',
    sections: [
      {
        heading: 'Browsing stores',
        body: 'The Mall lists every company in the colony that has products for sale. Tap "Browse →" on any store to see what they\'re selling.',
      },
      {
        heading: 'Buying',
        body: 'Select a product and tap "Buy". You can optionally add a delivery note — a date, time, or collection preference. The payment is made directly from your MOND balance to the company wallet.',
      },
      {
        heading: 'Opening a store',
        body: 'If you are the secretary of a registered company, go to your company page and you will find the store linked from the Mall automatically. Add products from the store page.',
      },
    ],
  },
  store: {
    title: 'Store',
    sections: [
      {
        heading: 'Buying a product',
        body: 'Tap "Buy" on any product. You can optionally add delivery notes (e.g. a date, time, or address). You\'ll then confirm the MOND payment on the next screen.',
      },
      {
        heading: 'Managing your store',
        body: 'If you are the company secretary, you can add products, edit listings, hide items that are temporarily unavailable, and upload product photos.',
      },
      {
        heading: 'Pricing',
        body: 'Prices are set in MOND — the colony\'s everyday currency. Citizens receive MOND as basic income from the MCC, so prices should reflect what the colony economy can support.',
      },
    ],
  },
  governance: {
    title: 'MCC Governance',
    sections: [
      {
        heading: 'Election phases',
        body: 'Each election runs through four phases:\n\n1. NOMINATIONS — any citizen can open an election; citizens nominate candidates during this window\n2. VOTING — each citizen casts one vote for their preferred candidate\n3. FINALISE — after voting closes, anyone taps Finalise to count votes and record the winner\n4. EXECUTE — after the timelock expires, anyone taps Execute to install the winner in post',
      },
      {
        heading: 'Timings',
        body: 'On this testnet: nominations 15 min, voting 30 min, timelock 5 min. Mainnet will use 7 / 14 / 7 days respectively.',
      },
      {
        heading: 'Resign',
        body: 'Any current role holder can resign immediately using the Resign button. The role becomes vacant and a new election can be opened straight away.',
      },
    ],
  },
  dashboard: {
    title: 'Colony Dashboard',
    sections: [
      {
        heading: 'MOND',
        body: 'MOND are your everyday colony currency. Use them to pay local businesses, send to other citizens, or buy products in the Mall. The MCC issues MOND as basic income — claim yours daily with the UBI button.',
      },
      {
        heading: 'V-tokens',
        body: 'V-tokens are long-term savings. Convert MOND → V to lock earnings; V-tokens accrue yield from colony economic activity. V cannot be spent directly — redeem back to MOND when you need liquidity.',
      },
      {
        heading: 'Sending MOND',
        body: 'Tap "Send MOND" to transfer to any citizen or company address. You can add a note (e.g. "Coffee, 12 May") which appears in both wallets\' transaction history.',
      },
    ],
  },
  company: {
    title: 'Company',
    sections: [
      {
        heading: 'Tabs',
        body: 'Overview — company wallet balance and secretary actions\nEquity — shareholder register, vesting schedule, dividends\nAccounts — full transaction journal with P&L summary\nContracts — supply agreements with other colony companies',
      },
      {
        heading: 'Secretary role',
        body: 'The secretary controls the company wallet: send MOND to pay suppliers, convert MOND → V to lock earnings, declare V dividends to shareholders, and issue equity stakes.',
      },
      {
        heading: 'Equity',
        body: 'Open shares are freely transferable (for investors). Vesting shares unlock in monthly tranches and are forfeited if the participant stops contributing — the secretary can forfeit unvested shares.',
      },
    ],
  },
  assets: {
    title: 'Your Assets',
    sections: [
      {
        heading: 'Token types',
        body: 'MOND — spendable everyday currency (expires monthly)\nV-tokens — long-term savings (does not expire)\nG-token — citizenship and one vote (soulbound, non-transferable)\nA-tokens — assets, equity stakes, and bilateral obligations\nO-tokens — organisation identity, held by company secretary or MCC chair',
      },
    ],
  },
  default: {
    title: 'AXION Colony',
    sections: [
      {
        heading: 'What is AXION Colony?',
        body: 'A community economic system where citizens receive MOND as basic income and spend it within the colony. Companies issue equity, trade with each other, and sell products in the Mall.',
      },
      {
        heading: 'Getting started',
        body: '1. Connect your MetaMask wallet\n2. Find a colony in the directory and register as a citizen\n3. Claim your daily UBI from the Dashboard\n4. Browse the Mall, or register a company if you have something to offer',
      },
      {
        heading: 'Need help with a specific page?',
        body: 'Navigate to that page, then tap the Help tab for context-specific guidance.',
      },
    ],
  },
}
