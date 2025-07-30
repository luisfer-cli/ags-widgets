/**
 * Central component exports
 * Provides a single entry point for all AGS components
 */

// Bar components
export { default as Bar } from './bar/Bar';

// Dashboard components  
export { default as Dashboard } from './dashboard/Dashboard';
export { default as ChessTracking } from './dashboard/ChessTracking';
export { default as Clock } from './dashboard/Clock';
export { default as Media } from './dashboard/Media';
export { default as Monitoring } from './dashboard/Monitoring';
export { default as Other } from './dashboard/Other';
export { default as Programming } from './dashboard/Programming';
export { default as TimeTracking } from './dashboard/TimeTracking';
export { default as Weather } from './dashboard/Weather';
export { default as WpmCounter } from './dashboard/WpmCounter';
export { default as Zk } from './dashboard/Zk';

// Launcher components
export { default as FileFinder } from './launcher/FileFinder';
export { default as Launcher } from './launcher/Launcher';

// Misc components
export { default as AudioConfig } from './misc/AudioConfig';
export { default as Botbar } from './misc/Botbar';
export { default as Calculator } from './misc/Calculator';
export { default as Shutdown } from './misc/Shutdown';

// Notification components
export { default as Notification } from './notifications/Notification';
export { default as NotificationPopups } from './notifications/NotificationPopups';

// OSD components
export { default as Osd } from './osd/Osd';

// Common/shared components
export * from './common';
export { default as StatusWidget } from './common/StatusWidget';

// Barrel exports for compatibility
export * from './bar';
export * from './dashboard';
export * from './notifications';
export * from './osd';
export * from './misc';
export * from './launcher';