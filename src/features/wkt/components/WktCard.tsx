import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CaretDownIcon,
  TrashIcon,
  EyeIcon,
  EyeClosedIcon,
  DotsSixVerticalIcon,
  CrosshairIcon,
  WarningCircleIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { countVertices, computeLength, computeArea } from "@/features/wkt/utils/measurements";
import { getGeometryIcon } from "@/features/wkt/utils/geometryIcons";

interface WktCardProps {
  id: string;
  canRemove: boolean;
  collapsed: boolean;
  onZoom: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  groupVisible?: boolean;
}

export function WktCard({
  id,
  canRemove,
  collapsed,
  onZoom,
  onToggleCollapse,
  groupVisible,
}: WktCardProps) {
  const entry = useWktStore((s) => s.getEntryById(id));
  const updateEntryValue = useWktStore((s) => s.updateEntryValue);
  const updateEntryLabel = useWktStore((s) => s.updateEntryLabel);
  const removeEntry = useWktStore((s) => s.removeEntry);
  const toggleVisibility = useWktStore((s) => s.toggleVisibility);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!entry) return null;

  const geometryIcon = useMemo(() => getGeometryIcon(entry.result), [entry.result]);

  const geometryInfo = useMemo(() => {
    if (entry.result.kind !== "valid") return null;
    const geom = entry.result.geojson;
    const vertices = countVertices(geom);
    const parts: string[] = [`${vertices} vertices`];
    if (geom.type === "Point") {
      parts.push(`(${geom.coordinates[0].toFixed(4)}, ${geom.coordinates[1].toFixed(4)})`);
    }
    const length = computeLength(geom);
    if (length !== null && length > 0) {
      parts.push(length > 1000 ? `${(length / 1000).toFixed(2)} km` : `${length.toFixed(0)} m`);
    }
    const area = computeArea(geom);
    if (area !== null && area > 0) {
      parts.push(
        area > 1_000_000 ? `${(area / 1_000_000).toFixed(2)} km²` : `${area.toFixed(0)} m²`,
      );
    }
    return parts.join(" · ");
  }, [entry.result]);

  const isHidden = !entry.visible || groupVisible === false;
  const isValid = entry.result.kind === "valid";
  const isInvalid = entry.result.kind === "invalid";

  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? "z-50" : ""}`}>
      <div
        className={`group/card relative transition-all duration-200 ${isDragging ? "opacity-40 scale-[0.98] rotate-1" : ""} ${isHidden ? "opacity-60" : ""}`}
      >
        {/* Card container with left border accent */}
        <div
          className="relative bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-zinc-300/80"
          style={{ borderLeftWidth: "3px", borderLeftColor: entry.color }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-b from-white to-zinc-50/50">
            {/* Drag handle */}
            <span
              {...attributes}
              {...listeners}
              className="flex items-center justify-center text-zinc-300 cursor-grab active:cursor-grabbing hover:text-zinc-500 transition-colors"
              title="Drag to reorder"
            >
              <DotsSixVerticalIcon size={14} weight="bold" />
            </span>

            {/* Expand/collapse */}
            <button
              className="flex items-center justify-center size-6 rounded-md text-zinc-400 cursor-pointer flex-shrink-0 transition-all duration-150 hover:text-zinc-700 hover:bg-zinc-100"
              onClick={() => onToggleCollapse(id)}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <span
                className={`transition-transform duration-200 ease-out ${collapsed ? "-rotate-90" : ""}`}
              >
                <CaretDownIcon size={14} weight="bold" />
              </span>
            </button>

            {/* Geometry type icon */}
            <div
              className={`flex items-center justify-center size-6 rounded-md bg-zinc-100 flex-shrink-0 ${geometryIcon.color}`}
              title={geometryIcon.label}
            >
              <geometryIcon.icon size={14} weight="fill" />
            </div>

            {/* Label input */}
            <input
              className="flex-1 min-w-0 bg-transparent text-[13px] font-medium text-zinc-800 outline-none placeholder:text-zinc-400 transition-colors focus:text-zinc-900"
              type="text"
              value={entry.label}
              onChange={(e) => updateEntryLabel(id, e.target.value)}
              placeholder="Untitled geometry"
              spellCheck={false}
            />

            {/* Status indicator */}
            {isValid && (
              <div className="flex items-center justify-center size-5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                <CheckCircleIcon size={12} weight="fill" />
              </div>
            )}
            {isInvalid && (
              <div
                className="flex items-center justify-center size-5 rounded-full bg-red-100 text-red-500 flex-shrink-0"
                title={entry.result.kind === "invalid" ? entry.result.error : undefined}
              >
                <WarningCircleIcon size={12} weight="fill" />
              </div>
            )}

            {/* Visibility toggle */}
            {groupVisible !== false && (
              <button
                className={`flex items-center justify-center size-7 rounded-md cursor-pointer transition-all duration-150 ${entry.visible ? "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100" : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100"}`}
                onClick={() => toggleVisibility(id)}
                title={entry.visible ? "Hide" : "Show"}
                aria-label={entry.visible ? "Hide" : "Show"}
              >
                {entry.visible ? <EyeIcon size={15} /> : <EyeClosedIcon size={15} />}
              </button>
            )}

            {/* Actions - visible on hover */}
            <div className="flex gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-150">
              {isValid && (
                <button
                  className="flex items-center justify-center size-7 rounded-md text-zinc-400 cursor-pointer transition-all duration-150 hover:text-indigo-600 hover:bg-indigo-50"
                  onClick={() => onZoom(id)}
                  title="Zoom to fit"
                  aria-label="Zoom to fit"
                >
                  <CrosshairIcon size={15} />
                </button>
              )}
              {canRemove && (
                <button
                  className="flex items-center justify-center size-7 rounded-md text-zinc-400 cursor-pointer transition-all duration-150 hover:text-red-500 hover:bg-red-50"
                  onClick={() => removeEntry(id)}
                  title="Remove"
                  aria-label="Remove"
                >
                  <TrashIcon size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Collapsible content */}
          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${collapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"}`}
          >
            <div className="px-3 pb-3 pt-1 border-t border-zinc-100">
              {/* WKT Input */}
              <textarea
                className={`w-full min-h-[80px] px-3 py-2.5 rounded-lg bg-zinc-50/80 font-mono text-[12px] leading-relaxed text-zinc-700 resize-y outline-none box-border placeholder:text-zinc-400/70 transition-all duration-150 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ${isInvalid ? "ring-1 ring-red-300 focus:ring-red-400/30" : ""}`}
                style={{ fontFamily: "var(--font-family-mono), monospace" }}
                value={entry.value}
                onChange={(e) => updateEntryValue(id, e.target.value)}
                placeholder={
                  "POINT(4.5 52.0)\nLINESTRING(0 0, 10 10)\nPOLYGON((0 0, 10 0, 10 10, 0 10, 0 0))"
                }
                spellCheck={false}
              />

              {/* Error message */}
              {isInvalid && (
                <div className="mt-2 flex items-start gap-2 text-[11px] text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <WarningCircleIcon size={14} className="flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {entry.result.kind === "invalid" ? entry.result.error : "Invalid WKT"}
                  </span>
                </div>
              )}

              {/* Geometry info */}
              {geometryInfo && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-100/70 rounded-lg px-3 py-1.5">
                    <geometryIcon.icon size={12} className={geometryIcon.color} />
                    <span>{geometryInfo}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
