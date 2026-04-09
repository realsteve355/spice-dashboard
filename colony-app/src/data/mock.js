// Mock data — replace with on-chain reads in Phase 2

export const MOCK_WALLET = '0xf39F...2266'

// Colonies this wallet is a citizen of
export const MOCK_CITIZEN_COLONIES = ['turing-campus', 'daves-colony']

// Colonies this wallet is MCC board of
export const MOCK_MCC_COLONIES = ['daves-colony']

export const MOCK_COLONIES = [
  {
    id: 'mars-alpha',
    name: 'Mars Alpha',
    description: 'The reference colony. 66 founders, 160 robots, Base Sepolia testnet.',
    founded: '2026-01-01',
    citizenCount: 66,
    mcc: {
      name: 'Mars Colony Co.',
      board: ['0x1111...aaaa'],
    },
    services: [
      { name: 'Atmospheric processing', billing: 'Flat monthly',  price: '120 S',      revenueMTD: 7920 },
      { name: 'Water',                  billing: 'Per litre',     price: '0.5 S / L',  revenueMTD: 3200 },
      { name: 'Power',                  billing: 'Per kWh',       price: '2 S / kWh',  revenueMTD: 5400 },
      { name: 'Habitat',               billing: 'Per m²',        price: '1 S / m²',   revenueMTD: 4200 },
      { name: 'Medical AI',            billing: 'Flat monthly',  price: '50 S',        revenueMTD: 3300 },
    ],
  },
  {
    id: 'turing-campus',
    name: 'Turing Campus',
    description: 'SPICE colony for the Turing Institute. Testing the system in a university setting.',
    founded: '2026-03-10',
    citizenCount: 14,
    mcc: {
      name: 'UCL Student Union',
      board: ['0x2222...bbbb'],
    },
    services: [
      { name: 'Coffee & snacks',   billing: 'Per item',  price: '5–20 S',    revenueMTD: 630 },
      { name: 'Event space hire',  billing: 'Per hour',  price: '10 S / hr', revenueMTD: 80  },
      { name: 'Printing',          billing: 'Per page',  price: '1 S / page',revenueMTD: 168 },
    ],
  },
  {
    id: 'daves-colony',
    name: "Dave's Test Colony",
    description: 'A minimal colony for testing the system mechanics.',
    founded: '2026-04-01',
    citizenCount: 3,
    mcc: {
      name: 'Dave',
      board: ['0x3333...cccc', '0xf39F...2266'],
    },
    services: [
      { name: 'Coffee', billing: 'Per cup', price: '5 S', revenueMTD: 45 },
    ],
  },
]

// Today is 2026-04-09 — reset in 21 days (April 30)
export const DAYS_TO_RESET = 21
export const RESET_DATE = '30 Apr 2026'
export const CURRENT_MONTH = 'April 2026'

export const MOCK_CITIZEN_DATA = {
  'turing-campus': {
    gTokenId: 2,
    registeredDate: '2026-03-10',
    sBalance: 743,
    vBalance: 12400,
    vSavedThisMonth: 0,
    vMaxMonthly: 200,
    ubiAmount: 1000,
    mccBill: {
      total: 57,
      breakdown: [
        { service: 'Coffee & snacks', amount: 45 },
        { service: 'Printing',        amount: 12 },
      ],
    },
    transactions: [
      { type: 'spend',  label: 'Printing',          amount: -12,   date: '3 Apr 2026'  },
      { type: 'spend',  label: 'Coffee & snacks',   amount: -45,   date: '1 Apr 2026'  },
      { type: 'redeem', label: 'V-token redemption',amount: +200,  date: '28 Mar 2026' },
      { type: 'ubi',    label: 'UBI allocation',    amount: +1000, date: '1 Apr 2026'  },
      { type: 'save',   label: 'Saved to V-tokens', amount: -200,  date: '28 Mar 2026' },
    ],
  },
  'daves-colony': {
    gTokenId: 1,
    registeredDate: '2026-04-01',
    sBalance: 950,
    vBalance: 0,
    vSavedThisMonth: 50,
    vMaxMonthly: 200,
    ubiAmount: 1000,
    mccBill: {
      total: 0,
      breakdown: [],
    },
    transactions: [
      { type: 'save', label: 'Saved to V-tokens', amount: -50,   date: '5 Apr 2026' },
      { type: 'ubi',  label: 'UBI allocation',    amount: +1000, date: '1 Apr 2026' },
    ],
  },
}

