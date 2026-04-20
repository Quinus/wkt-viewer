import { useMemo, useCallback } from "react";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import type { WktEntry, WktGroup } from "@/features/wkt/types/wkt";

interface GroupedEntries {
  groups: Array<{ group: WktGroup; entries: WktEntry[] }>;
  ungrouped: WktEntry[];
}

export function useGroupedEntries() {
  const entries = useWktStore((s) => s.entries);
  const groups = useWktStore((s) => s.groups);

  const groupedEntries = useMemo<GroupedEntries>(() => {
    const entryById = new Map(entries.map((entry) => [entry.id, entry] as const));

    const ungrouped = entries.filter((entry) => entry.groupId === null);

    const orderedGroups = groups.map((group) => ({
      group,
      entries: group.entryIds
        .map((entryId) => entryById.get(entryId))
        .filter((entry): entry is WktEntry => entry !== undefined),
    }));

    return { groups: orderedGroups, ungrouped };
  }, [entries, groups]);

  return groupedEntries;
}

export function useDndActions() {
  const moveEntryToGroup = useWktStore((s) => s.moveEntryToGroup);
  const reorderEntryInGroup = useWktStore((s) => s.reorderEntryInGroup);
  const reorderGroupToIndex = useWktStore((s) => s.reorderGroupToIndex);

  const handleDragEnd = useCallback(
    (activeId: string, overId: string | null) => {
      if (!overId || activeId === overId) return;

      // Get fresh state from store
      const store = useWktStore.getState();
      const entries = store.entries;
      const groups = store.groups;

      const activeEntry = entries.find((e) => e.id === activeId);
      if (!activeEntry) {
        // It's a group - reorder groups
        const activeGroupIndex = groups.findIndex((g) => g.id === activeId);
        const overGroupIndex = groups.findIndex((g) => g.id === overId);
        if (
          activeGroupIndex !== -1 &&
          overGroupIndex !== -1 &&
          activeGroupIndex !== overGroupIndex
        ) {
          reorderGroupToIndex(activeId, overGroupIndex);
        }
        return;
      }

      // It's an entry
      const overEntry = entries.find((e) => e.id === overId);

      if (overEntry) {
        // Dropping over another entry
        const activeGroupId = activeEntry.groupId;
        const overGroupId = overEntry.groupId;

        if (activeGroupId === overGroupId) {
          // Same container - reorder within container
          if (activeGroupId) {
            // Within a group - use the group's entryIds order
            const group = groups.find((g) => g.id === activeGroupId);
            if (group) {
              const oldIndex = group.entryIds.indexOf(activeId);
              const overIndex = group.entryIds.indexOf(overId);

              if (oldIndex === -1 || overIndex === -1) return;
              if (oldIndex === overIndex) return;

              // When moving down (to a higher index), we need to add 1 to the target
              // because removing the item first shifts everything up
              let newIndex = overIndex;
              if (oldIndex < overIndex) {
                newIndex = overIndex + 1;
              }

              reorderEntryInGroup(activeId, newIndex);
            }
          } else {
            // Ungrouped - use the ungrouped entries order
            const ungrouped = entries.filter((e) => e.groupId === null);
            const oldIndex = ungrouped.findIndex((e) => e.id === activeId);
            const overIndex = ungrouped.findIndex((e) => e.id === overId);

            if (oldIndex === -1 || overIndex === -1) return;
            if (oldIndex === overIndex) return;

            let newIndex = overIndex;
            if (oldIndex < overIndex) {
              newIndex = overIndex + 1;
            }

            reorderEntryInGroup(activeId, newIndex);
          }
        } else {
          // Different containers - move to new group at the target position
          const overGroup = groups.find((g) => g.id === overGroupId);
          if (overGroup) {
            const overIndex = overGroup.entryIds.indexOf(overId);
            moveEntryToGroup(activeId, overGroupId, overIndex);
          } else {
            moveEntryToGroup(activeId, overGroupId);
          }
        }
      } else {
        // Dropping over a group container directly
        const overGroup = groups.find((g) => g.id === overId);
        if (overGroup) {
          moveEntryToGroup(activeId, overGroup.id);
        }
      }
    },
    [moveEntryToGroup, reorderEntryInGroup, reorderGroupToIndex],
  );

  return { handleDragEnd };
}

/**
 * Returns entries in panel order (top to bottom).
 * Items at the top of the panel are drawn on top (rendered last).
 */
export function useEntriesInRenderOrder(): WktEntry[] {
  const entries = useWktStore((s) => s.entries);
  const groups = useWktStore((s) => s.groups);

  return useMemo(() => {
    const orderedEntries: WktEntry[] = [];

    // First, add entries from groups (bottom of panel)
    groups.forEach((group) => {
      group.entryIds.forEach((entryId) => {
        const entry = entries.find((e) => e.id === entryId);
        if (entry) {
          orderedEntries.push(entry);
        }
      });
    });

    // Then add ungrouped entries (top of panel)
    const ungrouped = entries.filter((e) => e.groupId === null);
    ungrouped.forEach((entry) => {
      orderedEntries.push(entry);
    });

    return orderedEntries;
  }, [entries, groups]);
}
