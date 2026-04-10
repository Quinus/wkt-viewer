import {
  CaretDownIcon,
  BoundingBoxIcon,
  TrashIcon,
  EyeIcon,
  EyeClosedIcon,
} from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import type { Color } from "@/features/wkt/utils/colors";

interface WktCardProps {
  id: string;
  color: Color;
  canRemove: boolean;
  collapsed: boolean;
  onZoom: (id: string) => void;
  onToggleCollapse: (id: string) => void;
}

export function WktCard({
  id,
  color,
  canRemove,
  collapsed,
  onZoom,
  onToggleCollapse,
}: WktCardProps) {
  const entry = useWktStore((s) => s.getEntryById(id));
  const updateEntryValue = useWktStore((s) => s.updateEntryValue);
  const updateEntryLabel = useWktStore((s) => s.updateEntryLabel);
  const removeEntry = useWktStore((s) => s.removeEntry);
  const toggleVisibility = useWktStore((s) => s.toggleVisibility);

  if (!entry) return null;

  const statusClass =
    entry.result.kind === "idle"
      ? "bg-gray-500/10 text-gray-500"
      : entry.result.kind === "valid"
        ? "bg-emerald-500/10 text-emerald-500"
        : "bg-red-500/10 text-red-500";

  const statusText =
    entry.result.kind === "idle"
      ? "Paste WKT"
      : entry.result.kind === "valid"
        ? entry.result.label
        : "Invalid";

  return (
    <div className="bg-white border border-black/8 rounded-xl mb-2 overflow-hidden last:mb-0">
      <div className="flex items-center gap-1.5 px-2.5 py-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <button
          className="flex items-center justify-center size-[22px] border-none bg-transparent rounded text-gray-500 cursor-pointer flex-shrink-0 hover:bg-black/5"
          onClick={() => onToggleCollapse(id)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <span className={`transition-transform duration-150 ${collapsed ? "-rotate-90" : ""}`}>
            <CaretDownIcon size={14} weight="fill" />
          </span>
        </button>
        <input
          className="flex-1 min-w-0 border-none bg-transparent text-sm font-medium text-gray-800 outline-none placeholder:text-gray-500 placeholder:font-normal"
          type="text"
          value={entry.label}
          onChange={(e) => updateEntryLabel(id, e.target.value)}
          placeholder="Label"
          spellCheck={false}
        />
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${statusClass}`}>
          {statusText}
        </span>
        <div className="flex gap-0.5 ml-auto">
          <button
            className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-gray-500 cursor-pointer transition-all duration-150 hover:bg-black/5 hover:text-gray-800"
            onClick={() => toggleVisibility(id)}
            title={entry.visible ? "Hide from map" : "Show on map"}
            aria-label={entry.visible ? "Hide from map" : "Show on map"}
          >
            {entry.visible ? <EyeIcon size={16} /> : <EyeClosedIcon size={16} />}
          </button>
          {entry.result.kind === "valid" && (
            <button
              className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-gray-500 cursor-pointer transition-all duration-150 hover:bg-black/5 hover:text-gray-800"
              onClick={() => onZoom(id)}
              title="Zoom to fit"
              aria-label="Zoom to fit"
            >
              <BoundingBoxIcon size={16} />
            </button>
          )}
          {canRemove && (
            <button
              className="flex items-center justify-center w-7 h-7 border-none bg-transparent rounded-md text-gray-500 cursor-pointer transition-all duration-150 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => removeEntry(id)}
              title="Remove"
              aria-label="Remove"
            >
              <TrashIcon size={16} />
            </button>
          )}
        </div>
      </div>
      {!collapsed && (
        <textarea
          className="w-full min-h-20 px-3 py-2.5 border-none border-t border-black/8 bg-slate-50/50 font-mono text-xs leading-relaxed text-gray-800 resize-y outline-none box-border placeholder:text-gray-500 placeholder:opacity-70 focus:bg-slate-50/80"
          value={entry.value}
          onChange={(e) => updateEntryValue(id, e.target.value)}
          placeholder="POINT(4.5 52.0)&#10;LINESTRING(0 0, 10 10)&#10;POLYGON((0 0, 10 0, 10 10, 0 10, 0 0))"
          spellCheck={false}
        />
      )}
    </div>
  );
}
