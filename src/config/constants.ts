/**
 * Central configuration for AGS components
 * Contains shared settings and constants
 */

/**
 * Default polling intervals (in milliseconds)
 */
export const POLL_INTERVALS = {
    FAST: 500,        // For responsive UI elements (bar, workspace)
    NORMAL: 2000,     // For most widgets (timers, status)
    SLOW: 5000,       // For system monitoring
    VERY_SLOW: 10000, // For weather, external APIs
} as const;

/**
 * Default window dimensions
 */
export const WINDOW_DIMENSIONS = {
    DASHBOARD: {
        width: 480,
        height: 280,
    },
    LAUNCHER: {
        width: 600,
        height: 400,
    },
    FILE_FINDER: {
        width: 800,
        height: 800,
    },
    CALCULATOR: {
        width: 300,
        height: 400,
    },
} as const;

/**
 * Default result limits
 */
export const RESULT_LIMITS = {
    FILE_SEARCH: 8,
    APP_SEARCH: 10,
    MAX_FILE_RESULTS: 50,
} as const;

/**
 * Icon mappings for consistent icons across components
 */
export const ICONS = {
    // Status icons
    LOADING: "⏳",
    ERROR: "❌",
    SUCCESS: "✅", 
    WARNING: "⚠️",
    INFO: "ℹ️",
    
    // Timer/Chess icons
    CHESS_PENDING: "󰒲   ",
    CHESS_ACTIVE: "   ",
    CHESS_DONE: "✅",
    
    // Media icons
    MUSIC: "󰝚",
    PLAY: "▶",
    PAUSE: "⏸",
    STOP: "⏹",
    
    // System icons
    CPU: "",
    MEMORY: "󰧑",
    TEMPERATURE: "🌡",
    KEYBOARD: "",
    
    // File type icons
    FILE_GENERIC: "text-x-generic",
    FILE_PDF: "application-pdf",
    FILE_IMAGE: "image-x-generic",
    FILE_AUDIO: "audio-x-generic",
    FILE_VIDEO: "video-x-generic",
    FILE_ARCHIVE: "application-x-archive",
    FILE_CODE: "text-x-script",
} as const;

/**
 * CSS class names for consistent styling
 */
export const CSS_CLASSES = {
    // Widget states
    WIDGET: "widget",
    WIDGET_ACTIVE: "active",
    WIDGET_INACTIVE: "inactive",
    WIDGET_LOADING: "loading",
    WIDGET_ERROR: "error",
    
    // Layout classes
    CONTAINER: "container",
    CARD: "card",
    BUTTON: "button",
    LABEL: "label",
    
    // Size variants
    SIZE_SMALL: "small",
    SIZE_MEDIUM: "medium", 
    SIZE_LARGE: "large",
    
    // Color variants
    PRIMARY: "primary",
    SECONDARY: "secondary",
    ACCENT: "accent",
    MUTED: "muted",
} as const;

/**
 * Script names for consistent script execution
 */
export const SCRIPTS = {
    // Hyprland scripts
    WORKSPACE: "hyprctl-workspace.sh",
    WINDOW: "hyprctl-window.sh",
    MONITORS: "hyprctl-monitors.sh",
    
    // Media scripts  
    MEDIA_PLAYER: "media-player.sh",
    
    // System scripts
    SYSTEM_UTILS: "system-utils.sh",
    AUDIO_CONTROL: "audio-control.sh",
    FILE_FINDER: "file-finder.sh",
    
    // Dashboard scripts
    FLOWMODORO: "flowmodoro.sh",
    CHESS_TRACKING: "timewarriorchess.sh",
    WPM_COUNTER: "get_wpm.sh",
    MONITORING: "monitor.sh",
    WEATHER: "checkDay.sh",
    LAUNCHER_TOGGLE: "launcher-toggle.sh",
    SHUTDOWN_TOGGLE: "shutdown-toggle.sh",
    TASKMANAGER_TOGGLE: "taskmanager-toggle.sh",
} as const;

/**
 * Default component props
 */
export const DEFAULT_PROPS = {
    monitor: 0,
    visible: true,
    className: "",
} as const;