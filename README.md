# Kanban Board

A single-page Kanban board built with Preact + Vite (frontend) and Hono + SQLite (API). Runs locally with zero cloud dependencies — just Node.js.

## Quick Start

```bash
npm install
npm run dev
```

Opens Vite at `http://localhost:5173` with HMR. API runs on port 3001 (proxied automatically).

## Production

```bash
npm run build
npm start
```

Serves the built app + API on `http://localhost:3001`.

## Browser-Use Mode

For OpenClaw agents using browser control, append `?agent=true`:

```
http://localhost:5173/?agent=true
```

This activates an agent-friendly UI with:
- "Move to [list]" dropdowns instead of drag-and-drop
- Always-visible add card forms with labeled inputs
- Explicit "Rename" buttons on list headers
- Larger click targets for reliable interaction

The human UI stays unchanged — drag-and-drop, hover menus, inline editing.

## Features

- Create, rename, and delete lists
- Create, edit, and delete cards
- Move cards between lists (drag-and-drop in human mode, select dropdown in agent mode)
- Hover-to-reveal ellipsis menu on cards (human mode)
- Lucide icons throughout
- SQLite persistence (auto-creates schema on first run)
- Dual-mode UI: human-optimized + browser-use-optimized

## File Structure

```
src/
  client/                 # Preact SPA (Vite)
    main.tsx              — Entry point
    app.tsx               — Root component (mode detection, context provider)
    api.ts                — Fetch wrapper
    types.ts              — Card, List, BoardData types
    context.tsx           — BoardContext (state + mutations)
    styles.css            — All styles
    hooks/
      use-board.ts        — Board data fetching + mutations
      use-drag.ts         — HTML5 drag-and-drop
    components/
      toolbar.tsx         — Add List button + form
      board.tsx           — List container
      list.tsx            — List wrapper
      list-header.tsx     — Title, count, rename, delete
      card-list.tsx       — Drop target, card mapping
      card.tsx            — Card with edit mode
      card-menu.tsx       — Ellipsis menu (human mode)
      card-agent-actions.tsx — Move/Edit/Delete (agent mode)
      list-footer.tsx     — Add Card form
      confirm-bar.tsx     — Delete confirmation
      error-banner.tsx    — Error toast
  server/
    index.ts              — Hono API routes + Node.js server
    db.ts                 — SQLite wrapper (better-sqlite3)
    schema.sql            — Database schema
```

## How Clawnify Uses This

Clawnify's app builder uses this template as a starting point when users request a kanban app. The `db.ts` file is swapped with a D1 adapter, the Vite build output is uploaded as static assets, and the API routes are deployed to Workers for Platforms. The rest of the app stays identical.
