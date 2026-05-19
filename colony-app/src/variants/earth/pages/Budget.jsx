// variants/earth/pages/Budget.jsx
// Earth Budget — Mars line list minus the V-savings line. Earth colonies
// don't run V-tokens; long-term savings happen outside the colony (bank,
// broker, external wallet).
import Budget from '../../../pages/Budget'

const EARTH_DEFAULT_LINES = [
  // MCC — auto-deducted
  { id: 'elec',     category: 'MCC',           name: 'Electricity',           description: 'Grid power supply and maintenance',        sTokenAmount: 90,  dollarRef: 120, spiceDiscount: 25, autoDeducted: true,  isOptional: false, active: true },
  { id: 'water',    category: 'MCC',           name: 'Water & Sewage',        description: 'Mains water and waste water processing',   sTokenAmount: 50,  dollarRef: 65,  spiceDiscount: 20, autoDeducted: true,  isOptional: false, active: true },
  { id: 'waste',    category: 'MCC',           name: 'Waste & Recycling',     description: 'Kerbside collection and processing',       sTokenAmount: 25,  dollarRef: 30,  spiceDiscount: 15, autoDeducted: true,  isOptional: false, active: true },
  { id: 'broad',    category: 'MCC',           name: 'Broadband',             description: 'Colony fibre network access',              sTokenAmount: 45,  dollarRef: 60,  spiceDiscount: 20, autoDeducted: true,  isOptional: false, active: true },
  { id: 'ems',      category: 'MCC',           name: 'Roads / Fire / EMS',    description: 'Emergency services and road maintenance',  sTokenAmount: 40,  dollarRef: 55,  spiceDiscount: 30, autoDeducted: true,  isOptional: false, active: true },
  { id: 'housing',  category: 'MCC',           name: 'Colony Housing',        description: 'MCC-provided accommodation (if applicable)', sTokenAmount: 100, dollarRef: 750, spiceDiscount: 87, autoDeducted: true,  isOptional: true,  active: true },
  // Essential
  { id: 'grocery',  category: 'Essential',     name: 'Groceries & Household', description: 'Food, household supplies, pharmacy basics', sTokenAmount: 280, dollarRef: 420, spiceDiscount: 30, autoDeducted: false, isOptional: false, active: true },
  { id: 'care',     category: 'Essential',     name: 'Personal Care',         description: 'Hair, toiletries, personal basics',        sTokenAmount: 60,  dollarRef: 75,  spiceDiscount: 15, autoDeducted: false, isOptional: false, active: true },
  { id: 'health',   category: 'Essential',     name: 'Healthcare Co-pay',     description: 'Supplementary healthcare above MCC cover', sTokenAmount: 90,  dollarRef: 120, spiceDiscount: 20, autoDeducted: false, isOptional: false, active: true },
  { id: 'transport',category: 'Essential',     name: 'Local Transport',       description: 'Bus, bike share, local journeys',          sTokenAmount: 40,  dollarRef: 65,  spiceDiscount: 35, autoDeducted: false, isOptional: false, active: true },
  { id: 'edu',      category: 'Essential',     name: 'Education / Childcare', description: 'Shared facilities; staff on UBI baseline', sTokenAmount: 65,  dollarRef: 90,  spiceDiscount: 25, autoDeducted: false, isOptional: true,  active: true },
  // Discretionary
  { id: 'dining',   category: 'Discretionary', name: 'Local Dining & Cafes',  description: 'Restaurants, cafes, takeaway',             sTokenAmount: 100, dollarRef: 160, spiceDiscount: 35, autoDeducted: false, isOptional: false, active: true },
  { id: 'entertain',category: 'Discretionary', name: 'Entertainment & Social',description: 'Cinema, events, sports, clubs',            sTokenAmount: 60,  dollarRef: 80,  spiceDiscount: 20, autoDeducted: false, isOptional: false, active: true },
  { id: 'nones',    category: 'Discretionary', name: 'Non-essential Goods',   description: 'Clothing, gifts, hobbies',                 sTokenAmount: 80,  dollarRef: 100, spiceDiscount: 10, autoDeducted: false, isOptional: false, active: true },
  // (No savings line on Earth — savings happen outside the colony.)
]

export default function EarthBudget() {
  return <Budget defaultLines={EARTH_DEFAULT_LINES} />
}
