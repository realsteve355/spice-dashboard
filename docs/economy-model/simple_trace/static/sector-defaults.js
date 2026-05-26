// Shared sector defaults — loaded by both /sectors and /aggregate pages.
//
// Per-sector parameters: P1 (imaginable, 2026-2036) and P2 (unimaginable, 2036-2046)
// deflation rates + displacement ceilings, plus 2026 MF employment.
//
// Total jobs sum to 18,000 (30,000 adults × ~60% labour force participation).
// basket_category maps each sector to a basket_model.py category, where applicable;
// non-consumer sectors (legal, financial, wholesale, government, self-employed)
// have basket_category = null and don't contribute to basket cost.

window.SECTOR_DEFAULTS = [
  { id: 'software',          label: 'Software / digital',         p1_defl: 15,  p1_ceil: 70, p2_defl: 25, p2_ceil: 92, floor:  3, jobs:  250,
    basket_category: 'digital_electronics',
    note: 'LLMs eat coding, design, content, analysis. P2: software writes software, marginal cost ≈ 0.' },
  { id: 'legal',             label: 'Legal / professional',       p1_defl:  7,  p1_ceil: 60, p2_defl: 15, p2_ceil: 85, floor: 10, jobs:  700,
    basket_category: null,
    note: 'Includes accounting, consulting. Contract review, research, drafting → automated. P2: AI judges, autonomous compliance.' },
  { id: 'financial',         label: 'Financial / insurance',      p1_defl:  5,  p1_ceil: 50, p2_defl: 10, p2_ceil: 75, floor: 20, jobs: 1050,
    basket_category: null,
    note: 'Banking + insurance + real estate brokerage. Branch closures, robo-advisors, automated underwriting.' },
  { id: 'big_retail',        label: 'Big retail (incl. pass-through)', p1_defl: 3.5, p1_ceil: 50, p2_defl: 7, p2_ceil: 75, floor: 40, jobs: 1800,
    basket_category: 'apparel_manufactured',
    note: 'Walmart/Kroger/Target/CVS/Walgreens. Slow own value-add + fast upstream products. P2: lights-out warehouses.' },
  { id: 'wholesale',         label: 'Wholesale / distribution',   p1_defl:  3,  p1_ceil: 30, p2_defl: 8,  p2_ceil: 60, floor: 35, jobs:  400,
    basket_category: null,
    note: 'Warehouses, trucking dispatch, distribution centres. Already heavily robotic. P2: lights-out fulfilment.' },
  { id: 'manufacturing',     label: 'Manufacturing (auto + trad.)', p1_defl: 3, p1_ceil: 30, p2_defl: 5, p2_ceil: 55, floor: 25, jobs: 2200,
    basket_category: 'apparel_manufactured',
    note: 'Honda factory + suppliers. Already heavily industrial-automated. P2: lights-out factories + finish work.' },
  { id: 'energy',            label: 'Energy / utilities',         p1_defl:  6,  p1_ceil: 40, p2_defl: 8,  p2_ceil: 65, floor: 10, jobs:  250,
    basket_category: 'energy_utilities',
    note: 'Smart grids, automated generation, predictive maintenance. P2: line-worker robots, distributed renewables.' },
  { id: 'transport',         label: 'Transport / logistics',      p1_defl:  4,  p1_ceil: 40, p2_defl: 10, p2_ceil: 80, floor: 20, jobs:  800,
    basket_category: 'transport',
    note: 'Robotaxis rolling out. P1: AV trucking matures. P2: drone delivery, near-zero driver demand.' },
  { id: 'construction',      label: 'Construction',               p1_defl:  2,  p1_ceil: 25, p2_defl: 6,  p2_ceil: 60, floor: 30, jobs:  900,
    basket_category: 'housing_structure',
    note: 'Trades + contractors. 3D-printed homes, modular. P2: robotic site workers.' },
  { id: 'food_processed',    label: 'Food (processed)',           p1_defl:  2,  p1_ceil: 35, p2_defl: 5,  p2_ceil: 60, floor: 30, jobs:  250,
    basket_category: 'food_processed',
    note: 'Vertical farms, lab-grown meat at scale. P2: fully automated from raw inputs to packaged.' },
  { id: 'food_fresh',        label: 'Food (fresh) / agriculture', p1_defl:  0,  p1_ceil: 20, p2_defl: 2,  p2_ceil: 40, floor: 50, jobs:  200,
    basket_category: 'food_fresh',
    note: 'Local farmers, ag workers. Land-bound. P2: robotic picking at scale, autonomous greenhouses.' },
  { id: 'education',         label: 'Education',                  p1_defl:  3,  p1_ceil: 30, p2_defl: 6,  p2_ceil: 50, floor: 25, jobs: 1200,
    basket_category: 'education',
    note: 'K-12 + community college. AI tutors deflate content delivery hard. P2: AI mentors, automated accreditation.' },
  { id: 'healthcare',        label: 'Healthcare (provider)',      p1_defl:  1,  p1_ceil: 25, p2_defl: 8,  p2_ceil: 60, floor: 30, jobs: 1800,
    basket_category: 'healthcare',
    note: 'Regional hospital + doctor offices + clinics. P1: diagnostic AI assists. P2: robotic surgeons, autonomous nursing.' },
  { id: 'hospitality',       label: 'Hospitality / restaurants',  p1_defl: -1,  p1_ceil: 15, p2_defl: 2,  p2_ceil: 40, floor: 50, jobs: 1100,
    basket_category: 'hospitality',
    note: 'Kitchen back-of-house automates. P2: full kitchen robotics, robotic baristas, AI hosts.' },
  { id: 'personal_services', label: 'Personal services',          p1_defl:  0,  p1_ceil: 10, p2_defl: 2,  p2_ceil: 30, floor: 50, jobs:  500,
    basket_category: null,
    note: 'Hair, repair, beauty. Near-zero P1. P2: home robots for cleaning, basic care, simple repair.' },
  { id: 'care_work',         label: 'Care work',                  p1_defl:  0,  p1_ceil: 10, p2_defl: 3,  p2_ceil: 50, floor: 40, jobs:  700,
    basket_category: null,
    note: 'Childcare, eldercare, home health aides. AI assistance in P1. P2: humanoid carers.' },
  { id: 'government',        label: 'Government / public sector', p1_defl:  1,  p1_ceil: 25, p2_defl: 3,  p2_ceil: 70, floor: 40, jobs: 2200,
    basket_category: null,
    note: 'City + state + federal. AXION itself replaces welfare/tax/banking admin → P2 ceiling raised to 70% reflecting AXION-driven displacement on top of automation.' },
  { id: 'self_employed',     label: 'Self-employed / small biz',  p1_defl:  2,  p1_ceil: 20, p2_defl: 5,  p2_ceil: 50, floor: 30, jobs: 1700,
    basket_category: null,
    note: 'Gig workers, freelancers, sole proprietors. Mixed exposure — writers/designers/coders vulnerable.' },
];

// Basket category weights (% of monthly basket spend). From basket_model.py.
// Used by the /aggregate page to compute weighted basket cost over time.
window.BASKET_WEIGHTS = {
  food_processed:      22.5,
  food_fresh:           7.5,
  energy_utilities:    10.0,
  transport:           10.0,
  healthcare:           6.25,
  education:            3.75,
  hospitality:          7.5,
  apparel_manufactured: 8.75,
  digital_electronics:  5.0,
  housing_structure:   18.75,
};

// Constants shared across pages
window.SECTORS_META = {
  YEAR_START: 2026,
  PHASE_BOUNDARY: 2036,
  YEAR_END: 2046,
  BASKET_2026_USD: 980,  // monthly basket cost per adult, USD
  MF_POPULATION: 39000,
  MF_ADULTS:     30000,
  MF_WORKFORCE:  18000,  // = sum of sector.jobs in defaults
};
