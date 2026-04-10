# Agent Instructions

This file contains information for AI agents working on this codebase.

## Project Overview

WKT Viewer is a React-based web application for visualizing Well-Known Text (WKT) geometries on an interactive map using MapLibre GL.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Map Rendering**: MapLibre GL + react-map-gl
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4 (via @tailwindcss/vite)
- **Icons**: @phosphor-icons/react
- **WKT Parsing**: @terraformer/wkt

## Development Tools

### Linting (oxlint)

This project uses [oxlint](https://oxc.rs/docs/guide/usage/linter.html) for fast JavaScript/TypeScript linting.

**Configuration**: `.oxlintrc.json`

**Scripts**:
```bash
npm run lint      # Check for linting issues
npm run lint:fix  # Auto-fix linting issues
```

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

**Scripts**:
```bash
npm run format       # Format all files
npm run format:check # Check formatting without fixing
```

## Project Structure

```
src/
├── app/              # App entry point
│   ├── App.tsx       # Root component
│   └── main.tsx      # Entry point
├── config/           # Configuration (map settings, etc.)
├── features/         # Feature-based modules
│   └── wkt/          # WKT feature module
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       ├── store/        # Zustand store
│       ├── types/        # TypeScript types
│       └── utils/        # Utility functions
├── styles/           # Global styles
└── types/            # Shared types
```

## Path Aliases

- `@/*` → `src/*`

Example: `import { WktPanel } from "@/features/wkt/components/WktPanel"`

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

## Build Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Git Workflow

- Main branch: `main`
- Format and lint code before committing
