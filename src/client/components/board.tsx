import { useBoard } from "../context";
import { List } from "./list";

export function Board() {
  const { board, loading } = useBoard();

  return (
    <div class="board" id="board">
      {loading && board.length === 0 ? (
        <div class="board-loading">Loading board...</div>
      ) : (
        board.map((list, i) => <List key={list.id} list={list} index={i} />)
      )}
    </div>
  );
}
