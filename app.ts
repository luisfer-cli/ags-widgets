/**
 * Main application entry point for AGS Desktop Shell
 *
 * Initializes and starts all shell components:
 * - Top bar with workspace indicators
 * - Dashboard with system widgets
 * - Bottom bar with media information
 * - OSD for volume feedback
 * - Notification system
 */
import app from "ags/gtk4/app";
import style from "./src/styles/style.scss";

// Import all components
import Bar from "./src/components/bar/Bar";
import Dashboard from "./src/components/dashboard/Dashboard";
import Botbar from "./src/components/misc/Botbar";
import Osd from "./src/components/osd/Osd";
import NotificationPopups from "./src/components/notifications/NotificationPopups";

/**
 * Application startup configuration
 */
app.start({
  css: style,
  main() {
    // Log current GTK theme for debugging
    console.log("AGS Desktop Shell starting with theme:", app.get_gtk_theme());

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

    console.log("AGS Desktop Shell components initialized successfully");
  },
});

