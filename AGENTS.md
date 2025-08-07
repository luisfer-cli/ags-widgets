# AGENTS.md - AGS Desktop Shell Configuration

## Build/Test Commands
- `ags` - Run AGS shell with this configuration
- `ags --quit` - Stop running AGS instance
- No traditional build/lint/test commands - AGS handles TypeScript compilation directly

## Code Style Guidelines

### TypeScript & Imports
- Use strict mode with ES2022 modules, ES2020 target, bundler resolution
- JSX: `jsxImportSource: "ags/gtk4"` for React-style components
- AGS framework: `import { Gtk } from "ags/gtk4"`, `import { createPoll } from "ags/time"`
- Utils: `import { executeScript, executeJsonScript } from "../utils"` or `import { useScript } from "../utils/hooks"`
- Config: `import { POLL_INTERVALS, SCRIPTS, CSS_CLASSES, ICONS } from "../config/constants"`
- Types: `import { ComponentProps } from "../types"`

### Script Execution & Architecture
- ALL bash commands must be in separate .sh files in `/scripts/` directory
- Use `executeScript(scriptName, ...args)` for one-off script execution
- Use `executeJsonScript<T>(scriptName, ...args)` for typed JSON responses
- Use `useScript<T>(scriptName, interval, fallback)` hook for polling data
- Use constants from `config/constants.ts` for script names, intervals, CSS classes, and icons
- Scripts should return JSON when possible, plain text wrapped in `{text: value}` otherwise

### Components & State Management
- Default export: `export default function ComponentName({ monitor = 0 }: ComponentProps = {})`
- Use `createPoll()` for simple reactive data: `const time = createPoll("", 1000, () => new Date().toLocaleTimeString())`
- Use hooks for complex polling: `const data = useScript<DataType>(SCRIPTS.SCRIPT_NAME, POLL_INTERVALS.NORMAL, fallback)`
- Consistent styling: Use CSS_CLASSES and ICONS constants with semantic class names
- Error states: Return `null` silently from utils, provide fallback data in components
- JSX syntax: `<box orientation={Gtk.Orientation.VERTICAL}><label label={text} class="my-class" /></box>`

### File Organization & Naming
- Components in `/src/components/` with category subdirectories (bar/, dashboard/, launcher/, misc/, etc.)
- Scripts in `/scripts/` directory (executable .sh files)
- Types in `/src/types/index.ts` with clear interfaces
- Utils in `/src/utils/` with hooks in separate `hooks.ts` file
- Constants in `/src/config/constants.ts` for shared configuration
- Component filenames: PascalCase (Clock.tsx, Dashboard.tsx)

### Error Handling & Performance
- Utils return `null` silently on errors - no logging
- Implement graceful fallbacks for all external dependencies
- Use appropriate polling intervals: FAST (500ms), NORMAL (2s), SLOW (5s), VERY_SLOW (10s)
- Avoid direct `execAsync` calls - use `executeScript`/`executeJsonScript` wrappers instead