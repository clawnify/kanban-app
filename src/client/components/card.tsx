import { useState, useRef, useEffect } from "preact/hooks";
import { useBoard } from "../context";
import { CardMenu } from "./card-menu";
import { CardAgentActions } from "./card-agent-actions";
import { ConfirmBar } from "./confirm-bar";
import type { Card as CardType } from "../types";
import type { JSX } from "preact";

interface CardProps {
  card: CardType;
  listId: number;
  onDragStart: (cardId: number) => (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
}

export function Card({ card, listId, onDragStart, onDragEnd }: CardProps) {
  const { isAgent, editCard, deleteCard, setError } = useBoard();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDesc, setEditDesc] = useState(card.description || "");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && titleRef.current) titleRef.current.focus();
  }, [editing]);

  const handleSave = () => {
    const t = editTitle.trim();
    if (!t) return;
    editCard(card.id, t, editDesc.trim()).catch((err) =>
      setError((err as Error).message),
    );
    setEditing(false);
  };

  const handleDelete = () => {
    deleteCard(card.id).catch((err) => {
      setError((err as Error).message);
      setConfirmDelete(false);
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  };

  if (editing) {
    return (
      <div class="card" role="article" aria-label={`Editing card: ${card.title}`}>
        <div class="inline-form">
          {isAgent && <label for={`edit-title-${card.id}`}>Title</label>}
          <input
            ref={titleRef}
            id={`edit-title-${card.id}`}
            type="text"
            value={editTitle}
            onInput={(e) => setEditTitle((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            aria-label="Card title"
          />
          {isAgent && <label for={`edit-desc-${card.id}`}>Description</label>}
          <textarea
            id={`edit-desc-${card.id}`}
            value={editDesc}
            onInput={(e) => setEditDesc((e.target as HTMLTextAreaElement).value)}
            aria-label="Card description"
          />
          <div class="inline-form-row">
            <button class="btn btn-primary btn-sm" onClick={handleSave} aria-label="Save card">
              Save
            </button>
            <button class="btn btn-sm" onClick={() => setEditing(false)} aria-label="Cancel edit">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      class="card"
      draggable={!isAgent}
      onDragStart={onDragStart(card.id)}
      onDragEnd={onDragEnd}
      style={isAgent ? undefined : { cursor: "grab" }}
      data-card-id={card.id}
      data-list-id={listId}
      role="article"
      aria-label={`Card: ${card.title}`}
    >
      <div class="card-title">{card.title}</div>
      {card.description && <div class="card-desc">{card.description}</div>}

      {confirmDelete ? (
        <ConfirmBar
          message="Delete this card?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      ) : (
        <>
          {!isAgent && (
            <CardMenu
              onEdit={() => {
                setEditTitle(card.title);
                setEditDesc(card.description || "");
                setEditing(true);
              }}
              onDelete={() => setConfirmDelete(true)}
            />
          )}
          {isAgent && (
            <CardAgentActions
              card={card}
              listId={listId}
              onEdit={() => {
                setEditTitle(card.title);
                setEditDesc(card.description || "");
                setEditing(true);
              }}
              onDelete={() => setConfirmDelete(true)}
            />
          )}
        </>
      )}
    </div>
  );
}
