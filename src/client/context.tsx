import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { BoardData } from "./types";

export interface BoardContextValue {
  board: BoardData;
  isAgent: boolean;
  loading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
  refresh: () => Promise<void>;
  addList: (title: string) => Promise<void>;
  renameList: (id: number, title: string) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  addCard: (listId: number, title: string, description?: string) => Promise<void>;
  editCard: (cardId: number, title: string, description: string) => Promise<void>;
  deleteCard: (cardId: number) => Promise<void>;
  moveCard: (cardId: number, targetListId: number, position: number) => Promise<void>;
}

export const BoardContext = createContext<BoardContextValue>(null!);

export function useBoard() {
  return useContext(BoardContext);
}
