# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A French-language financial-literacy simulation game ("Liberté Financière") built with React 18 + Vite, inspired by the Cashflow board game. It's a client-only PWA (no backend) with two independent, selectable game modes sharing common building blocks.

## Commands

```
npm install
npm run dev       # dev server (Vite, HMR)
npm run build     # production build to dist/ (base path /AI-LF-Game/, for GitHub Pages)
npm run preview   # preview a production build
```

There is no test suite, linter, or type checker configured in this repo (no jest/vitest, no eslint config). Verify changes by running `npm run dev` and exercising the UI manually. Deployment is automatic via `.github/workflows/deploy-pages.yml` on push to `main` (builds and publishes `dist/` to GitHub Pages).

## Architecture

### Two game modes, one entry point

`src/main.jsx` → `src/App.jsx` picks between two fully independent modes based on user selection at `HomeScreen`:
- **Classic mode** (`src/ClassicApp.jsx` + `src/state/useGameState.js`): a turn-based board game closely modeled on the original Cashflow — players move around a "Rat Race" board (`src/engine/ratRace.js`), then graduate to a "Fast Track" board (`src/engine/fastTrack.js`).
- **CapitalLife mode** (`src/modes/capitallife/`): a day-by-day life simulation (skip a day or a whole month at once) with career progression, an opportunity marketplace, and asset management with employees/maintenance. Fully self-contained under `src/modes/capitallife/` with its own `components/`, `engine/`, `state/`, `data/`, and `styles/` subfolders — treat it as a parallel universe to the top-level `src/` folders (`src/engine`, `src/components`, `src/data` etc. belong to Classic mode only, except where explicitly imported by CapitalLife, e.g. `src/engine/financing.js`, `src/engine/bourse/market.js`, `src/data/marketCards.js`, `src/components/ledger/DebtsScreen.jsx`, `src/components/modals/DecisionModal.jsx`).

Both modes share: the bourse/stock trading engine (`src/engine/bourse/`), casino blackjack (`src/engine/casino/blackjack.js`), financing math (`src/engine/financing.js`), currency/profession/deal data (`src/data/`), and formatting utils (`src/utils/format.js`).

### State management pattern

Each mode has one large hook holding *all* game state as individual `useState` fields (not reducers/context) and exposing every piece of state plus every mutator as a giant returned object:
- `src/state/useGameState.js` (~850 lines) for Classic mode
- `src/modes/capitallife/state/useCapitalLifeState.js` (~700 lines) for CapitalLife mode

The top `ClassicApp.jsx` / `CapitalLifeApp.jsx` component destructures this entire object and acts as a manual router: it reads a `view` state field (e.g. `"menu"`, `"game"`, `"trading"`, `"assets"`, `"options"`...) and a `phase` field (e.g. `"ratrace"`, `"fasttrack"`, `"won"`, `"bankrupt"` for Classic) and returns the matching screen component via a chain of early `if (view === ...) return <Screen .../>` statements — there is no router library. When adding a new screen: add a `view` value, an `if` branch in the App component, and wire the screen's callbacks back to hook mutators.

Game state persists to `localStorage` via `src/state/storage.js` (Classic) / equivalent in CapitalLife, loaded on mount (`useEffect` + `storage.get("cashflow-save")`) and written on every relevant state change. When adding new state fields, remember to thread them through both the save (write) and load (restore) logic, including sensible defaults/migrations for old saves that won't have the field.

### CapitalLife's day simulation

`src/modes/capitallife/engine/dayLoop.js` exports `simulateDays(state, numDays, opts)`, a **pure function** (no React state access) that advances the entire game snapshot by N days — used identically for "next day" (`numDays=1`) and "skip month" (`numDays=~30`). It handles market ticks, daily random life events (`dailyEvents.js`), asset events (`assetEvents.js`), payday/expenses every 30 days, loan amortization, and forced liquidation on cash shortfall (oldest/lowest-equity assets sold first) before declaring bankruptcy. Follow this pure-function-over-snapshot pattern for any new day-advancing logic — don't reach into React state setters mid-loop.

### Financing/economy math

`src/engine/financing.js` is the shared financial model used by both modes: down payments, loan amortization (`amortizedPayment`), expense/passive-income calculation, and debt-ratio checks. It supports two financing philosophies via `financingMode`: `"simple"` (flat rate/duration) vs `"realistic"` (per-asset-type rate/down-payment/duration from `REALISTIC_FINANCING`). Loans are typically interest-only by default (balance doesn't shrink on its own) — see `startAmortization`/`amortizeAssets` for the opt-in principal paydown path.

### Bourse (stock market) engine

`src/engine/bourse/` generates a synthetic token/stock universe (`tokenGenerator.js`), simulates price movement with sector conditions and macro "arcs"/economic modifiers (`arcs.js`, `market.js`), and both modes tick it forward once per game-turn/day via `tickMarketDays`.

### Styling

No CSS framework — plain JS style objects (`src/styles/theme.js` for Classic, `src/modes/capitallife/styles/theme.js` for CapitalLife) plus a `CSS_EXTRA` string injected via a `<style>` tag for things (animations, media queries) that can't be expressed as inline styles. `COLORS` in theme.js is the shared palette; reuse it rather than hardcoding hex values.

### Language

All in-game UI text, data (professions, deals, cards), and code comments are in French. Keep new user-facing strings and comments in French for consistency.
