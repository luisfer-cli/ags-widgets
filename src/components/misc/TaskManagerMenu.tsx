/**
 * Task Manager Menu Component
 * 
 * Example implementation of PopupMenu for taskwarrior/timewarrior integration.
 * Provides a base structure that can be extended with actual task management functionality.
 */
import { useState } from "ags"
import PopupMenu, { MenuOption } from "./PopupMenu"
import { ComponentProps } from "../../types"
import { ICONS } from "../../config/constants"

export interface TaskManagerMenuProps extends ComponentProps {
    onTaskAction?: (action: string, data?: any) => void;
}

/**
 * Task management popup menu - ready for taskwarrior/timewarrior integration
 */
export default function TaskManagerMenu({
    monitor = 0,
    className = "",
    visible = false,
    onTaskAction
}: TaskManagerMenuProps = {}) {
    
    // Sample menu options - replace with actual taskwarrior/timewarrior functionality
    const menuOptions: MenuOption[] = [
        {
            id: "new-task",
            label: "New Task",
            icon: "➕",
            shortcut: "Ctrl+N",
            action: () => {
                console.log("Creating new task...")
                onTaskAction?.("new-task")
            }
        },
        {
            id: "list-tasks",
            label: "List Active Tasks",
            icon: "📋",
            shortcut: "Ctrl+L",
            action: () => {
                console.log("Listing active tasks...")
                onTaskAction?.("list-tasks")
            }
        },
        {
            id: "start-timer",
            label: "Start Time Tracking",
            icon: "⏱️",
            shortcut: "Ctrl+T",
            action: () => {
                console.log("Starting time tracking...")
                onTaskAction?.("start-timer")
            }
        },
        {
            id: "stop-timer",
            label: "Stop Time Tracking",
            icon: "⏹️",
            shortcut: "Ctrl+S",
            action: () => {
                console.log("Stopping time tracking...")
                onTaskAction?.("stop-timer")
            }
        },
        {
            id: "view-reports",
            label: "View Reports",
            icon: "📊",
            shortcut: "Ctrl+R",
            action: () => {
                console.log("Viewing reports...")
                onTaskAction?.("view-reports")
            }
        },
        {
            id: "quick-entry",
            label: "Quick Task Entry",
            icon: "⚡",
            shortcut: "Ctrl+Q",
            action: () => {
                console.log("Quick task entry...")
                onTaskAction?.("quick-entry")
            }
        },
        {
            id: "sync-tasks",
            label: "Sync Tasks",
            icon: "🔄",
            shortcut: "Ctrl+Y",
            action: () => {
                console.log("Syncing tasks...")
                onTaskAction?.("sync-tasks")
            }
        },
        {
            id: "settings",
            label: "Task Settings",
            icon: "⚙️",
            shortcut: "Ctrl+,",
            action: () => {
                console.log("Opening task settings...")
                onTaskAction?.("settings")
            }
        }
    ]

    return (
        <PopupMenu
            monitor={monitor}
            className={`task-manager-menu ${className}`}
            visible={visible}
            options={menuOptions}
            title="Task Manager"
            onClose={() => console.log("Task menu closed")}
        />
    )
}