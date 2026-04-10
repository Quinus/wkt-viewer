import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoredEntry, WktEntry } from "@/features/wkt/types/wkt";
import { DEFAULT_VISIBLE } from "@/features/wkt/types/wkt";
import { parseWkt } from "@/features/wkt/utils/parseWkt";

function createEntry(): WktEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    value: "",
    result: { kind: "idle" },
    visible: DEFAULT_VISIBLE,
  };
}

interface WktStore {
  entries: WktEntry[];
  addEntry: () => void;
  removeEntry: (id: string) => void;
  updateEntryValue: (id: string, value: string) => void;
  updateEntryLabel: (id: string, label: string) => void;
  toggleVisibility: (id: string) => void;
  getEntryById: (id: string) => WktEntry | undefined;
}

export const useWktStore = create<WktStore>()(
  persist(
    (set, get) => ({
      entries: [createEntry()],

      addEntry: () =>
        set((state) => ({ entries: [...state.entries, createEntry()] })),

      removeEntry: (id: string) =>
        set((state) => {
          const next = state.entries.filter((e) => e.id !== id);
          return { entries: next.length === 0 ? [createEntry()] : next };
        }),

      updateEntryValue: (id: string, value: string) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, value, result: parseWkt(value) } : e
          ),
        })),

      updateEntryLabel: (id: string, label: string) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, label } : e
          ),
        })),

      toggleVisibility: (id: string) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, visible: !e.visible } : e
          ),
        })),

      getEntryById: (id: string) => get().entries.find((e) => e.id === id),
    }),
    {
      name: "wkt-viewer-entries",
      partialize: (state) => ({
        entries: state.entries.map((e) => ({
          id: e.id,
          label: e.label,
          value: e.value,
          visible: e.visible,
        } satisfies StoredEntry)),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.entries = state.entries.map((e) => ({
            ...e,
            result: parseWkt(e.value),
          }));
        }
      },
    }
  )
);