// Companies per colony
export const MOCK_COMPANIES = {
  'turing-campus': [
    {
      id: 'campus-coffee',
      name: 'Campus Coffee Co.',
      registeredDate: '2026-03-12',
      sBalance: 320,
      vReserve: 1200,
      monthRevenue: 420,
      monthExpenses: 100,
      equity: [
        { wallet: '0xf39F...2266', label: 'You',          pct: 60 },
        { wallet: '0xABCD...1234', label: '0xABCD...1234', pct: 40 },
      ],
      dividendHistory: [
        { date: '31 Mar 2026', totalV: 250, perHolder: { '0xf39F...2266': 150, '0xABCD...1234': 100 } },
        { date: '28 Feb 2026', totalV: 180, perHolder: { '0xf39F...2266': 108, '0xABCD...1234': 72  } },
      ],
      transactions: [
        { type: 'revenue', label: 'Customer payment', amount:  45, date: '8 Apr 2026' },
        { type: 'revenue', label: 'Customer payment', amount:  30, date: '7 Apr 2026' },
        { type: 'expense', label: 'Supplies',         amount: -20, date: '5 Apr 2026' },
        { type: 'revenue', label: 'Customer payment', amount:  25, date: '3 Apr 2026' },
      ],
    },
    {
      id: 'campus-print',
      name: 'QuickPrint',
      registeredDate: '2026-03-20',
      sBalance: 168,
      vReserve: 450,
      monthRevenue: 168,
      monthExpenses: 0,
      equity: [
        { wallet: '0xf39F...2266', label: 'You',          pct: 25 },
        { wallet: '0xABCD...1234', label: '0xABCD...1234', pct: 75 },
      ],
      dividendHistory: [
        { date: '31 Mar 2026', totalV: 120, perHolder: { '0xf39F...2266': 30, '0xABCD...1234': 90 } },
      ],
      transactions: [
        { type: 'revenue', label: 'Print job', amount: 12, date: '3 Apr 2026' },
        { type: 'revenue', label: 'Print job', amount:  8, date: '2 Apr 2026' },
        { type: 'revenue', label: 'Print job', amount:  5, date: '1 Apr 2026' },
      ],
    },
  ],
  'daves-colony': [
    {
      id: 'daves-coffee',
      name: "Dave's Coffee",
      registeredDate: '2026-04-01',
      sBalance: 45,
      vReserve: 0,
      monthRevenue: 45,
      monthExpenses: 0,
      equity: [
        { wallet: '0xf39F...2266', label: 'You', pct: 100 },
      ],
      dividendHistory: [],
      transactions: [
        { type: 'revenue', label: 'Coffee sale', amount: 15, date: '9 Apr 2026' },
        { type: 'revenue', label: 'Coffee sale', amount:  5, date: '8 Apr 2026' },
        { type: 'revenue', label: 'Coffee sale', amount: 25, date: '5 Apr 2026' },
      ],
    },
  ],
}

// Equity positions held by mock wallet, keyed by colony
export const MOCK_MY_EQUITY = {
  'turing-campus': [
    { companyId: 'campus-coffee', name: 'Campus Coffee Co.', pct: 60, lastDividendV: 150 },
    { companyId: 'campus-print',  name: 'QuickPrint',         pct: 25, lastDividendV: 30  },
  ],
  'daves-colony': [
    { companyId: 'daves-coffee', name: "Dave's Coffee", pct: 100, lastDividendV: 0 },
  ],
}

// Governance votes per colony
export const MOCK_VOTES = {
  'turing-campus': [
    {
      id: 'vote-001',
      type: 'election',
      title: 'MCC Board Election — Year 1',
      description: 'Annual election of the MCC board. The founding board\'s term expires at the end of Year 1. Vote for one slate.',
      status: 'open',
      deadline: '31 Dec 2026',
      options: [
        { id: 'a', label: 'UCL Student Union (incumbent)', votes: 8 },
        { id: 'b', label: 'Independent Slate — R. Okafor + 2', votes: 2 },
      ],
      yourVote: null,
      totalEligible: 14,
      totalVoted: 10,
    },
    {
      id: 'vote-002',
      type: 'dividend',
      title: 'MCC Dividend Proposal',
      description: 'The MCC board proposes distributing 5,000 V-tokens to G-token holders (357 V per citizen) from March surplus.',
      status: 'open',
      deadline: '15 Apr 2026',
      options: [
        { id: 'approve', label: 'Approve', votes: 6 },
        { id: 'reject',  label: 'Reject',  votes: 2 },
      ],
      yourVote: null,
      totalEligible: 14,
      totalVoted: 8,
    },
    {
      id: 'vote-003',
      type: 'recall',
      title: 'Recall Referendum — Automatic Trigger',
      description: 'The average MCC bill rose 22% above the 12-month rolling average in March 2026, triggering an automatic recall referendum.',
      status: 'closed',
      deadline: '1 Apr 2026',
      options: [
        { id: 'recall',    label: 'Recall the board',  votes: 3 },
        { id: 'no-recall', label: 'Retain the board',  votes: 10 },
      ],
      yourVote: 'no-recall',
      totalEligible: 14,
      totalVoted: 13,
    },
  ],
  'daves-colony': [],
}

