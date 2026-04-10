import { useCallback, useRef, useState } from "react";
import { PlusIcon, CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { COLORS } from "@/features/wkt/utils/colors";
import { WktCard } from "./WktCard";

interface WktPanelProps {
  onZoom: (id: string) => void;
}

export function WktPanel({ onZoom }: WktPanelProps) {
  const entries = useWktStore((s) => s.entries);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    origLeft: 0,
    origTop: 0,
  });
  const [dragging, setDragging] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("textarea, button, a, input")) return;
    e.preventDefault();
    const panel = panelRef.current!;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left,
      origTop: rect.top,
    };
    panel.style.left = rect.left + "px";
    panel.style.top = rect.top + "px";
    panel.style.bottom = "auto";
    panel.style.transform = "none";
    panel.setPointerCapture(e.pointerId);
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const { startX, startY, origLeft, origTop } = dragRef.current;
    const panel = panelRef.current!;
    panel.style.left = origLeft + (e.clientX - startX) + "px";
    panel.style.top = origTop + (e.clientY - startY) + "px";
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current.active = false;
    setDragging(false);
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const allCollapsed = entries.length > 0 && entries.every((e) => collapsedCards.has(e.id));

  const toggleCollapseAll = useCallback(() => {
    if (allCollapsed) {
      setCollapsedCards(new Set());
    } else {
      setCollapsedCards(new Set(entries.map((e) => e.id)));
    }
  }, [entries, allCollapsed]);

  return (
    <div
      ref={panelRef}
      className={`fixed top-4 left-4 w-85 max-h-[calc(100vh-32px)] flex flex-col bg-white/92 backdrop-blur-xl border border-black/8 rounded-2xl shadow-lg overflow-hidden touch-none select-none z-10 ${dragging ? "cursor-grabbing opacity-90" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/8 cursor-grab active:cursor-grabbing">
        <span className="font-semibold text-sm text-gray-800">WKT Viewer</span>
        <div className="flex gap-1">
          <button
            className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-gray-500 cursor-pointer transition-all duration-150 hover:bg-black/5 hover:text-gray-800"
            onClick={toggleCollapseAll}
            title={allCollapsed ? "Expand all" : "Collapse all"}
            aria-label={allCollapsed ? "Expand all" : "Collapse all"}
          >
            {allCollapsed ? (
              <CaretUpIcon size={16} weight="bold" />
            ) : (
              <CaretDownIcon size={16} weight="bold" />
            )}
          </button>
          <button
            className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-gray-500 cursor-pointer transition-all duration-150 hover:bg-black/5 hover:text-gray-800"
            onClick={() => useWktStore.getState().addEntry()}
            title="Add WKT string"
            aria-label="Add WKT string"
          >
            <PlusIcon size={16} weight="bold" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {entries.map((entry, i) => (
          <WktCard
            key={entry.id}
            id={entry.id}
            color={COLORS[i % COLORS.length]}
            canRemove={entries.length > 1}
            collapsed={collapsedCards.has(entry.id)}
            onZoom={onZoom}
            onToggleCollapse={toggleCollapse}
          />
        ))}
      </div>
    </div>
  );
}
