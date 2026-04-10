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
      ? "status-idle"
      : entry.result.kind === "valid"
        ? "status-valid"
        : "status-invalid";

  const statusText =
    entry.result.kind === "idle"
      ? "Paste WKT"
      : entry.result.kind === "valid"
        ? entry.result.label
        : "Invalid";

  return (
    <div className="wkt-card">
      <div className="wkt-card-header">
        <span className="wkt-color-dot" style={{ background: color }} />
        <button
          className="collapse-btn"
          onClick={() => onToggleCollapse(id)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <CaretDownIcon
            size={14}
            weight="fill"
            style={{
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease",
            }}
          />
        </button>
        <input
          className="wkt-label-input"
          type="text"
          value={entry.label}
          onChange={(e) => updateEntryLabel(id, e.target.value)}
          placeholder="Label"
          spellCheck={false}
        />
        <span className={`wkt-status ${statusClass}`}>{statusText}</span>
        <div className="wkt-card-actions">
          <button
            className="icon-btn"
            onClick={() => toggleVisibility(id)}
            title={entry.visible ? "Hide from map" : "Show on map"}
            aria-label={entry.visible ? "Hide from map" : "Show on map"}
          >
            {entry.visible ? <EyeIcon size={16} /> : <EyeClosedIcon size={16} />}
          </button>
          {entry.result.kind === "valid" && (
            <button
              className="icon-btn"
              onClick={() => onZoom(id)}
              title="Zoom to fit"
              aria-label="Zoom to fit"
            >
              <BoundingBoxIcon size={16} />
            </button>
          )}
          {canRemove && (
            <button
              className="icon-btn icon-btn-danger"
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
          className="wkt-input"
          value={entry.value}
          onChange={(e) => updateEntryValue(id, e.target.value)}
          placeholder="POINT(4.5 52.0)\nLINESTRING(0 0, 10 10)\nPOLYGON((0 0, 10 0, 10 10, 0 10, 0 0))"
          spellCheck={false}
        />
      )}
    </div>
  );
}
