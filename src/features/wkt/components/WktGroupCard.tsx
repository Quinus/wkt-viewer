import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  EyeIcon,
  EyeClosedIcon,
  TrashIcon,
  DotsSixVerticalIcon,
  CrosshairIcon,
  FolderOpenIcon,
  FolderIcon,
  SquaresFourIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { WktCard } from "./WktCard";
import { computeBbox } from "@/features/wkt/utils/computeBbox";
import type { WktGroup, WktEntry } from "@/features/wkt/types/wkt";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface WktGroupCardProps {
  group: WktGroup;
  entries: WktEntry[];
  canRemoveEntry: (id: string) => boolean;
  collapsedCards: Set<string>;
  onToggleCollapse: (id: string) => void;
  onZoom: (id: string) => void;
  onZoomToBbox: (bbox: [number, number, number, number]) => void;
  editingGroupId: string | null;
  onSetEditingGroupId: (id: string | null) => void;
}

export function WktGroupCard({
  group,
  entries: groupEntries,
  canRemoveEntry,
  collapsedCards,
  onToggleCollapse,
  onZoom,
  onZoomToBbox,
  editingGroupId,
  onSetEditingGroupId,
}: WktGroupCardProps) {
  const updateGroupName = useWktStore((s) => s.updateGroupName);
  const toggleGroupVisibility = useWktStore((s) => s.toggleGroupVisibility);
  const removeGroup = useWktStore((s) => s.removeGroup);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isHidden = !group.visible;

  const handleZoomToGroup = () => {
    const validGeometries = groupEntries
      .filter((e) => e.result.kind === "valid")
      .map((e) => (e.result as { kind: "valid"; geojson: GeoJSON.Geometry }).geojson);

    if (validGeometries.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    let hasValidBbox = false;

    for (const geom of validGeometries) {
      const bbox = computeBbox(geom);
      if (bbox) {
        hasValidBbox = true;
        minX = Math.min(minX, bbox[0]);
        minY = Math.min(minY, bbox[1]);
        maxX = Math.max(maxX, bbox[2]);
        maxY = Math.max(maxY, bbox[3]);
      }
    }

    if (hasValidBbox) {
      onZoomToBbox([minX, minY, maxX, maxY]);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? "z-50" : ""}`}>
      <div
        className={`group/grp relative transition-all duration-200 ${isDragging ? "opacity-40 scale-[0.98] rotate-1" : ""}`}
      >
        {/* Group container */}
        <div
          className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${isHidden ? "border-zinc-200/60 bg-zinc-50/50" : "border-zinc-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"}`}
        >
          {/* Group Header */}
          <div
            className={`flex items-center gap-2 px-3 py-3 cursor-grab active:cursor-grabbing transition-colors duration-150 ${isHidden ? "bg-zinc-100/50" : "bg-gradient-to-b from-indigo-50/60 to-indigo-50/30"}`}
            {...attributes}
            {...listeners}
          >
            {/* Drag handle */}
            <span className="flex items-center justify-center text-zinc-300 hover:text-zinc-500 transition-colors">
              <DotsSixVerticalIcon size={14} weight="bold" />
            </span>

            {/* Folder icon */}
            <div
              className={`flex items-center justify-center size-7 rounded-lg flex-shrink-0 ${isHidden ? "bg-zinc-200 text-zinc-400" : "bg-indigo-100 text-indigo-600"}`}
            >
              {isHidden ? (
                <FolderIcon size={16} weight="fill" />
              ) : (
                <FolderOpenIcon size={16} weight="fill" />
              )}
            </div>

            {/* Group name */}
            {editingGroupId === group.id ? (
              <input
                className="flex-1 min-w-0 text-[13px] font-semibold text-zinc-800 bg-white border border-indigo-300 rounded-md px-2 py-1 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={group.name}
                onChange={(e) => updateGroupName(group.id, e.target.value)}
                onBlur={() => onSetEditingGroupId(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSetEditingGroupId(null);
                  if (e.key === "Escape") onSetEditingGroupId(null);
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                <span
                  className="text-[13px] font-semibold text-zinc-700 truncate cursor-pointer group/name select-none hover:text-zinc-900 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetEditingGroupId(group.id);
                  }}
                  title="Click to rename"
                >
                  {group.name}
                </span>
                <button
                  className="opacity-0 group-hover/grp:opacity-100 text-zinc-300 hover:text-indigo-500 transition-all duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetEditingGroupId(group.id);
                  }}
                  title="Rename"
                >
                  <PencilSimpleIcon size={11} weight="bold" />
                </button>
              </div>
            )}

            {/* Entry count badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/60 border border-zinc-200/60 flex-shrink-0">
              <SquaresFourIcon size={11} className="text-zinc-400" />
              <span className="text-[10px] font-semibold text-zinc-500 tabular-nums">
                {groupEntries.length}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-0.5 ml-1" onClick={(e) => e.stopPropagation()}>
              {groupEntries.some((e) => e.result.kind === "valid") && (
                <button
                  className="flex items-center justify-center size-7 rounded-md text-zinc-400 cursor-pointer transition-all duration-150 hover:text-indigo-600 hover:bg-indigo-100/60"
                  onClick={handleZoomToGroup}
                  title="Zoom to fit all"
                  aria-label="Zoom to fit all"
                >
                  <CrosshairIcon size={15} />
                </button>
              )}
              <button
                className={`flex items-center justify-center size-7 rounded-md cursor-pointer transition-all duration-150 ${group.visible ? "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100" : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100"}`}
                onClick={() => toggleGroupVisibility(group.id)}
                title={group.visible ? "Hide group" : "Show group"}
                aria-label={group.visible ? "Hide group" : "Show group"}
              >
                {group.visible ? <EyeIcon size={15} /> : <EyeClosedIcon size={15} />}
              </button>
              <button
                className="flex items-center justify-center size-7 rounded-md text-zinc-400 cursor-pointer transition-all duration-150 hover:text-red-500 hover:bg-red-50"
                onClick={() => removeGroup(group.id)}
                title="Remove group"
                aria-label="Remove group"
              >
                <TrashIcon size={15} />
              </button>
            </div>
          </div>

          {/* Group content */}
          <div className="bg-zinc-50/40">
            <div className="py-2 px-2 min-h-[40px]">
              {/* Empty state */}
              {groupEntries.length === 0 && (
                <div className="text-center py-6 text-[12px] text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-100/30 mx-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <SquaresFourIcon size={20} className="text-zinc-300" />
                    <span>Drag geometries here</span>
                  </div>
                </div>
              )}

              {/* Entry list */}
              <SortableContext
                items={groupEntries.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {groupEntries.map((entry) => (
                    <WktCard
                      key={entry.id}
                      id={entry.id}
                      canRemove={canRemoveEntry(entry.id)}
                      collapsed={collapsedCards.has(entry.id)}
                      onZoom={onZoom}
                      onToggleCollapse={onToggleCollapse}
                      groupVisible={group.visible}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
