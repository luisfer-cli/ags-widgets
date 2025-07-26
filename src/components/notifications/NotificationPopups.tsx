/**
 * Notification popups system for AGS Desktop Shell
 * Manages and displays desktop notifications with auto-dismiss functionality
 */
import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd";
import Notification from "./Notification";
import { createBinding, For, createState, onCleanup } from "ags";
import { getFocusedMonitor } from "../../utils";
import GLib from "gi://GLib";

/**
 * Main notification popup manager
 * Handles notification lifecycle and display across multiple monitors
 * @returns JSX For component managing notification windows
 */
export default function NotificationPopups() {
    // Notification daemon instance
    const notifd = AstalNotifd.get_default();

    // State management for active notifications and focused monitor
    const [notifications, setNotifications] = createState(
        new Array<AstalNotifd.Notification>()
    );
    const [focusedMonitor, setFocusedMonitor] = createState(0);

    // Update focused monitor periodically
    const updateFocusedMonitor = async () => {
        const monitor = await getFocusedMonitor();
        setFocusedMonitor(monitor);
    };

    // Update focused monitor immediately and every 500ms
    updateFocusedMonitor();
    const monitorUpdateInterval = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        updateFocusedMonitor();
        return GLib.SOURCE_CONTINUE;
    });

    // Cleanup interval on component unmount
    onCleanup(() => {
        GLib.Source.remove(monitorUpdateInterval);
    });

    /**
     * Handle new notifications
     * Manages notification replacement and auto-dismiss timers
     */
    const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
        const notification = notifd.get_notification(id);

        if (replaced && notifications.get().some(n => n.id === id)) {
            // Replace existing notification
            setNotifications((ns) =>
                ns.map((n) => (n.id === id ? notification : n))
            );
        } else {
            // Add new notification to the beginning of the list
            setNotifications((ns) => [notification, ...ns]);

            // Auto-dismiss after 5 seconds (except critical notifications)
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
                setNotifications((ns) =>
                    ns.filter((n) => n.id !== notification.id)
                );
                return GLib.SOURCE_REMOVE;
            });
        }
    });

    /**
     * Handle notification resolution/dismissal
     */
    const resolvedHandler = notifd.connect("resolved", (_, id) => {
        setNotifications((ns) => ns.filter((n) => n.id !== id));
    });

    // Cleanup event handlers on component unmount
    onCleanup(() => {
        notifd.disconnect(notifiedHandler);
        notifd.disconnect(resolvedHandler);
        GLib.Source.remove(monitorUpdateInterval);
    });

    return (
        <window
            class="NotificationPopups"
            monitor={focusedMonitor}
            visible={notifications((ns) => ns.length > 0)}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
        >
            <box orientation={Gtk.Orientation.VERTICAL}>
                <For each={notifications}>
                    {(notification) =>
                        Notification({
                            notification,
                            onHoverLost: () =>
                                setNotifications((ns) =>
                                    ns.filter((n) => n.id !== notification.id)
                                )
                        })
                    }
                </For>
            </box>
        </window>
    );
}
