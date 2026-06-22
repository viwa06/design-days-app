# Design Days – SMDD Digital Chemistry

Interactive dashboard for tracking Design Day synthesis route proposals, outcomes, and portfolio analytics.

## Quick start

```bash
npm install
npm run dev
```
Open http://localhost:5173

## Build for production

```bash
npm run build
# Output is in /dist — upload to any static host
```

## Hosting options

### 1. GitHub Pages (recommended for quick sharing)
1. Push this repo to GitHub
2. Go to Settings → Pages → Source: GitHub Actions
3. The included `.github/workflows/deploy.yml` auto-deploys on every push to `main`
4. Your URL: `https://<your-org>.github.io/<repo-name>/`

### 2. Azure Static Web Apps
```bash
npm run build
# In Azure Portal: create Static Web App → point to /dist
```

### 3. SharePoint (SPFx)
For production SharePoint embedding, wrap as an SPFx web part:
```bash
yo @microsoft/sharepoint
# Copy App.jsx into the web part component
gulp bundle --ship && gulp package-solution
# Upload .sppkg to App Catalog
```

## Connecting to real SharePoint data

Replace the `SEED` array in `src/App.jsx` with SharePoint REST API calls:

```javascript
// Example: fetch molecules list
const res = await fetch(
  "https://yourcompany.sharepoint.com/sites/SMDD/_api/web/lists/getbytitle('Molecules')/items",
  { headers: { Accept: "application/json;odata=verbose" } }
);
const data = await res.json();
```

## AI extraction (Phase 2)

The "Upload PPT" button already calls the Anthropic API. For production:
1. Set `VITE_ANTHROPIC_API_KEY` in your environment / Azure Key Vault
2. Update the fetch header: `"x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY`

## Stack
- React 18 + Vite
- Recharts (charts)
- Anthropic Claude API (PPT extraction)
- No other dependencies
