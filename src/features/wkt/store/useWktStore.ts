import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import type { StoredEntry, WktEntry, WktGroup } from "@/features/wkt/types/wkt";
import { DEFAULT_VISIBLE, DEFAULT_OPACITY } from "@/features/wkt/types/wkt";
import { parseWkt } from "@/features/wkt/utils/parseWkt";
import { COLORS } from "@/features/wkt/utils/colors";

function createEntry(index: number, groupId: string | null = null): WktEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    value: "",
    result: { kind: "idle" },
    visible: DEFAULT_VISIBLE,
    color: COLORS[index % COLORS.length],
    opacity: DEFAULT_OPACITY,
    groupId,
  };
}

function createGroup(name: string, entryIds: string[]): WktGroup {
  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    entryIds,
  };
}

interface WktStore {
  entries: WktEntry[];
  groups: WktGroup[];
  addEntry: () => void;
  addEntries: (items: { label: string; value: string }[], groupName?: string) => void;
  removeEntry: (id: string) => void;
  removeGroup: (id: string) => void;
  updateEntryValue: (id: string, value: string) => void;
  updateEntryLabel: (id: string, label: string) => void;
  updateGroupName: (id: string, name: string) => void;
  toggleVisibility: (id: string) => void;
  toggleGroupVisibility: (id: string) => void;
  getEntryById: (id: string) => WktEntry | undefined;
  moveEntryToGroup: (entryId: string, groupId: string | null, targetIndex?: number) => void;
  createEmptyGroup: (name: string) => void;
  reorderEntry: (entryId: string, beforeEntryId: string | null) => void;
  reorderGroup: (groupId: string, beforeGroupId: string | null) => void;
  reorderEntryInGroup: (entryId: string, newIndex: number) => void;
  reorderGroupToIndex: (groupId: string, newIndex: number) => void;
}

