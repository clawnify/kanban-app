import { useState, useRef, useEffect } from "preact/hooks";
import { Plus } from "lucide-preact";
import { useBoard } from "../context";

export function Toolbar() {
  const { isAgent, addList, setError } = useBoard();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus();
  }, [showForm]);

  const handleAdd = () => {
    const val = title.trim();
    if (!val) return;
    addList(val)
      .then(() => {
        setTitle("");
        setShowForm(false);
      })
      .catch((err) => setError((err as Error).message));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setShowForm(false);
      setTitle("");
    }
  };

  return (
    <header class="toolbar">
      <h1 class="toolbar-title">Kanban Board</h1>
      <div class="toolbar-right">
        {!showForm && (
          <button
            class="btn btn-primary"
            onClick={() => setShowForm(true)}
            aria-label="Add new list"
          >
            <Plus size={16} /> Add List
          </button>
        )}
        {showForm && (
          <div class="add-list-popover">
            <div class="inline-form">
              {isAgent && <label for="new-list-input">List title</label>}
              <input
                ref={inputRef}
                id="new-list-input"
                type="text"
                placeholder="List title"
                value={title}
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
                onKeyDown={handleKeyDown}
                aria-label="New list title"
              />
              <div class="inline-form-row">
                <button class="btn btn-primary btn-sm" onClick={handleAdd} aria-label="Save new list">
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
          </div>
        )}
      </div>
    </header>
  );
}
