import { useState, useMemo } from "react";
import {
  PlusIcon,
  CaretDownIcon,
  CaretUpIcon,
  CodeIcon,
  EyeIcon,
  EyeClosedIcon,
  TrashIcon,
  SidebarSimpleIcon,
  PencilIcon,
  SquaresFourIcon,
  FolderSimplePlusIcon,
  DotsSixVerticalIcon,
  BoundingBoxIcon,
} from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { WktCard } from "./WktCard";
import type { WktGroup, WktEntry } from "@/features/wkt/types/wkt";
import { computeBbox } from "@/features/wkt/utils/computeBbox";

interface WktPanelProps {
  onZoom: (id: string) => void;
  onZoomToBbox?: (bbox: [number, number, number, number]) => void;
  onOpenJsonDialog: () => void;
}

interface GroupedEntries {
  groups: Array<{ group: WktGroup; entries: WktEntry[] }>;
  ungrouped: WktEntry[];
}

interface DropIndicator {
  entryId: string;
  position: "before" | "after";
}

interface GroupDropIndicator {
  groupId: string;
  position: "before" | "after";
}

export function WktPanel({ onZoom, onZoomToBbox, onOpenJsonDialog }: WktPanelProps) {
  const entries = useWktStore((s) => s.entries);
  const groups = useWktStore((s) => s.groups);
  const toggleGroupVisibility = useWktStore((s) => s.toggleGroupVisibility);
  const removeGroup = useWktStore((s) => s.removeGroup);
  const updateGroupName = useWktStore((s) => s.updateGroupName);
  const addEntry = useWktStore((s) => s.addEntry);
  const moveEntryToGroup = useWktStore((s) => s.moveEntryToGroup);
  const createEmptyGroup = useWktStore((s) => s.createEmptyGroup);
  const reorderEntry = useWktStore((s) => s.reorderEntry);
  const reorderGroup = useWktStore((s) => s.reorderGroup);

  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [draggingEntryId, setDraggingEntryId] = useState<string | null>(null);
  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const [groupDropIndicator, setGroupDropIndicator] = useState<GroupDropIndicator | null>(null);

  const groupedEntries = useMemo<GroupedEntries>(() => {
    const ungrouped: WktEntry[] = [];
    const groupMap = new Map<string, WktEntry[]>();

    groups.forEach((g) => groupMap.set(g.id, []));

    entries.forEach((e) => {
      if (e.groupId && groupMap.has(e.groupId)) {
        groupMap.get(e.groupId)!.push(e);
      } else {
        ungrouped.push(e);
      }
    });

    const orderedGroups = groups.map((group) => ({
      group,
      entries: groupMap.get(group.id) || [],
    }));

    return { groups: orderedGroups, ungrouped };
  }, [entries, groups]);

  const toggleCollapse = (id: string) => {
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allCollapsed = entries.length > 0 && entries.every((e) => collapsedCards.has(e.id));

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedCards(new Set());
    } else {
      setCollapsedCards(new Set(entries.map((e) => e.id)));
    }
  };

  const hasAnyContent = groupedEntries.ungrouped.length > 0 || groupedEntries.groups.length > 0;

  // Entry drag and drop handlers
  const handleEntryDragStart = (id: string) => {
    setDraggingEntryId(id);
  };

  const handleEntryDragEnd = () => {
    setDraggingEntryId(null);
    setDropIndicator(null);
  };

  const handleEntryDragOver = (
    e: React.DragEvent,
    targetEntryId: string,
    _targetGroupId: string | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData("text/plain") || draggingEntryId;
    if (!draggedId || draggedId === targetEntryId) {
      setDropIndicator(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const position = y < height / 2 ? "before" : "after";

    setDropIndicator({ entryId: targetEntryId, position });
  };

  const handleEntryDrop = (
    e: React.DragEvent,
    targetEntryId: string,
    targetGroupId: string | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData("text/plain") || draggingEntryId;
    if (!draggedId) {
      setDropIndicator(null);
      return;
    }

    const draggedEntry = entries.find((e) => e.id === draggedId);
    if (!draggedEntry) {
      setDropIndicator(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const position = y < height / 2 ? "before" : "after";

    // If different group, move to group first
    if (draggedEntry.groupId !== targetGroupId) {
      moveEntryToGroup(draggedId, targetGroupId);
    }

    // Then reorder
    const beforeEntryId = position === "before" ? targetEntryId : null;
    reorderEntry(draggedId, beforeEntryId);

    setDropIndicator(null);
    setDraggingEntryId(null);
  };

  const handleContainerDragOver = (e: React.DragEvent, _groupId: string | null) => {
    e.preventDefault();
    // Only handle if we're dragging over the container itself, not a child
    if (e.target === e.currentTarget) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleContainerDrop = (e: React.DragEvent, groupId: string | null) => {
    e.preventDefault();
    // Only handle if dropping on the container itself
    if (e.target !== e.currentTarget) return;

    const draggedId = e.dataTransfer.getData("text/plain") || draggingEntryId;
    if (!draggedId) return;

    const draggedEntry = entries.find((e) => e.id === draggedId);
    if (!draggedEntry) return;

    // If dropping in a different group, move there and append to end
    if (draggedEntry.groupId !== groupId) {
      moveEntryToGroup(draggedId, groupId);
    }

    setDraggingEntryId(null);
    setDropIndicator(null);
  };

  // Group drag and drop handlers
  const handleGroupDragStart = (e: React.DragEvent, groupId: string) => {
    e.dataTransfer.setData("text/group", groupId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingGroupId(groupId);
  };

  const handleGroupDragEnd = () => {
    setDraggingGroupId(null);
    setGroupDropIndicator(null);
  };

  const handleGroupDragOver = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData("text/group") || draggingGroupId;
    if (!draggedId || draggedId === targetGroupId) {
      setGroupDropIndicator(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const position = y < height / 2 ? "before" : "after";

    setGroupDropIndicator({ groupId: targetGroupId, position });
  };

  const handleGroupDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData("text/group") || draggingGroupId;
    if (!draggedId || draggedId === targetGroupId) {
      setGroupDropIndicator(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const position = y < height / 2 ? "before" : "after";

    const beforeGroupId = position === "before" ? targetGroupId : null;
    reorderGroup(draggedId, beforeGroupId);

    setGroupDropIndicator(null);
    setDraggingGroupId(null);
  };

  const handleCreateGroup = () => {
    const groupNumber = groups.length + 1;
    createEmptyGroup(`Group ${groupNumber}`);
  };

  const handleZoomToGroup = (groupEntries: WktEntry[]) => {
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

    if (hasValidBbox && onZoomToBbox) {
      onZoomToBbox([minX, minY, maxX, maxY]);
    }
  };

  const getEntryDropPosition = (entryId: string): "before" | "after" | null => {
    if (!dropIndicator || dropIndicator.entryId !== entryId) return null;
    return dropIndicator.position;
  };

  const getGroupDropPosition = (groupId: string): "before" | "after" | null => {
    if (!groupDropIndicator || groupDropIndicator.groupId !== groupId) return null;
    return groupDropIndicator.position;
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full flex flex-col bg-white/[0.97] backdrop-blur-2xl border-r border-zinc-200/60 shadow-[0_0_40px_rgba(0,0,0,0.06)] transition-[width] duration-200 ease-in-out z-10 ${panelCollapsed ? "w-10" : "w-80"}`}
    >
      <div className="flex items-center justify-between px-3 h-11 border-b border-zinc-200/60 flex-shrink-0">
        {!panelCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <span className="text-[13px] font-semibold tracking-tight text-zinc-800 truncate">
              WKT Viewer
            </span>
          </div>
        )}
        <div className={`flex gap-0.5 ${panelCollapsed ? "w-full justify-center" : ""}`}>
          <button
            className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-zinc-400 cursor-pointer transition-all duration-100 hover:bg-zinc-100 hover:text-zinc-700"
            onClick={() => setPanelCollapsed((c) => !c)}
            title={panelCollapsed ? "Expand panel" : "Collapse panel"}
            aria-label={panelCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <SidebarSimpleIcon size={15} weight={panelCollapsed ? "bold" : "fill"} />
          </button>
          {!panelCollapsed && (
            <>
              <button
                className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-zinc-400 cursor-pointer transition-all duration-100 hover:bg-zinc-100 hover:text-zinc-700"
                onClick={toggleCollapseAll}
                title={allCollapsed ? "Expand all" : "Collapse all"}
                aria-label={allCollapsed ? "Expand all" : "Collapse all"}
              >
                {allCollapsed ? (
                  <CaretUpIcon size={14} weight="bold" />
                ) : (
                  <CaretDownIcon size={14} weight="bold" />
                )}
              </button>
              <button
                className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-zinc-400 cursor-pointer transition-all duration-100 hover:bg-zinc-100 hover:text-zinc-700"
                onClick={() => addEntry()}
                title="Add WKT string"
                aria-label="Add WKT string"
              >
                <PlusIcon size={15} weight="bold" />
              </button>
              <button
                className="flex items-center justify-center size-7 border-none bg-transparent rounded-md text-zinc-400 cursor-pointer transition-all duration-100 hover:bg-zinc-100 hover:text-zinc-700"
                onClick={handleCreateGroup}
                title="New group"
                aria-label="New group"
              >
                <FolderSimplePlusIcon size={15} weight="bold" />
              </button>
            </>
          )}
        </div>
      </div>

      {panelCollapsed ? (
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
      ) : (
        <>
          <div className="flex-1 overflow-y-auto panel-scroll">
            {!hasAnyContent && (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <SquaresFourIcon size={32} weight="thin" className="text-zinc-300 mb-3" />
                <p className="text-[13px] text-zinc-400 font-medium">No geometries yet</p>
                <p className="text-[11px] text-zinc-400/70 mt-1">Click + to add a WKT string</p>
              </div>
            )}

            <div
              className="px-2 pt-2 pb-1 min-h-[20px]"
              onDragOver={(e) => handleContainerDragOver(e, null)}
              onDrop={(e) => handleContainerDrop(e, null)}
            >
              {groupedEntries.ungrouped.length === 0 && draggingEntryId && (
                <div className="text-center py-4 text-[12px] text-zinc-400 border-2 border-dashed border-zinc-200 rounded-lg">
                  Drop here to ungroup
                </div>
              )}
              {groupedEntries.ungrouped.map((entry) => (
                <div
                  key={entry.id}
                  onDragOver={(e) => handleEntryDragOver(e, entry.id, null)}
                  onDrop={(e) => handleEntryDrop(e, entry.id, null)}
                >
                  <WktCard
                    id={entry.id}
                    canRemove={entries.length > 1}
                    collapsed={collapsedCards.has(entry.id)}
                    onZoom={onZoom}
                    onToggleCollapse={toggleCollapse}
                    onDragStart={handleEntryDragStart}
                    onDragEnd={handleEntryDragEnd}
                    dropPosition={getEntryDropPosition(entry.id)}
                  />
                </div>
              ))}
            </div>

            {groupedEntries.groups.map(({ group, entries: groupEntries }) => {
              const isHidden = !group.visible;
              const isDragging = draggingGroupId === group.id;
              const groupDropPos = getGroupDropPosition(group.id);

              return (
                <div key={group.id} className="relative">
                  {groupDropPos === "before" && (
                    <div className="absolute -top-[2px] left-2 right-2 h-[3px] bg-blue-500 rounded-full z-10" />
                  )}
                  <div
                    draggable
                    onDragStart={(e) => handleGroupDragStart(e, group.id)}
                    onDragEnd={handleGroupDragEnd}
                    onDragOver={(e) => handleGroupDragOver(e, group.id)}
                    onDrop={(e) => handleGroupDrop(e, group.id)}
                    className={`group/grp mx-2 mt-2 rounded-xl border border-zinc-200/80 overflow-hidden transition-all duration-150 last:mb-2 ${isHidden ? "opacity-50" : "shadow-[0_1px_3px_rgba(0,0,0,0.04)]"} ${isDragging ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-zinc-50/70 border-b border-zinc-200/50 cursor-grab active:cursor-grabbing">
                      <span className="flex items-center justify-center text-zinc-300">
                        <DotsSixVerticalIcon size={14} weight="bold" />
                      </span>
                      {editingGroupId === group.id ? (
                        <input
                          className="text-[13px] font-semibold text-zinc-800 flex-1 min-w-0 px-1.5 py-0.5 border border-zinc-300 rounded-md outline-none bg-white focus:border-zinc-400 transition-colors"
                          value={group.name}
                          onChange={(e) => updateGroupName(group.id, e.target.value)}
                          onBlur={() => setEditingGroupId(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingGroupId(null);
                            if (e.key === "Escape") setEditingGroupId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-[13px] font-semibold text-zinc-700 flex-1 min-w-0 truncate cursor-pointer group/name select-none"
                          onClick={() => setEditingGroupId(group.id)}
                          title="Click to rename"
                        >
                          {group.name}
                          <PencilIcon
                            size={9}
                            className="inline ml-1 opacity-0 group-hover/name:opacity-40 transition-opacity"
                          />
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-zinc-400 flex-shrink-0 tracking-wide uppercase">
                        {groupEntries.length}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {groupEntries.some((e) => e.result.kind === "valid") && (
                          <button
                            className="flex items-center justify-center size-5 border-none bg-transparent rounded text-zinc-400 cursor-pointer transition-colors duration-100 hover:text-zinc-700 hover:bg-black/5"
                            onClick={() => handleZoomToGroup(groupEntries)}
                            title="Zoom to fit"
                            aria-label="Zoom to fit"
                          >
                            <BoundingBoxIcon size={13} />
                          </button>
                        )}
                        <button
                          className="flex items-center justify-center size-5 border-none bg-transparent rounded text-zinc-400 cursor-pointer transition-colors duration-100 hover:text-zinc-700 hover:bg-black/5"
                          onClick={() => toggleGroupVisibility(group.id)}
                          title={group.visible ? "Hide group" : "Show group"}
                          aria-label={group.visible ? "Hide group" : "Show group"}
                        >
                          {group.visible ? <EyeIcon size={13} /> : <EyeClosedIcon size={13} />}
                        </button>
                        <button
                          className="flex items-center justify-center size-5 border-none bg-transparent rounded text-zinc-400 cursor-pointer transition-colors duration-100 hover:text-red-500 hover:bg-red-500/8"
                          onClick={() => removeGroup(group.id)}
                          title="Remove group"
                          aria-label="Remove group"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="group-body">
                      <div
                        className="group-body-inner py-1 px-1 min-h-[20px]"
                        onDragOver={(e) => handleContainerDragOver(e, group.id)}
                        onDrop={(e) => handleContainerDrop(e, group.id)}
                      >
                        {groupEntries.length === 0 && draggingEntryId && (
                          <div className="text-center py-4 text-[12px] text-zinc-400 border-2 border-dashed border-zinc-200 rounded-lg mx-1">
                            Drop here to add to group
                          </div>
                        )}
                        {groupEntries.map((entry) => (
                          <div
                            key={entry.id}
                            onDragOver={(e) => handleEntryDragOver(e, entry.id, group.id)}
                            onDrop={(e) => handleEntryDrop(e, entry.id, group.id)}
                          >
                            <WktCard
                              id={entry.id}
                              canRemove={entries.length > 1}
                              collapsed={collapsedCards.has(entry.id)}
                              onZoom={onZoom}
                              onToggleCollapse={toggleCollapse}
                              groupVisible={group.visible}
                              onDragStart={handleEntryDragStart}
                              onDragEnd={handleEntryDragEnd}
                              dropPosition={getEntryDropPosition(entry.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {groupDropPos === "after" && (
                    <div className="absolute -bottom-[2px] left-2 right-2 h-[3px] bg-blue-500 rounded-full z-10" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-2 pb-2 flex-shrink-0">
            <button
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200/80 rounded-lg bg-zinc-50/60 text-[12px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors duration-100 cursor-pointer"
              onClick={onOpenJsonDialog}
            >
              <CodeIcon size={13} />
              JSON Import
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