export const useWktStore = create<WktStore>()(
  persist(
    temporal(
      (set, get) => ({
        entries: [createEntry(0)],
        groups: [],

        addEntry: () =>
          set((state) => ({
            entries: [...state.entries, createEntry(state.entries.length)],
          })),

        addEntries: (items, groupName) =>
          set((state) => {
            const newEntryIds: string[] = [];
            const newEntries = items.map((item, i) => {
              const id = crypto.randomUUID();
              newEntryIds.push(id);
              return {
                id,
                label: item.label,
                value: item.value,
                result: parseWkt(item.value),
                visible: DEFAULT_VISIBLE,
                color: COLORS[(state.entries.length + i) % COLORS.length],
                opacity: DEFAULT_OPACITY,
                groupId: null as string | null,
              };
            });

            if (groupName && newEntries.length > 0) {
              const group = createGroup(groupName, newEntryIds);
              newEntries.forEach((e) => (e.groupId = group.id));
              return {
                entries: [...state.entries, ...newEntries],
                groups: [...state.groups, group],
              };
            }

            return {
              entries: [...state.entries, ...newEntries],
            };
          }),

        removeEntry: (id: string) =>
          set((state) => {
            const entry = state.entries.find((e) => e.id === id);
            let nextEntries = state.entries.filter((e) => e.id !== id);
            let nextGroups = state.groups;

            // Remove from group if part of one
            if (entry?.groupId) {
              nextGroups = state.groups.map((g) =>
                g.id === entry.groupId
                  ? { ...g, entryIds: g.entryIds.filter((eid) => eid !== id) }
                  : g,
              );
              // Remove empty groups
              nextGroups = nextGroups.filter(
                (g) => g.entryIds.length > 0 || g.id !== entry.groupId,
              );
            }

            if (nextEntries.length === 0) {
              nextEntries = [createEntry(0)];
            }

            return { entries: nextEntries, groups: nextGroups };
          }),

        removeGroup: (id: string) =>
          set((state) => {
            // Remove all entries in this group and the group itself
            const nextEntries = state.entries.filter((e) => e.groupId !== id);
            const nextGroups = state.groups.filter((g) => g.id !== id);

            if (nextEntries.length === 0) {
              return {
                entries: [createEntry(0)],
                groups: nextGroups,
              };
            }

            return { entries: nextEntries, groups: nextGroups };
          }),

        updateEntryValue: (id: string, value: string) =>
          set((state) => ({
            entries: state.entries.map((e) =>
              e.id === id ? { ...e, value, result: parseWkt(value) } : e,
            ),
          })),

        updateEntryLabel: (id: string, label: string) =>
          set((state) => ({
            entries: state.entries.map((e) => (e.id === id ? { ...e, label } : e)),
          })),

        updateGroupName: (id: string, name: string) =>
          set((state) => ({
            groups: state.groups.map((g) => (g.id === id ? { ...g, name } : g)),
          })),

        toggleVisibility: (id: string) =>
          set((state) => ({
            entries: state.entries.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e)),
          })),

        toggleGroupVisibility: (id: string) =>
          set((state) => {
            const group = state.groups.find((g) => g.id === id);
            if (!group) return state;

            const newVisible = !group.visible;
            return {
              groups: state.groups.map((g) => (g.id === id ? { ...g, visible: newVisible } : g)),
              entries: state.entries.map((e) =>
                e.groupId === id ? { ...e, visible: newVisible } : e,
              ),
            };
          }),

        getEntryById: (id: string) => get().entries.find((e) => e.id === id),

        moveEntryToGroup: (entryId: string, groupId: string | null, targetIndex?: number) =>
          set((state) => {
            const entry = state.entries.find((e) => e.id === entryId);
            if (!entry) return state;

            const oldGroupId = entry.groupId;
            let nextGroups = state.groups;

            // Remove from old group
            if (oldGroupId) {
              nextGroups = nextGroups.map((g) =>
                g.id === oldGroupId
                  ? { ...g, entryIds: g.entryIds.filter((eid) => eid !== entryId) }
                  : g,
              );
              // Clean up empty groups (except when moving within same group)
              if (oldGroupId !== groupId) {
                nextGroups = nextGroups.filter((g) => g.id !== oldGroupId || g.entryIds.length > 0);
              }
            }

            // Add to new group at target index
            if (groupId) {
              nextGroups = nextGroups.map((g) => {
                if (g.id !== groupId) return g;
                const newEntryIds = [...g.entryIds];
                const insertIndex =
                  targetIndex !== undefined
                    ? Math.min(targetIndex, newEntryIds.length)
                    : newEntryIds.length;
                newEntryIds.splice(insertIndex, 0, entryId);
                return { ...g, entryIds: newEntryIds };
              });
            }

            return {
              entries: state.entries.map((e) => (e.id === entryId ? { ...e, groupId } : e)),
              groups: nextGroups,
            };
          }),

        createEmptyGroup: (name: string) =>
          set((state) => {
            const group = createGroup(name, []);
            return { groups: [...state.groups, group] };
          }),

        reorderEntry: (entryId: string, beforeEntryId: string | null) =>
          set((state) => {
            const entry = state.entries.find((e) => e.id === entryId);
            if (!entry) return state;

            const groupId = entry.groupId;

            if (groupId) {
              // Reorder within group
              const group = state.groups.find((g) => g.id === groupId);
              if (!group) return state;

              const newEntryIds = group.entryIds.filter((id) => id !== entryId);
              const insertIndex = beforeEntryId
                ? newEntryIds.indexOf(beforeEntryId)
                : newEntryIds.length;
              if (insertIndex === -1) return state;
              newEntryIds.splice(insertIndex, 0, entryId);

              return {
                groups: state.groups.map((g) =>
                  g.id === groupId ? { ...g, entryIds: newEntryIds } : g,
                ),
              };
            } else {
              // Reorder ungrouped entries
              const newEntries = state.entries.filter((e) => e.id !== entryId);
              const insertIndex = beforeEntryId
                ? newEntries.findIndex((e) => e.id === beforeEntryId && e.groupId === null)
                : newEntries.filter((e) => e.groupId === null).length;

              if (insertIndex === -1) return state;

              // Find original entry and insert at new position
              const entryToMove = state.entries.find((e) => e.id === entryId);
              if (!entryToMove) return state;

              // For ungrouped, we need to find the right position in the full array
              // Get all ungrouped entries in order
              const ungroupedEntries = newEntries.filter((e) => e.groupId === null);
              const beforeIndex = beforeEntryId
                ? ungroupedEntries.findIndex((e) => e.id === beforeEntryId)
                : ungroupedEntries.length;

              if (beforeIndex === -1) return state;

              // Reconstruct the entries array
              const groupedEntries = newEntries.filter((e) => e.groupId !== null);
              const reorderedUngrouped = [
                ...ungroupedEntries.slice(0, beforeIndex),
                entryToMove,
                ...ungroupedEntries.slice(beforeIndex),
              ];

              return { entries: [...groupedEntries, ...reorderedUngrouped] };
            }
          }),

        reorderGroup: (groupId: string, beforeGroupId: string | null) =>
          set((state) => {
            const group = state.groups.find((g) => g.id === groupId);
            if (!group) return state;

            const newGroups = state.groups.filter((g) => g.id !== groupId);
            const insertIndex = beforeGroupId
              ? newGroups.findIndex((g) => g.id === beforeGroupId)
              : newGroups.length;

            if (insertIndex === -1) return state;

            newGroups.splice(insertIndex, 0, group);
            return { groups: newGroups };
          }),

        reorderEntryInGroup: (entryId: string, newIndex: number) =>
          set((state) => {
            const entry = state.entries.find((e) => e.id === entryId);
            if (!entry) return state;

            const groupId = entry.groupId;

            if (groupId) {
              // Reorder within group
              const group = state.groups.find((g) => g.id === groupId);
              if (!group) return state;

              const currentIndex = group.entryIds.indexOf(entryId);
              if (currentIndex === -1 || currentIndex === newIndex) return state;

              const newEntryIds = [...group.entryIds];
              newEntryIds.splice(currentIndex, 1);
              newEntryIds.splice(newIndex, 0, entryId);

              return {
                groups: state.groups.map((g) =>
                  g.id === groupId ? { ...g, entryIds: newEntryIds } : g,
                ),
              };
            } else {
              // Reorder ungrouped entries
              const ungrouped = state.entries.filter((e) => e.groupId === null);
              const currentIndex = ungrouped.findIndex((e) => e.id === entryId);
              if (currentIndex === -1 || currentIndex === newIndex) return state;

              const newUngrouped = [...ungrouped];
              newUngrouped.splice(currentIndex, 1);
              newUngrouped.splice(newIndex, 0, entry);

              const grouped = state.entries.filter((e) => e.groupId !== null);
              return { entries: [...grouped, ...newUngrouped] };
            }
          }),

        reorderGroupToIndex: (groupId: string, newIndex: number) =>
          set((state) => {
            const group = state.groups.find((g) => g.id === groupId);
            if (!group) return state;

            const currentIndex = state.groups.findIndex((g) => g.id === groupId);
            if (currentIndex === -1 || currentIndex === newIndex) return state;

            const newGroups = [...state.groups];
            newGroups.splice(currentIndex, 1);
            newGroups.splice(newIndex, 0, group);

            return { groups: newGroups };
          }),
      }),
      {
        limit: 50,
        partialize: (state) => {
          const { entries, groups } = state as WktStore;
          return { entries, groups };
        },
      },
    ),
    {
      name: "wkt-viewer-entries",
      partialize: (state) => ({
        entries: state.entries.map(
          (e) =>
            ({
              id: e.id,
              label: e.label,
              value: e.value,
              visible: e.visible,
              color: e.color,
              opacity: e.opacity,
              groupId: e.groupId,
            }) satisfies StoredEntry,
        ),
        groups: state.groups,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.entries = state.entries.map((e, i) => ({
            ...e,
            result: parseWkt(e.value),
            color: (e.color as WktEntry["color"]) || COLORS[i % COLORS.length],
            opacity: e.opacity ?? DEFAULT_OPACITY,
          }));
        }
      },
    },
  ),
);
