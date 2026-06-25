# AXION Brand Handoff

For Claude Code.

## Contents

```
axion-brand-handoff/
├── AXION_BRAND_SPEC.md      ← read this first; comprehensive spec
├── README.md                ← this file
└── public/
    └── brand/
        ├── axion-wordmark-dark.png    ← black AXION, transparent
        ├── axion-wordmark-light.png   ← white AXION, transparent
        ├── mond-wordmark-dark.png     ← black MOND, transparent
        └── mond-wordmark-light.png    ← white MOND, transparent
```

## How to use

1. Read `AXION_BRAND_SPEC.md` end-to-end before changing anything.
1. Copy the `public/brand/` directory into the existing project at `C:\Users\user\OneDrive\Documents\Crypto\spice-dashboard\public\brand\`.
1. Follow the phased implementation plan in Section 8 of the spec. Do not skip phases.
1. After each phase, verify the site still builds and renders. Stop and check before moving on.

## Constraints (Section 9 of spec)

Inline styles only. No CSS files. No Tailwind. No new dependencies without checking with Steve. The aesthetic register is Apple/SpaceX — institutional, not retail-crypto.