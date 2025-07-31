/**
 * FlowModoro Dashboard with Integrated Popup Menu
 * Example of how to use the integrated popup menu in your dashboard
 */
import { Gtk } from "ags/gtk4";
import { useState } from "ags";
import PopupMenu from "../misc/PopupMenu";
import TimeTracking from "./TimeTracking";
import { ComponentProps } from "../../types";

/**
 * Enhanced Dashboard with FlowModoro Popup Integration
 */
export default function DashboardWithPopup({ monitor = 0 }: ComponentProps = {}) {
    const [showPopup, setShowPopup] = useState(false);

    const handlePopupToggle = () => {
        setShowPopup(!showPopup);
    };

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    return (
        <>
            {/* Main Dashboard Content */}
            <box 
                class="dashboard-with-popup" 
                orientation={Gtk.Orientation.VERTICAL} 
                spacing={16}
            >
                {/* Header with Popup Toggle Button */}
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
                    <label label="🍅 FlowModoro Dashboard" class="dashboard-title" hexpand />
                    <button 
                        class="popup-toggle-button"
                        label="⚡ Actions"
                        onClicked={handlePopupToggle}
                        tooltip_text="Open FlowModoro command menu (Ctrl+Space)"
                    />
                </box>

                {/* Time Tracking Widget */}
                <TimeTracking monitor={monitor} />

                {/* Quick Stats */}
                <box class="quick-stats" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
                    <button class="stat-button" onClicked={handlePopupToggle}>
                        <label label="📊 Analytics" />
                    </button>
                    <button class="stat-button" onClicked={handlePopupToggle}>
                        <label label="📋 Tasks" />
                    </button>
                    <button class="stat-button" onClicked={handlePopupToggle}>
                        <label label="⚡ Quick Actions" />
                    </button>
                </box>

                {/* Keyboard Shortcut Hint */}
                <label 
                    label="Press Ctrl+Space for command menu" 
                    class="shortcut-hint"
                />
            </box>

            {/* Integrated Popup Menu */}
            <PopupMenu
                visible={showPopup}
                monitor={monitor}
                mode="flowmodoro"
                title="🍅 FlowModoro Command Center"
                onClose={handlePopupClose}
            />
        </>
    );
}