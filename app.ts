/**
 * Main application entry point for AGS Desktop Shell
 *
 * Initializes and starts all shell components:
 * - Top bar with workspace indicators
 * - Dashboard with system widgets
 * - Bottom bar with media information
 * - OSD for volume feedback
 * - Notification system
 * - Application launcher
 * - File finder
 */
import app from "ags/gtk4/app";
import style from "./src/styles/style.css";
import GLib from "gi://GLib";
import { getFocusedMonitor } from "./src/utils";

// Import all components
import Bar from "./src/components/bar/Bar";
import Dashboard from "./src/components/dashboard/Dashboard";
import Botbar from "./src/components/misc/Botbar";
import ShutdownPopup from "./src/components/misc/Shutdown";
import Calculator from "./src/components/misc/Calculator";
import Calendar from "./src/components/misc/Calendar";
import TaskManagerMenu from "./src/components/misc/TaskManagerMenu";
import Osd from "./src/components/osd/Osd";
import NotificationPopups from "./src/components/notifications/NotificationPopups";
import { Launcher, FileFinder } from "./src/components/launcher";

// Global window references for toggle functionality
let launcherWindow: any;
let fileFinderWindow: any;
let calculatorWindow: any;
let calendarWindow: any;
let shutdownWindow: any;
let taskManagerWindow: any;

/**
 * Application startup configuration with request handler for launcher toggle
 */
app.start({
  css: style,
  requestHandler(request, res) {
    const [, argv] = GLib.shell_parse_argv(request);
    if (!argv) return res("argv parse error");

    switch (argv[0]) {
      case "toggle":
        // Get focused monitor and update launcher position
        getFocusedMonitor().then((focusedMonitor) => {
          const window = launcherWindow;
          if (window) {
            // Update monitor before toggling visibility
            window.monitor = focusedMonitor;
            window.set_visible(!window.visible);
          }
        });
        return res("ok");
      case "toggle-launcher":
        getFocusedMonitor().then((focusedMonitor) => {
          const launcherWin = launcherWindow;
          if (launcherWin) {
            launcherWin.monitor = focusedMonitor;
            launcherWin.set_visible(!launcherWin.visible);
          }
        });
        return res("launcher toggled");
      case "toggle-filefinder":
        getFocusedMonitor().then((focusedMonitor) => {
          const fileFinderWin = fileFinderWindow;
          if (fileFinderWin) {
            fileFinderWin.monitor = focusedMonitor;
            fileFinderWin.set_visible(!fileFinderWin.visible);
          }
        });
        return res("filefinder toggled");
      case "toggle-calculator":
        getFocusedMonitor().then((focusedMonitor) => {
          const calculatorWin = calculatorWindow;
          if (calculatorWin) {
            calculatorWin.monitor = focusedMonitor;
            calculatorWin.set_visible(!calculatorWin.visible);
          }
        });
        return res("calculator toggled");
      case "toggle-shutdown":
        // Toggle shutdown popup using global function
        if (typeof (globalThis as any).toggleShutdown === "function") {
          (globalThis as any).toggleShutdown();
        }
        return res("shutdown toggled");
      case "toggle-taskmanager":
        getFocusedMonitor().then((focusedMonitor) => {
          const taskManagerWin = taskManagerWindow;
          if (taskManagerWin) {
            taskManagerWin.monitor = focusedMonitor;
            taskManagerWin.set_visible(!taskManagerWin.visible);
          }
        });
        return res("taskmanager toggled");
      case "calendar":
        getFocusedMonitor().then((focusedMonitor) => {
          const calendarWin = calendarWindow;
          if (calendarWin) {
            calendarWin.monitor = focusedMonitor;
            calendarWin.set_visible(!calendarWin.visible);
          }
        });
        return res("calendar toggled");
      default:
        return res("unknown command");
    }
  },
  main() {
    // Initialize all components on primary monitor
    const primaryMonitor = 0;

    // Top bar with workspaces and current app
    Bar({ monitor: primaryMonitor });

    // Main dashboard with widgets
    Dashboard({ monitor: primaryMonitor });

    // On-screen display for volume feedback
    Osd();

    // Bottom bar with media information
    Botbar({ monitor: primaryMonitor });

    // Notification popup system
    NotificationPopups();

    // Application launcher (initially hidden)
    launcherWindow = Launcher({
      monitor: primaryMonitor,
      visible: false,
    });

    // File finder (initially hidden)
    fileFinderWindow = FileFinder({
      monitor: primaryMonitor,
      visible: false,
    });

    // Calculator (initially hidden)
    calculatorWindow = Calculator({
      monitor: primaryMonitor,
      visible: false,
    });

    // Shutdown popup (initially hidden)
    shutdownWindow = ShutdownPopup({
      monitor: primaryMonitor,
      visible: false,
    });

    // Task manager menu (initially hidden)
    taskManagerWindow = TaskManagerMenu({
      monitor: primaryMonitor,
      visible: false,
      onTaskAction: (action) => {
        console.log(`Task action: ${action}`);
      },
    });

    // Calendar widget (initially hidden)
    calendarWindow = Calendar({
      monitor: primaryMonitor,
      visible: false,
    });
  },
});
