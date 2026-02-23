# Kanban Board

A single-page Kanban board app built with Hono + Cloudflare Workers + D1.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a D1 database:

```bash
npx wrangler d1 create kanban-app-db
```

3. Copy the `database_id` from the output and update `wrangler.toml`.

4. Apply the schema locally:

```bash
npx wrangler d1 execute kanban-app-db --local --file=src/schema.sql
```

5. Run the dev server:

```bash
pnpm dev
```

Open `http://localhost:8787` in your browser.

## Deploy

Apply the schema to the remote database first:

```bash
npx wrangler d1 execute kanban-app-db --remote --file=src/schema.sql
```

Then deploy the worker:

```bash
pnpm deploy
```

## Features

- Create, rename, and delete lists
- Create, edit, and delete cards
- Move cards between lists with Left/Right buttons
- HTML5 drag-and-drop support
- Inline editing (no popups or dialogs)
- Fully accessible with aria-labels and semantic HTML
