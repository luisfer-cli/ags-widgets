# AGENTS.md - AGS Desktop Shell Configuration

## Build/Test Commands
- `ags` - Run AGS shell with this configuration
- No traditional build/lint/test commands - AGS handles compilation directly

## Code Style Guidelines

### TypeScript & Imports
- Use strict mode with ES2022 modules, ES2020 target, bundler resolution
- AGS framework: `import { Astal, Gtk } from "ags/gtk4"`
- Process/time: `import { execAsync } from "ags/process"`, `import { createPoll } from "ags/time"`
- Local: `import { ComponentProps } from "../types"`, `import { formatTime } from "../utils"`

### Components & Types
- Default export: `export default function ComponentName({ prop }: Props = {})`
- Props extend `ComponentProps` interface with optional `monitor`, `className`, `visible`
- Use AGS elements: `<window>`, `<box>`, `<label>`, `<button>` etc.
- Component state via polling: `createPoll(interval, callback)`

### Naming & Documentation
- camelCase for variables/functions, PascalCase for components/types
- Comprehensive JSDoc for all functions: purpose, params, returns
- File headers explaining component purpose and features
- Interface documentation for complex types

### Error Handling & Utils
- Use `safeJsonParse(json, fallback)` for JSON parsing
- Async script execution via `executeScript(scriptName)` helper
- Console.error for debugging, graceful fallbacks for failures