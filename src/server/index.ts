import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { query, get, run } from "./db";

const app = new Hono();

// GET /api/lists — all lists with their cards
app.get("/api/lists", (c) => {
  try {
    const lists = query<{
      id: number;
      title: string;
      position: number;
      created_at: string;
    }>("SELECT id, title, position, created_at FROM lists ORDER BY position ASC");

    const cards = query<{
      id: number;
      list_id: number;
      title: string;
      description: string;
      position: number;
    }>(
      "SELECT id, list_id, title, description, position, created_at, updated_at FROM cards ORDER BY position ASC"
    );

    const cardsByList = new Map<number, typeof cards>();
    for (const card of cards) {
      if (!cardsByList.has(card.list_id)) {
        cardsByList.set(card.list_id, []);
      }
      cardsByList.get(card.list_id)!.push(card);
    }

    const result = lists.map((list) => ({
      ...list,
      cards: cardsByList.get(list.id) || [],
    }));

    return c.json({ lists: result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// POST /api/lists — create a list
app.post("/api/lists", async (c) => {
  try {
    const body = await c.req.json<{ title: string }>();
    if (!body.title || !body.title.trim()) {
      return c.json({ error: "Title is required" }, 400);
    }

    const maxPos = get<{ max_pos: number }>(
      "SELECT COALESCE(MAX(position), -1) as max_pos FROM lists"
    );
    const nextPos = (maxPos?.max_pos ?? -1) + 1;

    run("INSERT INTO lists (title, position) VALUES (?, ?)", body.title.trim(), nextPos);
    const inserted = get(
      "SELECT id, title, position, created_at FROM lists WHERE rowid = last_insert_rowid()"
    );

    return c.json(inserted, 201);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// PUT /api/lists/:id — rename a list
app.put("/api/lists/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const body = await c.req.json<{ title: string }>();
    if (!body.title || !body.title.trim()) {
      return c.json({ error: "Title is required" }, 400);
    }

    const result = run("UPDATE lists SET title = ? WHERE id = ?", body.title.trim(), id);
    if (result.changes === 0) {
      return c.json({ error: "List not found" }, 404);
    }

    const updated = get("SELECT id, title, position, created_at FROM lists WHERE id = ?", id);
    return c.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// DELETE /api/lists/:id — delete a list (FK cascade deletes cards)
app.delete("/api/lists/:id", (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const result = run("DELETE FROM lists WHERE id = ?", id);

    if (result.changes === 0) {
      return c.json({ error: "List not found" }, 404);
    }

    return c.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// POST /api/cards — create a card
app.post("/api/cards", async (c) => {
  try {
    const body = await c.req.json<{
      list_id: number;
      title: string;
      description?: string;
    }>();

    if (!body.title || !body.title.trim()) {
      return c.json({ error: "Title is required" }, 400);
    }
    if (!body.list_id) {
      return c.json({ error: "list_id is required" }, 400);
    }

    const list = get("SELECT id FROM lists WHERE id = ?", body.list_id);
    if (!list) {
      return c.json({ error: "List not found" }, 404);
    }

    const maxPos = get<{ max_pos: number }>(
      "SELECT COALESCE(MAX(position), -1) as max_pos FROM cards WHERE list_id = ?",
      body.list_id
    );
    const nextPos = (maxPos?.max_pos ?? -1) + 1;

    run(
      "INSERT INTO cards (list_id, title, description, position) VALUES (?, ?, ?, ?)",
      body.list_id,
      body.title.trim(),
      (body.description || "").trim(),
      nextPos
    );

    const inserted = get(
      "SELECT id, list_id, title, description, position, created_at, updated_at FROM cards WHERE rowid = last_insert_rowid()"
    );

    return c.json(inserted, 201);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// PUT /api/cards/:id — update a card
app.put("/api/cards/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const body = await c.req.json<{ title?: string; description?: string }>();

    const existing = get<{ id: number; title: string; description: string }>(
      "SELECT id, title, description FROM cards WHERE id = ?",
      id
    );
    if (!existing) {
      return c.json({ error: "Card not found" }, 404);
    }

    const newTitle = body.title !== undefined ? body.title.trim() : existing.title;
    const newDesc = body.description !== undefined ? body.description.trim() : existing.description;

    if (!newTitle) {
      return c.json({ error: "Title cannot be empty" }, 400);
    }

    run(
      "UPDATE cards SET title = ?, description = ?, updated_at = datetime('now') WHERE id = ?",
      newTitle,
      newDesc,
      id
    );

    const updated = get(
      "SELECT id, list_id, title, description, position, created_at, updated_at FROM cards WHERE id = ?",
      id
    );

    return c.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// DELETE /api/cards/:id — delete a card
app.delete("/api/cards/:id", (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const result = run("DELETE FROM cards WHERE id = ?", id);

    if (result.changes === 0) {
      return c.json({ error: "Card not found" }, 404);
    }

    return c.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// POST /api/cards/:id/move — move a card to a different list/position
app.post("/api/cards/:id/move", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const body = await c.req.json<{ target_list_id: number; position: number }>();

    if (body.target_list_id === undefined || body.position === undefined) {
      return c.json({ error: "target_list_id and position are required" }, 400);
    }

    const card = get<{ id: number; list_id: number; position: number }>(
      "SELECT id, list_id, position FROM cards WHERE id = ?",
      id
    );
    if (!card) {
      return c.json({ error: "Card not found" }, 404);
    }

    const targetList = get("SELECT id FROM lists WHERE id = ?", body.target_list_id);
    if (!targetList) {
      return c.json({ error: "Target list not found" }, 404);
    }

    run(
      "UPDATE cards SET position = position + 1 WHERE list_id = ? AND position >= ? AND id != ?",
      body.target_list_id,
      body.position,
      id
    );

    run(
      "UPDATE cards SET list_id = ?, position = ?, updated_at = datetime('now') WHERE id = ?",
      body.target_list_id,
      body.position,
      id
    );

    return c.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// Production: serve Vite build output
if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ root: "./dist", path: "index.html" }));
}

const port = parseInt(process.env.PORT || "3001", 10);
console.log(`Kanban API running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
