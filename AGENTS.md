# Agent Instructions

WKT Viewer - React app for visualizing Well-Known Text geometries on an interactive MapLibre GL map.

## Tech Stack

- React 19 + TypeScript (strict)
- Vite 8 via `vite-plus` (vp CLI)
- MapLibre GL + react-map-gl
- Tailwind CSS 4 (@tailwindcss/vite)
- Zustand + zundo (undo/redo)
- @dnd-kit (drag-and-drop)
- @phosphor-icons/react
- @terraformer/wkt (WKT parsing)

## Commands

All commands use `vp` (vite-plus), not `npm run`:

```bash
vp dev      # Start dev server
vp build    # Production build
vp check    # Lint + format + typecheck (run before commit)
vp preview  # Preview production build
```

**Note**: There are no `npm run lint` or `npm run format` scripts. Use `vp check` or configure editor integration with `.oxlintrc.json` / `.oxfmt.json`.

## Project Structure

```
src/
├── app/              # Entry point (main.tsx, App.tsx)
├── components/       # Shared UI components (src/components/ui/)
├── config/           # Global configuration
├── features/         # Feature-based modules
│   └── wkt/          # WKT feature
│       ├── components/
│       ├── hooks/
│       ├── store/    # Zustand store
│       ├── types/
│       └── utils/
├── hooks/            # Global hooks
├── lib/              # Library utilities
├── styles/           # Global styles
├── types/            # Shared types
└── utils/            # Global utilities
```

## Path Aliases

- `@/*` → `src/*`

Example: `import { WktPanel } from "@/features/wkt/components/WktPanel"`

## Code Style

- **Formatter**: oxfmt via `vp check` (config in vite.config.ts + .oxfmt.json)
  - Double quotes, semicolons, 2-space tabs, trailing commas
- **Linter**: oxlint via `vp check` (config in vite.config.ts + .oxlintrc.json)
  - Plugins: import, typescript, react
  - No console warnings disabled

## CI

GitHub Actions runs `vp check` on PRs to `main`.

## State Management

Uses Zustand with zundo for undo/redo functionality. Store located at `src/features/wkt/store/`.
