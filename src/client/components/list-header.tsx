import { useState, useRef, useEffect } from "preact/hooks";
import { X } from "lucide-preact";
import { useBoard } from "../context";
import { ConfirmBar } from "./confirm-bar";
import type { List } from "../types";

interface ListHeaderProps {
  list: List;
  color: string;
}

export function ListHeader({ list, color }: ListHeaderProps) {
  const { isAgent, renameList, deleteList, setError } = useBoard();
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(list.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const handleRename = () => {
    const val = renameValue.trim();
    if (!val) return;
    renameList(list.id, val).catch((err) => setError((err as Error).message));
    setRenaming(false);
  };

  const handleDelete = () => {
    deleteList(list.id).catch((err) => {
      setError((err as Error).message);
      setConfirmDelete(false);
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleRename();
    if (e.key === "Escape") setRenaming(false);
  };

  return (
    <div class="list-header" style={{ background: color }}>
      <div class="list-header-left">
        {renaming ? (
          <>
            {isAgent && (
              <label for={`rename-list-${list.id}`} style={{ color: "#fff", fontSize: "11px" }}>
                New list name
              </label>
            )}
            <input
              ref={inputRef}
              id={`rename-list-${list.id}`}
              type="text"
              value={renameValue}
              onInput={(e) => setRenameValue((e.target as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              aria-label="Rename list"
              style={{ flex: 1, color: "#333" }}
            />
            <button class="btn btn-sm" style={{ color: "#333" }} onClick={handleRename} aria-label="Save list name">
              Save
            </button>
            <button class="btn btn-sm" style={{ color: "#333" }} onClick={() => setRenaming(false)} aria-label="Cancel rename">
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* Human mode: clickable title */}
            <span class="human-only" style={{ display: "inline-flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <span
                class="list-title clickable"
                onClick={() => {
                  setRenameValue(list.title);
                  setRenaming(true);
                }}
                title="Click to rename"
              >
                {list.title}
              </span>
            </span>
            {/* Agent mode: static title + rename button */}
            <span class="agent-only" style={{ alignItems: "center", gap: "8px", minWidth: 0 }}>
              <span class="list-title">{list.title}</span>
              <button
                class="btn btn-ghost btn-sm"
                onClick={() => {
                  setRenameValue(list.title);
                  setRenaming(true);
                }}
                aria-label={`Rename list ${list.title}`}
              >
                Rename
              </button>
            </span>
            <span class="list-count">{list.cards.length}</span>
          </>
        )}
      </div>

      {confirmDelete ? (
        <ConfirmBar
          message="Delete list?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          confirmLabel="Yes"
          cancelLabel="No"
          style={{ color: "#fff" }}
        />
      ) : (
        <button
          class="btn btn-ghost btn-sm"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete list ${list.title}`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
