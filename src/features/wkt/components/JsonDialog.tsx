import { useState, useEffect, useRef } from "react";
import { XIcon } from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { parseWkt } from "@/features/wkt/utils/parseWkt";

interface JsonDialogProps {
  open: boolean;
  onClose: () => void;
}

export function JsonDialog({ open, onClose }: JsonDialogProps) {
  const [jsonValue, setJsonValue] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addEntries = useWktStore((s) => s.addEntries);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setJsonValue("");
      setGroupName("");
      setError(null);
    }
  }, [open]);

  const handleParse = () => {
    if (!jsonValue.trim()) return;
    try {
      const parsed = JSON.parse(jsonValue);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const validItems: { label: string; value: string }[] = [];

      for (const item of items) {
        if (item.geo && typeof item.geo === "string") {
          const result = parseWkt(item.geo);
          if (result.kind === "valid") {
            validItems.push({
              label: item.label || item.name || item.id || result.label,
              value: item.geo,
            });
          }
        }
      }

      if (validItems.length === 0) {
        setError("No valid WKT found in geo fields");
        return;
      }

      // Use provided group name or generate one based on item count
      const finalGroupName =
        groupName.trim() ||
        `Imported ${validItems.length} item${validItems.length !== 1 ? "s" : ""}`;

      addEntries(validItems, finalGroupName);
      onClose();
    } catch {
      setError("Invalid JSON");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleParse();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/8">
          <h2 className="text-sm font-semibold text-gray-800">JSON Import</h2>
          <button
            className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-gray-500 cursor-pointer hover:bg-black/5 hover:text-gray-800 transition-colors"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <textarea
            ref={textareaRef}
            className="w-full min-h-32 px-3 py-2.5 border border-black/8 rounded-xl bg-slate-50/50 font-mono text-xs leading-relaxed text-gray-800 resize-y outline-none box-border placeholder:text-gray-500 placeholder:opacity-70 focus:border-blue-500/50 focus:bg-slate-50/80 transition-colors"
            value={jsonValue}
            onChange={(e) => {
              setJsonValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder='[{ "geo": "LINESTRING (4.45 51.20, ...)", "label": "Route 1" }]'
            spellCheck={false}
          />
          <input
            type="text"
            className="w-full px-3 py-2 border border-black/8 rounded-xl bg-slate-50/50 text-sm text-gray-800 outline-none placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-slate-50/80 transition-colors"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name (optional)"
            spellCheck={false}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button
            className="flex-1 px-4 py-2 border border-black/10 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
            onClick={handleParse}
          >
            Add WKT Items
          </button>
        </div>
      </div>
    </div>
  );
}
