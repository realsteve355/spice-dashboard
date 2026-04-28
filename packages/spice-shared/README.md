# spice-shared

Shared code between `colony-app` (web) and `colony-app-native` (mobile).

## Import pattern

No npm workspaces, no build step. Both apps import via relative paths.

```js
// colony-app/src/somewhere.jsx
import { CONTRACTS } from '../../packages/spice-shared/addresses.js'

// colony-app-native/src/somewhere.js
import { CONTRACTS } from '../../packages/spice-shared/addresses.js'
```

Vite, Metro (Expo's bundler), Hardhat, and plain Node all resolve these correctly.

## What's in here

| File | What |
|---|---|
| `addresses.js` | Per-colony contract addresses on Base Sepolia (currently Dave's Colony) + chain/RPC constants |
| `constants.js` | Economic constants from the spec — UBI amount, V cap, Harberger bps, role equity bps, recall threshold, bread anchor |
| `addrLabel.js` | Address-display helpers (`shortAddr`, `namedAddr`) — re-exported from colony-app for now |
| `budgetMath.js` | Fisc-rate / UBI / consistency-flag math — re-exported from colony-app for now |

## Migration plan

The two re-export files (`addrLabel.js`, `budgetMath.js`) currently point back into colony-app's `src/utils/`. The intent is to eventually move the canonical source here so colony-app imports the same way native does. This is a no-op for downstream code: as long as both apps read via `packages/spice-shared/...` the actual location of the source is an internal detail.

## Why this and not workspaces

- Workspaces add Metro / Vite / Vercel `ignoreCommand` complexity for marginal benefit
- Three sibling Vercel projects (`zpc.finance`, `app.zpc.finance`, `spice.zpc.finance`) each with their own `ignoreCommand` would all need updating
- Hardhat doesn't care about workspaces; relative paths Just Work
- The "ugly relative import" is the cost; the win is zero infrastructure surface

## When to add what

- New cross-app constant → `constants.js`
- New colony deployed → add to `CONTRACTS` in `addresses.js`
- New pure utility used by both apps → new file here, both apps import it
- UI components → never (React vs React Native are different toolchains)
