import { useRef, useCallback } from "preact/hooks";
import type { JSX } from "preact";

export function useDrag(
  isAgent: boolean,
  moveCard: (cardId: number, targetListId: number, position: number) => Promise<void>,
  onError: (msg: string) => void,
) {
  const dragCardId = useRef<number | null>(null);

  const onDragStart = useCallback(
    (cardId: number) => (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
      if (isAgent) return;
      dragCardId.current = cardId;
      (e.target as HTMLElement).classList.add("dragging");
      e.dataTransfer!.effectAllowed = "move";
    },
    [isAgent],
  );

  const onDragEnd = useCallback((e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).classList.remove("dragging");
    dragCardId.current = null;
  }, []);

  const onDragOver = useCallback((e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (targetListId: number, cardCount: number) => (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (dragCardId.current === null) return;
      moveCard(dragCardId.current, targetListId, cardCount).catch((err) =>
        onError("Move failed: " + (err as Error).message),
      );
    },
    [moveCard, onError],
  );

  return { onDragStart, onDragEnd, onDragOver, onDrop };
}
