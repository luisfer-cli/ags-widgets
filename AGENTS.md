# AGENTS.md - AGS Desktop Shell Configuration

## Build/Test Commands
- `ags` - Run AGS shell with this configuration
- No traditional build/lint/test commands - AGS handles compilation directly

## Code Style Guidelines

### TypeScript & Imports
- Use strict mode with ES2022 modules, ES2020 target, bundler resolution
- AGS framework: `import { Astal, Gtk } from "ags/gtk4"`, `import { With } from "ags"`
- Utils: `import { useScript, executeScript } from "../utils"` or `import { useScript } from "../utils/hooks"`
- Config: `import { POLL_INTERVALS, SCRIPTS, CSS_CLASSES } from "../config/constants"`
- Types: `import { ComponentProps, ChessStatus } from "../types"`

### Script Execution & Architecture
- ALL bash commands must be in separate .sh files in `/scripts/` directory
- Use `executeScript(scriptName, ...args)` for one-off script execution
- Use `useScript<T>(scriptName, interval, fallback)` hook for polling data
- Use constants from `config/constants.ts` for script names, intervals, and CSS classes
- Scripts should return JSON when possible, plain text otherwise

### Components & State Management
- Default export: `export default function ComponentName({ monitor = 0 }: ComponentProps = {})`
- Use hooks for polling: `const data = useScript<DataType>(SCRIPTS.SCRIPT_NAME, POLL_INTERVALS.NORMAL, fallback)`
- Consistent styling: Use CSS_CLASSES constants and semantic class names
- Error states: Always provide fallback data and error handling
- Use `<With value={data}>` pattern for reactive rendering

### File Organization
- Components in `/src/components/` with category subdirectories
- Scripts in `/scripts/` directory (executable .sh files)
- Types in `/src/types/index.ts` with clear interfaces
- Utils in `/src/utils/` with hooks in separate file
- Constants in `/src/config/constants.ts` for shared configuration

### Error Handling & Performance
- Use `try/catch` in scripts with meaningful error messages
- Implement graceful fallbacks for all external dependencies
- Use appropriate polling intervals from POLL_INTERVALS constants
- Avoid direct `execAsync` calls - use script wrappers instead