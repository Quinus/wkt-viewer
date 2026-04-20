import { useState, useRef } from "react";
import { XIcon, CopyIcon, DownloadIcon } from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { exportAsJson, exportAsUrl } from "@/features/wkt/utils/export";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ open, onClose }: ShareDialogProps) {
  const entries = useWktStore((s) => s.entries);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const jsonRef = useRef<HTMLTextAreaElement>(null);

  if (!open) return null;

  const validCount = entries.filter((e) => e.result.kind === "valid").length;
  const hasEntries = validCount > 0;
  const jsonOutput = hasEntries ? exportAsJson(entries) : "";
  const shareUrl = hasEntries ? exportAsUrl(entries) : "";

  const handleCopyJson = async () => {
    if (!jsonOutput) return;
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      jsonRef.current?.select();
      document.execCommand("copy");
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      /* noop */
    }
  };

  const handleDownloadJson = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wkt-geometries.json";
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <h2 className="text-sm font-semibold text-gray-800">Export & Share</h2>
          <button
            className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-gray-500 cursor-pointer hover:bg-black/5 hover:text-gray-800 transition-colors"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {!hasEntries && (
            <p className="text-sm text-gray-500 text-center py-4">
              No valid geometries to export. Add some WKT first.
            </p>
          )}
          {hasEntries && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    JSON Export ({validCount} {validCount === 1 ? "item" : "items"})
                  </label>
                  <div className="flex gap-1">
                    <button
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 border border-black/8 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={handleCopyJson}
                    >
                      <CopyIcon size={11} />
                      {copiedJson ? "Copied!" : "Copy"}
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 border border-black/8 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={handleDownloadJson}
                    >
                      <DownloadIcon size={11} />
                      Download
                    </button>
                  </div>
                </div>
                <textarea
                  ref={jsonRef}
                  readOnly
                  className="w-full h-32 px-3 py-2.5 border border-black/8 rounded-xl bg-slate-50/50 font-mono text-xs leading-relaxed text-gray-800 resize-none outline-none"
                  value={jsonOutput}
                  spellCheck={false}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-600">Shareable Link</label>
                  <button
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 border border-black/8 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={handleCopyUrl}
                  >
                    <CopyIcon size={11} />
                    {copiedUrl ? "Copied!" : "Copy"}
                  </button>
                </div>
                <input
                  readOnly
                  className="w-full px-3 py-2 border border-black/8 rounded-xl bg-slate-50/50 text-xs text-gray-800 outline-none truncate"
                  value={shareUrl}
                  spellCheck={false}
                />
              </div>
            </>
          )}
        </div>
        <div className="px-4 pb-4">
          <button
            className="w-full px-4 py-2 border border-black/10 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
