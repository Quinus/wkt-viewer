# WKT Viewer

A web application for visualizing Well-Known Text (WKT) geometries on an interactive map.

## Dependencies

### Core
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Mapping
- **MapLibre GL** - Interactive map rendering (open-source fork of Mapbox GL)
- **react-map-gl** - React bindings for MapLibre

### State Management
- **Zustand** - Lightweight state management

### WKT Parsing
- **@terraformer/wkt** - Converts WKT strings to GeoJSON

### Styling
- **Tailwind CSS** - Utility-first CSS framework (via @tailwindcss/vite)

### Icons
- **@phosphor-icons/react** - Icon library

## Technical Decisions

### Why MapLibre GL?
MapLibre GL is used instead of Mapbox GL because it is open-source and does not require an API token for basic usage.

### Why Zustand?
Zustand provides a minimal, hooks-based state management solution without the boilerplate of Context providers or Redux.

### Why feature-based folder structure?
The codebase uses a feature-based organization (`src/features/wkt/`) to co-locate related components, hooks, utilities, and types, making it easier to maintain and test individual features.

### Why Tailwind CSS via Vite plugin?
Using `@tailwindcss/vite` provides a faster development experience with better hot-module replacement compared to the traditional PostCSS setup.

### Path aliases
The `@/*` alias points to `src/*`, enabling cleaner imports like `@/features/wkt/components/WktPanel` instead of relative paths.
