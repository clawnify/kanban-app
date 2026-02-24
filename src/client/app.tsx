import { useEffect, useMemo } from "preact/hooks";
import { BoardContext } from "./context";
import { useBoardState } from "./hooks/use-board";
import { Toolbar } from "./components/toolbar";
import { Board } from "./components/board";
import { ErrorBanner } from "./components/error-banner";

export function App() {
  const isAgent = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has("agent") || params.get("mode") === "agent";
  }, []);

  useEffect(() => {
    if (isAgent) {
      document.documentElement.setAttribute("data-agent", "");
    }
  }, [isAgent]);

  const boardState = useBoardState(isAgent);

  return (
    <BoardContext.Provider value={boardState}>
      <Toolbar />
      <Board />
      <ErrorBanner />
    </BoardContext.Provider>
  );
}