// Citizen profile per colony
export const MOCK_PROFILE = {
  'turing-campus': {
    gTokenId: 2,
    registeredDate: '10 Mar 2026',
    partner: null,
    offspring: [],
    inheritanceDesignation: null,
    vBatches: [
      { minted: 'Mar 2026', amount: 600,  expiresYear: 2126 },
      { minted: 'Feb 2026', amount: 600,  expiresYear: 2126 },
      { minted: 'Jan 2026', amount: 200,  expiresYear: 2126 },
    ],
  },
  'daves-colony': {
    gTokenId: 1,
    registeredDate: '1 Apr 2026',
    partner: null,
    offspring: [],
    inheritanceDesignation: null,
    vBatches: [
      { minted: 'Apr 2026', amount: 50, expiresYear: 2126 },
    ],
  },
}

// Intra-month contracts per company
export const MOCK_CONTRACTS = {
  'campus-coffee': [
    {
      id: 'c-001',
      type: 'forward',
      title: 'Milk delivery — April',
      counterpartyLabel: 'Hillside Dairy',
      counterparty: '0xMilk...Farm',
      amount: 80,
      settleDate: '15 Apr 2026',
      status: 'active',
      role: 'buyer',
      description: 'Pre-committed 80 S for weekly milk delivery. Tokens locked in escrow until delivery confirmed.',
    },
    {
      id: 'c-002',
      type: 'escrow',
      title: 'Espresso machine install',
      counterpartyLabel: 'Colony Tech',
      counterparty: '0xTech...Corp',
      amount: 500,
      settleDate: '20 Apr 2026',
      status: 'active',
      role: 'buyer',
      description: '500 S in escrow. Released to Colony Tech on successful installation and sign-off.',
    },
    {
      id: 'c-003',
      type: 'revenue-share',
      title: 'Revenue share — Turing Events',
      counterpartyLabel: 'Turing Events Co.',
      counterparty: '0xEvent...Co',
      pct: 15,
      settleDate: '30 Apr 2026',
      status: 'active',
      role: 'payer',
      revenueSharedMTD: 63,
      description: '15% of inbound S-token revenue routed to Turing Events. Covers venue partnership for April.',
    },
    {
      id: 'c-004',
      type: 'escrow',
      title: 'Freezer unit deposit',
      counterpartyLabel: 'Arctic Equipment',
      counterparty: '0xArct...Eq',
      amount: 200,
      settleDate: '31 Mar 2026',
      status: 'settled',
      role: 'buyer',
      description: '200 S escrow released on delivery. Settled successfully.',
    },
  ],
  'campus-print': [],
  'daves-coffee': [],
}

// Guardian / child wallets per colony
export const MOCK_CHILDREN = {
  'turing-campus': [
    {
      id: 'child-001',
      name: 'Alex (minor)',
      dateOfBirth: '2012-06-15',   // age 13
      registeredDate: '10 Mar 2026',
      sBalance: 820,
      vBalance: 3600,
      vSavedThisMonth: 120,
      vMaxMonthly: 200,
      ubiAmount: 1000,
      mccBill: { total: 57, breakdown: [{ service: 'Coffee & snacks', amount: 45 }, { service: 'Printing', amount: 12 }] },
      transactions: [
        { label: 'MCC bill',        amount: -57,   date: '1 Apr 2026'  },
        { label: 'Saved to V',      amount: -120,  date: '3 Apr 2026'  },
        { label: 'UBI allocation',  amount: +1000, date: '1 Apr 2026'  },
      ],
    },
  ],
  'daves-colony': [],
}

// MCC admin data for daves-colony
export const MOCK_ADMIN_DATA = {
  'daves-colony': {
    totalRevenueMTD: 45,
    recallThreshold: 114,   // 20% above 12-month avg bill of 95 S
    avgBill12m: 95,
    currentAvgBill: 15,
    citizens: [
      { wallet: '0xf39F...2266', gTokenId: 1, registered: '1 Apr 2026',  sBalance: 950  },
      { wallet: '0xABCD...1234', gTokenId: 2, registered: '1 Apr 2026',  sBalance: 820  },
      { wallet: '0x5678...EFGH', gTokenId: 3, registered: '3 Apr 2026',  sBalance: 1000 },
    ],
  },
}
