import { useState } from "preact/hooks";
import { Ellipsis, Pencil, Trash2 } from "lucide-preact";

interface CardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function CardMenu({ onEdit, onDelete }: CardMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        class="card-menu-btn human-only"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-label="Card options"
      >
        <Ellipsis size={16} />
      </button>
      <div class={`card-actions human-actions human-only${open ? " open" : ""}`}>
        <button class="btn btn-sm" onClick={onEdit} aria-label="Edit card">
          <Pencil size={14} /> Edit
        </button>
        <button class="btn btn-sm btn-danger" onClick={onDelete} aria-label="Delete card">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>
  );
}
