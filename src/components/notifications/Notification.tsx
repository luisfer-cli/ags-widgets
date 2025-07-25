/**
 * Individual notification component
 * Displays notification content with interactive elements and hover handling
 */
import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import Adw from "gi://Adw";
import GLib from "gi://GLib";
import AstalNotifd from "gi://AstalNotifd";
import Pango from "gi://Pango";

/**
 * Check if icon exists in current theme
 */
function isIcon(icon?: string | null): boolean {
    const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
    return icon ? iconTheme.has_icon(icon) : false;
}

/**
 * Check if file exists at given path
 */
function fileExists(path: string): boolean {
    return GLib.file_test(path, GLib.FileTest.EXISTS);
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: number, format = "%H:%M"): string {
    return GLib.DateTime.new_from_unix_local(timestamp).format(format)!;
}

/**
 * Get urgency class name from notification urgency level
 */
function getUrgencyClass(notification: AstalNotifd.Notification): string {
    const { LOW, NORMAL, CRITICAL } = AstalNotifd.Urgency;
    
    switch (notification.urgency) {
        case LOW:
            return "low";
        case CRITICAL:
            return "critical";
        case NORMAL:
        default:
            return "normal";
    }
}

// Component props interface
interface NotificationProps {
    notification: AstalNotifd.Notification;
    onHoverLost: () => void;
}

/**
 * Individual notification display component
 * @param notification - The notification data to display
 * @param onHoverLost - Callback when mouse leaves notification
 * @returns JSX notification element
 */
export default function Notification({ 
    notification: n, 
    onHoverLost 
}: NotificationProps) {
    let dismissed = false;

    // Handle mouse leave events for auto-dismiss
    const motionController = Gtk.EventControllerMotion.new();
    motionController.connect("leave", () => {
        if (!dismissed) {
            onHoverLost();
        }
    });

    return (
        <Adw.Clamp maximumSize={400}>
            <box
                widthRequest={400}
                class={`Notification ${getUrgencyClass(n)}`}
                orientation={Gtk.Orientation.VERTICAL}
            >
                {/* Add motion controller for hover detection */}
                {motionController}

                {/* Notification header with app info and close button */}
                <box class="header">
                    {/* App icon display */}
                    {(n.appIcon || isIcon(n.desktopEntry)) && (
                        <image
                            class="app-icon"
                            visible={Boolean(n.appIcon || n.desktopEntry)}
                            iconName={n.appIcon || n.desktopEntry}
                        />
                    )}
                    
                    {/* App name */}
                    <label
                        class="app-name"
                        halign={Gtk.Align.START}
                        ellipsize={Pango.EllipsizeMode.END}
                        label={n.appName || "Unknown"}
                    />
                    
                    {/* Timestamp */}
                    <label
                        class="time"
                        hexpand
                        halign={Gtk.Align.END}
                        label={formatTime(n.time)}
                    />
                    
                    {/* Close button */}
                    <button
                        onClicked={() => {
                            dismissed = true;
                            n.dismiss(); // Triggers 'resolved' event
                            onHoverLost(); // Remove from state if not already handled
                        }}
                    >
                        <image iconName="window-close-symbolic" />
                    </button>
                </box>

                <Gtk.Separator visible />

                {/* Notification content */}
                <box class="content">
                    {/* Image handling - file or icon */}
                    {n.image && fileExists(n.image) && (
                        <image 
                            valign={Gtk.Align.START} 
                            class="image" 
                            file={n.image} 
                        />
                    )}
                    
                    {n.image && isIcon(n.image) && (
                        <box valign={Gtk.Align.START} class="icon-image">
                            <image
                                iconName={n.image}
                                halign={Gtk.Align.CENTER}
                                valign={Gtk.Align.CENTER}
                            />
                        </box>
                    )}

                    {/* Text content */}
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        {/* Summary/title */}
                        <label
                            class="summary"
                            halign={Gtk.Align.START}
                            xalign={0}
                            label={n.summary}
                            ellipsize={Pango.EllipsizeMode.END}
                        />
                        
                        {/* Body text */}
                        {n.body && (
                            <label
                                class="body"
                                wrap
                                useMarkup
                                halign={Gtk.Align.START}
                                xalign={0}
                                justify={Gtk.Justification.FILL}
                                label={n.body}
                            />
                        )}
                    </box>
                </box>

                {/* Action buttons */}
                {n.actions.length > 0 && (
                    <box class="actions">
                        {n.actions.map(({ label, id }) => (
                            <button 
                                hexpand 
                                onClicked={() => n.invoke(id)}
                            >
                                <label 
                                    label={label} 
                                    halign={Gtk.Align.CENTER} 
                                    hexpand 
                                />
                            </button>
                        ))}
                    </box>
                )}
            </box>
        </Adw.Clamp>
    );
}