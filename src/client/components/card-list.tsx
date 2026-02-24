import { useBoard } from "../context";
import { useDrag } from "../hooks/use-drag";
import { Card } from "./card";
import type { List } from "../types";

interface CardListProps {
  list: List;
}

export function CardList({ list }: CardListProps) {
  const { isAgent, moveCard, setError } = useBoard();
  const { onDragStart, onDragEnd, onDragOver, onDrop } = useDrag(isAgent, moveCard, setError);

  return (
    <div
      class="list-cards"
      data-list-id={list.id}
      onDragOver={isAgent ? undefined : onDragOver}
      onDrop={isAgent ? undefined : onDrop(list.id, list.cards.length)}
    >
      {list.cards.length === 0 ? (
        <div style={{ color: "var(--text-secondary)", fontSize: "12px", padding: "8px", textAlign: "center" }}>
          No cards yet
        </div>
      ) : (
        list.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            listId={list.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))
      )}
    </div>
  );
}
