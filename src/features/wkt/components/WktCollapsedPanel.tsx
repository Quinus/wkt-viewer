import type { WktGroup, WktEntry } from "@/features/wkt/types/wkt";

interface WktCollapsedPanelProps {
  groupedEntries: {
    groups: Array<{ group: WktGroup; entries: WktEntry[] }>;
    ungrouped: WktEntry[];
  };
  onZoom: (id: string) => void;
}

export function WktCollapsedPanel({ groupedEntries, onZoom }: WktCollapsedPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden panel-scroll py-2 px-1.5 flex flex-col items-center gap-2">
      {groupedEntries.ungrouped.map((entry) => (
        <button
          key={entry.id}
          className="w-7 h-7 rounded-lg border border-zinc-200/80 flex items-center justify-center transition-colors duration-100 hover:border-zinc-300 cursor-pointer"
          style={{
            background: entry.visible ? entry.color : undefined,
            opacity: entry.visible ? 1 : 0.3,
          }}
          onClick={() => onZoom(entry.id)}
          title={entry.label || "WKT"}
          aria-label={`Zoom to ${entry.label || "entry"}`}
        >
          <span
            className="size-2.5 rounded-full"
            style={{ background: entry.visible ? "#fff" : entry.color }}
          />
        </button>
      ))}
      {groupedEntries.groups.map(({ group, entries: groupEntries }) => (
        <div
          key={group.id}
          className="w-7 rounded-lg border border-zinc-200/80 overflow-hidden"
          style={{ opacity: group.visible ? 1 : 0.3 }}
        >
          <div className="h-1.5" style={{ background: groupEntries[0]?.color ?? "#71717a" }} />
          <div className="flex flex-col items-center gap-1 py-1.5">
            {groupEntries.map((entry) => (
              <button
                key={entry.id}
                className="size-3 rounded-full border border-white/50 cursor-pointer transition-transform duration-100 hover:scale-125"
                style={{ background: entry.color, opacity: entry.visible ? 1 : 0.35 }}
                onClick={() => onZoom(entry.id)}
                title={entry.label || "WKT"}
                aria-label={`Zoom to ${entry.label || "entry"}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
