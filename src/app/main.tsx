import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { loadFromUrlHash } from "@/features/wkt/utils/urlHash";
import "@/styles/index.css";

const sharedItems = loadFromUrlHash();
if (sharedItems) {
  useWktStore.getState().addEntries(sharedItems, "Shared Geometries");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
