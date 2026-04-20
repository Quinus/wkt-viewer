import { useState, useCallback, useEffect, useRef } from "react";
import { lazy, Suspense } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CodeIcon, SquaresFourIcon, PlusIcon, FolderPlusIcon } from "@phosphor-icons/react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { WktCard } from "./WktCard";
import { WktPanelToolbar } from "./WktPanelToolbar";
import { WktGroupCard } from "./WktGroupCard";
import { WktCollapsedPanel } from "./WktCollapsedPanel";
import { useGroupedEntries, useDndActions } from "@/features/wkt/hooks/useDnd";

const JsonDialog = lazy(() => import("./JsonDialog").then((m) => ({ default: m.JsonDialog })));
const ShareDialog = lazy(() => import("./ShareDialog").then((m) => ({ default: m.ShareDialog })));

interface WktPanelProps {
  onZoom: (id: string) => void;
  onZoomToBbox?: (bbox: [number, number, number, number]) => void;
}

export function WktPanel({ onZoom, onZoomToBbox }: WktPanelProps) {
  const entries = useWktStore((s) => s.entries);
  const groups = useWktStore((s) => s.groups);
  const addEntry = useWktStore((s) => s.addEntry);
  const createEmptyGroup = useWktStore((s) => s.createEmptyGroup);

  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const previousValidIds = useRef<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { handleDragEnd } = useDndActions();
  const groupedEntries = useGroupedEntries();

  useEffect(() => {
    const currentValidIds = new Set<string>();
    for (const entry of entries) {
      if (entry.result.kind === "valid") {
        currentValidIds.add(entry.id);
        if (!previousValidIds.current.has(entry.id)) {
          onZoom(entry.id);
        }
      }
    }
    previousValidIds.current = currentValidIds;
  }, [entries, onZoom]);

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
  }, [allCollapsed, entries]);

  const hasAnyContent = groupedEntries.ungrouped.length > 0 || groupedEntries.groups.length > 0;
  const canRemoveEntry = useCallback((_id: string) => entries.length > 1, [entries.length]);

  const handleCreateGroup = useCallback(() => {
    const groupNumber = groups.length + 1;
    createEmptyGroup(`Group ${groupNumber}`);
  }, [groups.length, createEmptyGroup]);

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      handleDragEnd(activeId, overId);
    },
    [handleDragEnd],
  );

  // Get active item for drag overlay
  const activeEntry = activeId ? entries.find((e) => e.id === activeId) : null;
  const activeGroup = activeId ? groups.find((g) => g.id === activeId) : null;

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full flex flex-col bg-white/[0.98] backdrop-blur-xl border-r border-zinc-200/70 shadow-[0_0_60px_rgba(0,0,0,0.08)] transition-[width] duration-300 ease-out z-10 ${panelCollapsed ? "w-12" : "w-88"}`}
      >
        <WktPanelToolbar
          collapsed={panelCollapsed}
          allCollapsed={allCollapsed}
          hasAnyContent={hasAnyContent}
          onToggleCollapse={() => setPanelCollapsed((c) => !c)}
          onToggleCollapseAll={toggleCollapseAll}
          onAddEntry={addEntry}
          onCreateGroup={handleCreateGroup}
          onOpenShareDialog={() => setShareDialogOpen(true)}
        />

        {panelCollapsed ? (
          <WktCollapsedPanel groupedEntries={groupedEntries} onZoom={onZoom} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <>
              <div className="flex-1 overflow-y-auto panel-scroll">
                {/* Empty state */}
                {!hasAnyContent && (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 mb-4">
                      <SquaresFourIcon size={28} weight="thin" className="text-indigo-300" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-zinc-700 mb-1">
                      No geometries yet
                    </h3>
                    <p className="text-[12px] text-zinc-400 mb-4">
                      Add your first WKT geometry to get started
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[12px] font-medium hover:bg-indigo-700 transition-colors"
                        onClick={addEntry}
                      >
                        <PlusIcon size={14} weight="bold" />
                        Add Geometry
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-[12px] font-medium hover:bg-zinc-200 transition-colors"
                        onClick={handleCreateGroup}
                      >
                        <FolderPlusIcon size={14} weight="bold" />
                        New Group
                      </button>
                    </div>
                  </div>
                )}

                {/* Ungrouped entries section */}
                <SortableContext
                  items={groupedEntries.ungrouped.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="px-3 py-3 space-y-2">
                    {groupedEntries.ungrouped.map((entry) => (
                      <WktCard
                        key={entry.id}
                        id={entry.id}
                        canRemove={canRemoveEntry(entry.id)}
                        collapsed={collapsedCards.has(entry.id)}
                        onZoom={onZoom}
                        onToggleCollapse={toggleCollapse}
                      />
                    ))}
                  </div>
                </SortableContext>

                {/* Groups section */}
                <SortableContext
                  items={groupedEntries.groups.map((g) => g.group.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 px-3 pb-3">
                    {groupedEntries.groups.map(({ group, entries: groupEntries }) => (
                      <WktGroupCard
                        key={group.id}
                        group={group}
                        entries={groupEntries}
                        canRemoveEntry={canRemoveEntry}
                        collapsedCards={collapsedCards}
                        onToggleCollapse={toggleCollapse}
                        onZoom={onZoom}
                        onZoomToBbox={onZoomToBbox ?? (() => {})}
                        editingGroupId={editingGroupId}
                        onSetEditingGroupId={setEditingGroupId}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>

              {/* Footer */}
              <div className="px-3 py-2 flex-shrink-0 border-t border-zinc-200/60 bg-gradient-to-b from-transparent to-zinc-50/50">
                <button
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-100/80 text-[12px] font-medium text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-800 transition-all duration-150 group"
                  onClick={() => setJsonDialogOpen(true)}
                >
                  <div className="flex items-center justify-center size-5 rounded-md bg-white shadow-sm text-zinc-500 group-hover:text-indigo-600 transition-colors">
                    <CodeIcon size={12} weight="bold" />
                  </div>
                  <span>Import from JSON</span>
                </button>
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeId && activeEntry && (
                  <div className="opacity-80 rotate-2 scale-105">
                    <WktCard
                      id={activeEntry.id}
                      canRemove={canRemoveEntry(activeEntry.id)}
                      collapsed={true}
                      onZoom={onZoom}
                      onToggleCollapse={() => {}}
                    />
                  </div>
                )}
                {activeId && activeGroup && (
                  <div className="opacity-80 rotate-2 scale-105">
                    <WktGroupCard
                      group={activeGroup}
                      entries={
                        groupedEntries.groups.find((g) => g.group.id === activeGroup.id)?.entries ??
                        []
                      }
                      canRemoveEntry={canRemoveEntry}
                      collapsedCards={collapsedCards}
                      onToggleCollapse={toggleCollapse}
                      onZoom={onZoom}
                      onZoomToBbox={onZoomToBbox ?? (() => {})}
                      editingGroupId={editingGroupId}
                      onSetEditingGroupId={setEditingGroupId}
                    />
                  </div>
                )}
              </DragOverlay>
            </>
          </DndContext>
        )}
      </aside>

      <Suspense>
        <JsonDialog open={jsonDialogOpen} onClose={() => setJsonDialogOpen(false)} />
        <ShareDialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} />
      </Suspense>
    </>
  );
}
