# AGENTS.md - AGS Desktop Shell Configuration

## Project Structure
```
src/
├── components/          # React-like components
│   ├── bar/            # Top bar components  
│   ├── dashboard/      # Dashboard widgets
│   ├── notifications/  # Notification system
│   ├── osd/           # On-screen display
│   └── misc/          # Miscellaneous components
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
└── styles/            # SCSS stylesheets
```

## Build/Test Commands
This is an AGS (Aylur's GTK Shell) configuration project - no traditional build/lint/test commands.
AGS handles compilation and execution directly via `ags` command.

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled with ES2022 modules and ES2020 target
- JSX with React syntax using "ags/gtk4" as jsxImportSource
- Comprehensive type definitions in `src/types/index.ts`

### Import Conventions
- AGS framework: `import { Astal, Gtk } from "ags/gtk4"`
- Utilities: `import { execAsync } from "ags/process"`, `import { createPoll } from "ags/time"`
- Local types: `import { ComponentProps, BarStatus } from "../types"`
- Local utils: `import { formatTime, safeJsonParse } from "../utils"`
- Components: Use barrel exports from index files

### Component Structure
- Components accept props interface extending `ComponentProps`
- All components have comprehensive JSDoc comments
- Default export pattern: `export default function ComponentName({ props }: PropsInterface = {})`
- Components use AGS custom elements (`<window>`, `<box>`, `<label>`, etc.)

### Documentation Standards
- JSDoc comments for all functions and components
- Interface documentation for complex types
- Inline comments for business logic
- File header comments explaining component purpose