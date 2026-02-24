import { ListHeader } from "./list-header";
import { CardList } from "./card-list";
import { ListFooter } from "./list-footer";
import type { List as ListType } from "../types";

const LIST_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#06b6d4", "#3b82f6", "#ef4444",
];

interface ListProps {
  list: ListType;
  index: number;
}

export function List({ list, index }: ListProps) {
  const color = LIST_COLORS[index % LIST_COLORS.length];

  return (
    <div class="list" data-list-id={list.id} role="region" aria-label={`List: ${list.title}`}>
      <ListHeader list={list} color={color} />
      <CardList list={list} />
      <ListFooter list={list} />
    </div>
  );
}
