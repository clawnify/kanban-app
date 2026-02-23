import { Hono } from "hono";
import { getHtml } from "./html";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Ensure tables exist on every request (CREATE IF NOT EXISTS is cheap)
app.use("*", async (c, next) => {
  try {
    await c.env.DB.batch([
      c.env.DB.prepare(
        "CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))"
      ),
      c.env.DB.prepare(
        "CREATE TABLE IF NOT EXISTS cards (id INTEGER PRIMARY KEY AUTOINCREMENT, list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT DEFAULT '', position INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))"
      ),
    ]);
  } catch {
    // Tables already exist, continue
  }
  await next();
});

// Serve HTML
app.get("/", (c) => {
  return c.html(getHtml());
});

// GET /api/lists — all lists with their cards
app.get("/api/lists", async (c) => {
  try {
    const lists = await c.env.DB.prepare(
      "SELECT id, title, position, created_at FROM lists ORDER BY position ASC"
    ).all();

    const cards = await c.env.DB.prepare(
      "SELECT id, list_id, title, description, position, created_at, updated_at FROM cards ORDER BY position ASC"
    ).all();

    const cardsByList = new Map<number, typeof cards.results>();
    for (const card of cards.results) {
      const listId = card.list_id as number;
      if (!cardsByList.has(listId)) {
        cardsByList.set(listId, []);
      }
      cardsByList.get(listId)!.push(card);
    }

    const result = lists.results.map((list) => ({
      id: list.id,
      title: list.title,
      position: list.position,
      cards: cardsByList.get(list.id as number) || [],
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

    const maxPos = await c.env.DB.prepare(
      "SELECT COALESCE(MAX(position), -1) as max_pos FROM lists"
    ).first<{ max_pos: number }>();

    const nextPos = (maxPos?.max_pos ?? -1) + 1;

    const result = await c.env.DB.prepare(
      "INSERT INTO lists (title, position) VALUES (?, ?) RETURNING id, title, position, created_at"
    )
      .bind(body.title.trim(), nextPos)
      .first();

    return c.json(result, 201);
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

    const result = await c.env.DB.prepare(
      "UPDATE lists SET title = ? WHERE id = ? RETURNING id, title, position, created_at"
    )
      .bind(body.title.trim(), id)
      .first();

    if (!result) {
      return c.json({ error: "List not found" }, 404);
    }

    return c.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// DELETE /api/lists/:id — delete a list and cascade cards
app.delete("/api/lists/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);

    // Enable foreign keys and delete (cascade handled by FK constraint)
    await c.env.DB.prepare("PRAGMA foreign_keys = ON").run();
    await c.env.DB.prepare("DELETE FROM cards WHERE list_id = ?").bind(id).run();
    const result = await c.env.DB.prepare("DELETE FROM lists WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
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

    // Verify list exists
    const list = await c.env.DB.prepare("SELECT id FROM lists WHERE id = ?")
      .bind(body.list_id)
      .first();
    if (!list) {
      return c.json({ error: "List not found" }, 404);
    }

    const maxPos = await c.env.DB.prepare(
      "SELECT COALESCE(MAX(position), -1) as max_pos FROM cards WHERE list_id = ?"
    )
      .bind(body.list_id)
      .first<{ max_pos: number }>();

    const nextPos = (maxPos?.max_pos ?? -1) + 1;

    const result = await c.env.DB.prepare(
      "INSERT INTO cards (list_id, title, description, position) VALUES (?, ?, ?, ?) RETURNING id, list_id, title, description, position, created_at, updated_at"
    )
      .bind(body.list_id, body.title.trim(), (body.description || "").trim(), nextPos)
      .first();

    return c.json(result, 201);
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

    const existing = await c.env.DB.prepare(
      "SELECT id, title, description FROM cards WHERE id = ?"
    )
      .bind(id)
      .first<{ id: number; title: string; description: string }>();

    if (!existing) {
      return c.json({ error: "Card not found" }, 404);
    }

    const newTitle =
      body.title !== undefined ? body.title.trim() : existing.title;
    const newDesc =
      body.description !== undefined
        ? body.description.trim()
        : existing.description;

    if (!newTitle) {
      return c.json({ error: "Title cannot be empty" }, 400);
    }

    const result = await c.env.DB.prepare(
      "UPDATE cards SET title = ?, description = ?, updated_at = datetime('now') WHERE id = ? RETURNING id, list_id, title, description, position, created_at, updated_at"
    )
      .bind(newTitle, newDesc, id)
      .first();

    return c.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

// DELETE /api/cards/:id — delete a card
app.delete("/api/cards/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const result = await c.env.DB.prepare("DELETE FROM cards WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
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
    const body = await c.req.json<{
      target_list_id: number;
      position: number;
    }>();

    if (body.target_list_id === undefined || body.position === undefined) {
      return c.json(
        { error: "target_list_id and position are required" },
        400
      );
    }

    // Verify card exists
    const card = await c.env.DB.prepare(
      "SELECT id, list_id, position FROM cards WHERE id = ?"
    )
      .bind(id)
      .first<{ id: number; list_id: number; position: number }>();

    if (!card) {
      return c.json({ error: "Card not found" }, 404);
    }

    // Verify target list exists
    const targetList = await c.env.DB.prepare(
      "SELECT id FROM lists WHERE id = ?"
    )
      .bind(body.target_list_id)
      .first();

    if (!targetList) {
      return c.json({ error: "Target list not found" }, 404);
    }

    // Shift cards in target list at or after the target position down
    await c.env.DB.prepare(
      "UPDATE cards SET position = position + 1 WHERE list_id = ? AND position >= ? AND id != ?"
    )
      .bind(body.target_list_id, body.position, id)
      .run();

    // Move the card
    await c.env.DB.prepare(
      "UPDATE cards SET list_id = ?, position = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(body.target_list_id, body.position, id)
      .run();

    return c.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

export default app;
