# Travel Expense Dashboard

A personal travel-expense dashboard built with React and TypeScript. It has two pages that share one dataset:

- **Dashboard Overview** (`/`): spending by trip, year and category, a travel timeline per trip, and an expense explorer.
- **Data Sources** (`/data-sources`): the itemised expense rows with their verification evidence, plus a review inbox for Wise card statements.

Everything on the dashboard is calculated from the rows on the Data Sources page, so a change to the data shows up on both pages.

## Features

- Filter trips by year, sort them, and fuzzy-search across destinations and expenses.
- KPI cards, a stacked-by-category trip chart, yearly spending, and a category breakdown.
- Per-trip chronological timeline with journey-type tags and country flags.
- Expense explorer with grouped and itemised views, sorting, journey filter and pagination.
- Source register with search, trip and verification filters, and evidence for every row.
- **Wise statement import:** upload one or more Wise `.xlsx` account statements and review each card transaction in the inbox.
  - Pending rows count on the dashboard as soon as they are matched to a trip.
  - **Include in data source** moves a row into the data source table, with a status description you write.
  - **Remove** drops it from the inbox and the dashboard. Removed rows can be restored.
  - Uploads and decisions are stored in your browser's local storage; nothing is sent to a server.

## Getting started

Requires a current Node.js LTS release.

```bash
npm install
npm run dev:demo   # fictional demo data
```

Then open the URL that Vite prints (http://localhost:5173 by default).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server using your private data if `private-data/` exists, otherwise the demo data |
| `npm run dev:demo` | Dev server forced to the demo data |
| `npm run build` | Typecheck and production build (private data if present) |
| `npm run build:demo` | Production build with demo data only; use this for anything you publish |
| `npm run preview` | Serve the last build locally |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (always run against the demo data) |

## Data: private vs demo

The code and the data are kept apart so the code can be shared safely.

- `src/common/data/demo/` contains a small **fictional** dataset. It is committed and is what you see by default in a fresh clone.
- `private-data/` is for your **real** data. It is git-ignored and must never be committed.

The `@data` import alias resolves to `private-data/` when `private-data/expenseRecords.json` exists, and to `demo/` otherwise. `DATA_MODE=demo` and the test runner force the demo data. The choice is logged when Vite starts (`[data] using DEMO` or `PRIVATE`).

To use your own data, create `private-data/` with the same five files as the demo folder:

| File | Contents |
|---|---|
| `expenseRecords.json` | The Data Source rows: trip, date, category, description, SGD amount, status, evidence sources |
| `trips.json` | Trip list: id, year, name, local flag, country codes for the flags |
| `wiseTransactions.json` | Raw Wise statement rows shown in the Wise source register |
| `merchantIcons.json` | Optional emoji per expense description for the timeline |
| `notes.json` | Commentary text shown on the dashboard |

See the demo files for the exact shape, and the types in `src/common/types/`.

> **Publishing:** a normal `npm run build` bundles whatever data is in `private-data/` into the output. Only host the output of `npm run build:demo`.

## Deploying the demo to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds the **demo data only** and publishes it to GitHub Pages on every push to `main`. It runs the tests, builds with `npm run build:demo`, and copies `index.html` to `404.html` so links such as `/data-sources` still work after a refresh.

One-time setup:

1. Create a GitHub repository and push this project. Check `git status` first and make sure `private-data/` and the original HTML export are not staged.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The site appears at `https://<your-username>.github.io/<repository-name>/`.

The workflow sets `BASE_PATH` to `/<repository-name>/` automatically. To test that path locally:

```bash
BASE_PATH=/<repository-name>/ npm run build:demo
BASE_PATH=/<repository-name>/ npm run preview
```

If you later use a custom domain at the root, drop the `BASE_PATH` environment variable from the workflow.

## Project structure

```
src/
  common/                 shared by both pages
    components/           AppLayout, PageSwitcher, Pagination, EmptyState
    context/              ExpenseDataProvider: the single store both pages read
    data/                 data loading and the demo dataset
    hooks/  types/  utils/
    styles/               global styles
  pages/
    dashboard/            Dashboard Overview
      components/         one folder per component (tsx + css + index.ts)
      hooks/  utils/  assets/
    data-sources/         Data Sources
      components/         one folder per component
      hooks/  utils/  data/
```

How the data flows: `ExpenseDataProvider` holds the data source rows plus the Wise import state. It derives the trips the dashboard shows from those rows and from the pending review-inbox items, so both pages always agree.

## Tech stack

- React 19, TypeScript, React Router
- Vite for the dev server and builds
- Vitest for tests
- `read-excel-file` to read Wise `.xlsx` statements (loaded only when you upload)

## Privacy

Real expense data, booking references, names and Wise account details must stay out of the repository. `private-data/`, `*.xlsx`, `statement_*` and the original standalone HTML export are listed in `.gitignore`. If you fork this project, keep it that way.
