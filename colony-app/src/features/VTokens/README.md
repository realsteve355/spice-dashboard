# features/VTokens

V-token UI module. **Only the Mars variant imports from this directory.**
Earth has no V-tokens — savings on Earth happen outside the colony.

## What lives here (Phase B will populate)

- `VBalanceCard.jsx` — Dashboard V balance tile
- `ConvertSToV.jsx` — convert MOND → V button + sheet (citizen + company)
- `VDividendButton.jsx` — declare V dividend (company secretary action)
- `VHistory.jsx` — V-related transaction rows (save / redeem / dividend in)
- `useVBalance.js` — reads V balance from on-chain V-token contract
- `GuardianVPool.jsx` — inherited V pool for minors (Guardian.jsx today)

## Rule

If a feature module is not imported in `variants/{name}/`, it does not
ship in that variant's bundle. The Earth variant pages should have zero
references to `features/VTokens/`.
