import { useState, useRef, useEffect } from "preact/hooks";
import { Plus } from "lucide-preact";
import { useBoard } from "../context";
import type { List } from "../types";

interface ListFooterProps {
  list: List;
}

export function ListFooter({ list }: ListFooterProps) {
  const { isAgent, addCard, setError } = useBoard();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showForm && titleRef.current) titleRef.current.focus();
  }, [showForm]);

  const handleAdd = () => {
    const t = title.trim();
    if (!t) return;
    addCard(list.id, t, description.trim() || undefined).catch((err) =>
      setError((err as Error).message),
    );
    setTitle("");
    setDescription("");
    if (!isAgent) setShowForm(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setShowForm(false);
      setTitle("");
      setDescription("");
    }
  };

  return (
    <div class="list-footer">
      {/* Human mode */}
      {!isAgent && !showForm && (
        <div class="human-only">
          <button
            class="btn btn-sm"
            style={{ width: "100%" }}
            onClick={() => setShowForm(true)}
            aria-label={`Add card to ${list.title}`}
          >
            <Plus size={14} /> Add Card
          </button>
        </div>
      )}

      {!isAgent && showForm && (
        <div class="inline-form human-only">
          <input
            ref={titleRef}
            type="text"
            placeholder="Card title"
            value={title}
            onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            aria-label="Card title"
          />
          <div class="inline-form-row">
            <button class="btn btn-primary btn-sm" onClick={handleAdd} aria-label="Add card">
              Add
            </button>
            <button
              class="btn btn-sm"
              onClick={() => {
                setShowForm(false);
                setTitle("");
              }}
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Agent mode: always-visible form with labels */}
      {isAgent && (
        <div class="agent-only-block agent-only" style={{ display: "block" }}>
          <div class="inline-form">
            <label for={`agent-card-title-${list.id}`}>New card title</label>
            <input
              id={`agent-card-title-${list.id}`}
              type="text"
              placeholder="Card title"
              value={title}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
              aria-label={`New card title for ${list.title}`}
            />
            <label for={`agent-card-desc-${list.id}`}>Description (optional)</label>
            <input
              id={`agent-card-desc-${list.id}`}
              type="text"
              placeholder="Description"
              value={description}
              onInput={(e) => setDescription((e.target as HTMLInputElement).value)}
              aria-label={`New card description for ${list.title}`}
            />
            <button
              class="btn btn-primary btn-sm"
              onClick={handleAdd}
              aria-label={`Add card to ${list.title}`}
            >
              Add Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
