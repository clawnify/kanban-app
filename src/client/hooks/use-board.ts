import { useState, useCallback, useEffect } from "preact/hooks";
import { api } from "../api";
import type { BoardData } from "../types";
import type { BoardContextValue } from "../context";

export function useBoardState(isAgent: boolean): BoardContextValue {
  const [board, setBoard] = useState<BoardData>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ lists: BoardData }>("GET", "/api/lists");
      setBoard(data.lists || []);
    } catch (err) {
      setError("Failed to load board: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addList = useCallback(async (title: string) => {
    await api("POST", "/api/lists", { title });
    await refresh();
  }, [refresh]);

  const renameList = useCallback(async (id: number, title: string) => {
    await api("PUT", `/api/lists/${id}`, { title });
    await refresh();
  }, [refresh]);

  const deleteList = useCallback(async (id: number) => {
    await api("DELETE", `/api/lists/${id}`);
    await refresh();
  }, [refresh]);

  const addCard = useCallback(async (listId: number, title: string, description?: string) => {
    await api("POST", "/api/cards", { list_id: listId, title, description: description || "" });
    await refresh();
  }, [refresh]);

  const editCard = useCallback(async (cardId: number, title: string, description: string) => {
    await api("PUT", `/api/cards/${cardId}`, { title, description });
    await refresh();
  }, [refresh]);

  const deleteCard = useCallback(async (cardId: number) => {
    await api("DELETE", `/api/cards/${cardId}`);
    await refresh();
  }, [refresh]);

  const moveCard = useCallback(async (cardId: number, targetListId: number, position: number) => {
    await api("POST", `/api/cards/${cardId}/move`, { target_list_id: targetListId, position });
    await refresh();
  }, [refresh]);

  return {
    board, isAgent, loading, error, setError, refresh,
    addList, renameList, deleteList,
    addCard, editCard, deleteCard, moveCard,
  };
}
