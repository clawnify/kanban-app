import { useEffect } from "preact/hooks";
import { useBoard } from "../context";

export function ErrorBanner() {
  const { error, setError } = useBoard();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error, setError]);

  if (!error) return null;

  return (
    <div class="error-banner" role="alert">
      {error}
    </div>
  );
}
