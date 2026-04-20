import { useEffect } from "react";
import { useWktStore } from "@/features/wkt/store/useWktStore";

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useWktStore.temporal.getState().undo();
      }

      if (isMeta && (e.key === "Z" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        useWktStore.temporal.getState().redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
