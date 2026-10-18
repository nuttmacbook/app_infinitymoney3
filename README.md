# Infinity Money

```
infinity-money/
├── src/          the app (production)
└── dev/          never in the production build
    ├── chain/      test chain (npm run dev) and real-chain deploy (npm run deploy:live)
    ├── compiler/   solc build and the app's ABI export
    ├── contracts/  .sol sources and compiled output
    ├── test/       tests for this project
    └── web/        test panel the app loads in dev only
```

## Production

```bash
npm install
npm run build
```

`.env` is git-ignored: copy `.env.example` to `.env` on each machine, and on Vercel set the same variables under
Project → Settings → Environment Variables.
- `VITE_PROJECT_ID` is a **test** Reown project id. Replace it with your own before deploying.
- `VITE_CHAIN` picks the network (empty = bsc).
- `VITE_SITE_URL` is the live site address (no trailing slash), used by link previews.

Contract addresses are not in `.env`. `npm run deploy:live -- --send` in `dev/` writes every deployed contract to
`src/web3/contracts/addresses.json` (network → contract name → address), and the app reads them with `addressOf(name)`.
Commit that file after a deploy, then build.

Logo, favicon and the share image live in `public/` (`logo.svg`, `og-image.png`, ...).

The build never includes `dev/`. A production-only copy can leave `dev/` out entirely.

## Development

Everything for development lives in `dev/` with its own `package.json`, so the root install stays production-only.

```bash
npm install            # root, once
cd dev
npm install
npm run compile        # build the contracts and refresh the app's ABI files
npm run compile:watch  # same, again on every save (use instead of Remix)
npm run dev            # test chain + deploy + sample data + the app with the test panel
npm test               # contract checks on a throwaway chain
npm run deploy:live    # real-chain checks and cost; add -- --send to deploy
                       # upgrades: npm run deploy:live -- --upgrade Spot3Logic [--send]
```

See `dev/README.md`.
