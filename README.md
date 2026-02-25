# Clawnify Kanban App: The Open-Source Trello Alternative for SaaS

A lightweight kanban board for building project management tools, task trackers, and workflow apps. Part of the [OpenClaw](https://github.com/openclaw/openclaw) ecosystem. Zero cloud dependencies — runs locally with SQLite.

Built with **Preact + Hono + SQLite**. Ships with a dual-mode UI: one for humans (drag-and-drop cards, hover menus) and one for AI agents (explicit buttons, large targets).

## What Is It?

Clawnify Kanban App is a production-ready kanban board designed for the OpenClaw community. Think of it as an open-source Trello alternative — a project board you can self-host, customize, and embed in any SaaS product.

Unlike Trello, Asana, or Monday.com, this runs entirely on your own infrastructure with no API keys, no vendor lock-in, and no per-seat pricing. It provides a complete task management and workflow system. Create lists, add cards, drag between columns, and manage projects — all out of the box.

## Features

- **Multiple lists** — create, rename, reorder, and delete columns
- **Drag-and-drop** — move cards between lists with native HTML5 drag
- **Card management** — create, edit, and delete cards with title and description
- **Hover menus** — ellipsis menu on cards for quick actions (human mode)
- **Agent mode** — "Move to" dropdowns, always-visible forms, explicit buttons
- **Colored headers** — 8 rotating colors for visual distinction between lists
- **SQLite persistence** — auto-creates schema and seeds a default board on first run
- **Dual-mode UI** — human-optimized + AI-agent-optimized (`?agent=true`)

## Quickstart

```bash
git clone https://github.com/clawnify/kanban-app.git
cd kanban-app
pnpm install
pnpm run dev
```

Open `http://localhost:5173` in your browser. Data persists in `data.db`.

### Agent Mode (for OpenClaw / Browser-Use)

Append `?agent=true` to the URL:

```
http://localhost:5173/?agent=true
```

This activates an agent-friendly UI with:
- "Move to [list]" dropdowns instead of drag-and-drop
- Always-visible add card forms with labeled inputs
- Explicit "Rename" buttons on list headers
- Larger click targets for reliable browser automation

The human UI stays unchanged — drag-and-drop, hover menus, and inline editing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Preact, TypeScript, Vite |
| **Backend** | Hono, Node.js |
| **Database** | SQLite (better-sqlite3) |
| **Icons** | Lucide |

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)

## Architecture

```
src/
  server/
    schema.sql  — SQLite schema (lists, cards with positions)
    db.ts       — SQLite wrapper + seed logic
    index.ts    — Hono REST API (lists, cards, move, reorder)
  client/
    app.tsx               — Root component + agent mode detection
    context.tsx           — Preact context for board state
    hooks/use-board.ts    — Board data fetching + mutations
    hooks/use-drag.ts     — HTML5 drag-and-drop logic
    components/
      toolbar.tsx           — Add List button + form
      board.tsx             — Horizontal list container
      list.tsx              — List wrapper (column)
      list-header.tsx       — Title, count, rename, delete
      card-list.tsx         — Drop target, card mapping
      card.tsx              — Card with edit mode
      card-menu.tsx         — Ellipsis menu (human mode)
      card-agent-actions.tsx — Move/Edit/Delete (agent mode)
      list-footer.tsx       — Add Card form
```

### Data Model

Two entities with a parent-child relationship:

```
┌──────────────┐       ┌──────────────┐
│    lists     │       │    cards     │
├──────────────┤       ├──────────────┤
│ id           │◄──┐   │ id           │
│ title        │   │   │ list_id ─────┼───┘
│ position     │   │   │ title        │
│ created_at   │   │   │ description  │
└──────────────┘   │   │ position     │
                   │   │ created_at   │
                   │   │ updated_at   │
                   │   └──────────────┘
                   │
                ON DELETE CASCADE
```

```sql
lists (id, title, position, created_at)
cards (id, list_id → lists, title, description, position, created_at, updated_at)
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/board` | Full board (lists with nested cards) |
| POST | `/api/lists` | Create a list |
| PUT | `/api/lists/:id` | Update list title |
| DELETE | `/api/lists/:id` | Delete list + all cards |
| POST | `/api/cards` | Create a card in a list |
| PUT | `/api/cards/:id` | Update card title/description |
| DELETE | `/api/cards/:id` | Delete a card |
| POST | `/api/cards/:id/move` | Move card to another list |

## How Clawnify Uses This

[Clawnify](https://clawnify.com) uses this template as a starting point when AI agents request a kanban or project management app via the App Builder. The `db.ts` file is swapped with a Cloudflare D1 adapter, the code is bundled, and deployed to Workers for Platforms. The rest of the app stays identical.

## Community & Contributions

This project is part of the [OpenClaw](https://github.com/openclaw/openclaw) ecosystem. Contributions are welcome — open an issue or submit a PR.

## License

MIT
