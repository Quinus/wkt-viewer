import { useEffect, useRef, useState } from "react";
import {
  CaretDownIcon,
  BoundingBoxIcon,
  TrashIcon,
  EyeIcon,
  EyeClosedIcon,
  DotsSixVerticalIcon,
} from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";

interface WktCardProps {
  id: string;
  canRemove: boolean;
  collapsed: boolean;
  onZoom: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  showBorder?: boolean;
  groupVisible?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  dropPosition?: "before" | "after" | null;
}

export function WktCard({
  id,
  canRemove,
  collapsed,
  onZoom,
  onToggleCollapse,
  showBorder = true,
  groupVisible,
  onDragStart,
  onDragEnd,
  dropPosition,
}: WktCardProps) {
  const entry = useWktStore((s) => s.getEntryById(id));
  const updateEntryValue = useWktStore((s) => s.updateEntryValue);
  const updateEntryLabel = useWktStore((s) => s.updateEntryLabel);
  const removeEntry = useWktStore((s) => s.removeEntry);
  const toggleVisibility = useWktStore((s) => s.toggleVisibility);
  const wasValidRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const isValid = entry?.result.kind === "valid";
    if (!wasValidRef.current && isValid) {
      onZoom(id);
    }
    wasValidRef.current = isValid;
  }, [entry?.result.kind, id, onZoom]);

  if (!entry) return null;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", entry.id);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-50");
    onDragStart?.(entry.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    e.currentTarget.classList.remove("opacity-50");
    onDragEnd?.();
  };

  const statusConfig = {
    idle: { bg: "bg-zinc-200/60", text: "text-zinc-400", label: "Paste WKT" },
    valid: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      label: entry.result.kind === "valid" ? entry.result.label : "",
    },
    invalid: { bg: "bg-red-500/8", text: "text-red-500", label: "Invalid" },
  }[entry.result.kind];

  const isHidden = !entry.visible;

  return (
    <div className="relative">
      {dropPosition === "before" && (
        <div className="absolute -top-[2px] left-0 right-0 h-[3px] bg-blue-500 rounded-full z-10" />
      )}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`group/card relative item-enter cursor-grab active:cursor-grabbing ${isHidden ? "opacity-50" : ""} ${isDragging ? "opacity-50" : ""}`}
        style={
          showBorder
            ? {
                borderLeft: `3px solid ${entry.color}`,
              }
            : undefined
        }
      >
        <div
          className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors duration-100 ${isHidden ? "" : "hover:bg-black/[0.03]"}`}
        >
          <span
            className="flex items-center justify-center text-zinc-300 cursor-grab"
            title="Drag to move"
          >
            <DotsSixVerticalIcon size={14} weight="bold" />
          </span>
          <button
            className="flex items-center justify-center size-5 border-none bg-transparent rounded text-zinc-400 cursor-pointer flex-shrink-0 transition-colors duration-100 hover:text-zinc-700 hover:bg-black/5"
            onClick={() => onToggleCollapse(id)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <span className={`transition-transform duration-150 ${collapsed ? "-rotate-90" : ""}`}>
              <CaretDownIcon size={12} weight="fill" />
            </span>
          </button>
          <input
            className="flex-1 min-w-0 border-none bg-transparent text-[13px] font-medium text-zinc-800 outline-none placeholder:text-zinc-400 placeholder:font-normal"
            type="text"
            value={entry.label}
            onChange={(e) => updateEntryLabel(id, e.target.value)}
            placeholder="Label"
            spellCheck={false}
          />
          {entry.result.kind !== "idle" && (
            <span
              className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-md flex-shrink-0 ${statusConfig.bg} ${statusConfig.text}`}
            >
              {statusConfig.label}
            </span>
          )}
          {groupVisible !== false && (
            <button
              className={`flex items-center justify-center size-6 border-none bg-transparent rounded text-zinc-400 cursor-pointer transition-colors duration-100 hover:text-zinc-700 hover:bg-black/5 ${!entry.visible ? "text-zinc-300" : ""}`}
              onClick={() => toggleVisibility(id)}
              title={entry.visible ? "Hide" : "Show"}
              aria-label={entry.visible ? "Hide" : "Show"}
            >
              {entry.visible ? <EyeIcon size={14} /> : <EyeClosedIcon size={14} />}
            </button>
          )}
          <div className="flex gap-px opacity-0 group-hover/card:opacity-100 transition-opacity duration-100">
            {entry.result.kind === "valid" && (
              <button
                className="flex items-center justify-center size-6 border-none bg-transparent rounded text-zinc-400 cursor-pointer transition-colors duration-100 hover:text-zinc-700 hover:bg-black/5"
                onClick={() => onZoom(id)}
                title="Zoom to fit"
                aria-label="Zoom to fit"
              >
                <BoundingBoxIcon size={14} />
              </button>
            )}
            {canRemove && (
              <button
                className="flex items-center justify-center size-6 border-none bg-transparent rounded text-zinc-400 cursor-pointer transition-colors duration-100 hover:text-red-500 hover:bg-red-500/8"
                onClick={() => removeEntry(id)}
                title="Remove"
                aria-label="Remove"
              >
                <TrashIcon size={14} />
              </button>
            )}
          </div>
        </div>
        <div className={`group-body ${collapsed ? "collapsed" : ""}`}>
          <div className="group-body-inner">
            <div className="px-3 pb-2">
              <textarea
                className="w-full min-h-[72px] px-2.5 py-2 border border-zinc-200/80 rounded-lg bg-zinc-50/50 font-mono text-[12px] leading-relaxed text-zinc-700 resize-y outline-none box-border placeholder:text-zinc-400 placeholder:opacity-60 focus:border-zinc-300 focus:bg-white transition-colors"
                style={{ fontFamily: "var(--font-family-mono), monospace" }}
                value={entry.value}
                onChange={(e) => updateEntryValue(id, e.target.value)}
                placeholder={
                  "POINT(4.5 52.0)\nLINESTRING(0 0, 10 10)\nPOLYGON((0 0, 10 0, 10 10, 0 10, 0 0))"
                }
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
      {dropPosition === "after" && (
        <div className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-blue-500 rounded-full z-10" />
      )}
    </div>
  );
}
