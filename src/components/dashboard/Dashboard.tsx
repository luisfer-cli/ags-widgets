/**
 * Main dashboard window component
 * 
 * Layout:
 * Row 1: Clock, WPM Counter, Zettelkasten widget
 * Row 2: Chess Tracking + Programming widgets, System Monitoring
 */
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import Clock from "./Clock";
import WpmCounter from "./WpmCounter";
import ChessTracking from "./ChessTracking";
import Programming from "./Programming";
import Monitoring from "./Monitoring";
import Zk from "./Zk";

/**
 * Dashboard component with grid layout of widgets
 * @param monitor - Monitor number to display on (default: 0)
 * @returns JSX window element
 */
export default function Dashboard({ monitor = 0 }: ComponentProps = {}) {
    return (
        <window
            name="dashboard"
            monitor={monitor}
            visible={true}
            class="dashboard"
            width-request={480}
            height-request={280}
        >
            <box 
                orientation={Gtk.Orientation.VERTICAL} 
                spacing={20} 
                halign={Gtk.Align.CENTER} 
                valign={Gtk.Align.CENTER}
            >
                {/* Top row: Clock, WPM, Zettelkasten */}
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={20}>
                    <box class="widget clock">
                        <Clock />
                    </box>
                    <box class="widget">
                        <WpmCounter />
                    </box>
                    <box hexpand>
                        <Zk />
                    </box>
                </box>

                {/* Bottom row: Chess/Programming column, Monitoring */}
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={20}>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
                        <box>
                            <ChessTracking />
                        </box>
                        <box class="widget">
                            <Programming />
                        </box>
                    </box>
                    <box class="widget">
                        <Monitoring />
                    </box>
                </box>
            </box>
        </window>
    );
}