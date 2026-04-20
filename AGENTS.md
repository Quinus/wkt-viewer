# Agent Instructions

WKT Viewer - React app for visualizing Well-Known Text (WKT) geometries on an interactive map using MapLibre GL.

## Tech Stack

- **Framework**: React 19 with TypeScript (strict)
- **Build Tool**: Vite 8 via `vite-plus` (vp CLI)
- **Map Rendering**: MapLibre GL + react-map-gl
- **State Management**: Zustand + zundo (undo/redo)
- **Styling**: Tailwind CSS 4 (@tailwindcss/vite)
- **Icons**: @phosphor-icons/react
- **WKT Parsing**: @terraformer/wkt
- **Drag-and-Drop**: @dnd-kit

## Commands

All commands use `vp` (vite-plus), not `npm run`:

```bash
vp dev      # Start dev server
vp build    # Production build
vp check    # Lint + format + typecheck (run before commit)
vp preview  # Preview production build
```

**Note**: There are no `npm run lint` or `npm run format` scripts. Use `vp check` or configure editor integration with `.oxlintrc.json` / `.oxfmt.json`.

## Development Tools

### Linting (oxlint)

This project uses [oxlint](https://oxc.rs/docs/guide/usage/linter.html) for fast JavaScript/TypeScript linting.

**Configuration**: `.oxlintrc.json`

**Enabled plugins**:

- `import` - Import/export rules
- `typescript` - TypeScript-specific rules
- `react` - React-specific rules

### Formatting (oxfmt)

This project uses [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) for fast code formatting.

**Configuration**: `.oxfmt.json`

**Key settings**:

- Semicolons: enabled
- Single quotes: disabled (use double quotes)
- Tab width: 2 spaces
- Trailing commas: all
- Print width: 100

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

## Coding Conventions

1. **TypeScript**: Use strict typing, avoid `any`
2. **React**: Use functional components with hooks
3. **Imports**: Use path aliases for cross-module imports
4. **Naming**:
   - Components: PascalCase
   - Hooks: camelCase with `use` prefix
   - Utils: camelCase
   - Types/Interfaces: PascalCase
5. **State**: Use Zustand for global state, React hooks for local state

## CI

GitHub Actions runs `vp check` on PRs to `main`.

## State Management

Uses Zustand with zundo for undo/redo functionality. Store located at `src/features/wkt/store/`.
