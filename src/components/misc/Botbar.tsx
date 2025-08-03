/**
 * Bottom bar component with split cava visualization and center media info
 * Layout: [Cava Left] [Media Info] [Cava Right]
 */
import { Astal, Gtk } from "ags/gtk4";
import { ComponentProps } from "../../types";
import CavaVisualizerWidget from "./CavaVisualizerWidget";
import MediaInfoWidget from "./MediaInfoWidget";

/**
 * Bottom bar component with three-section layout
 * @param monitor - Monitor number to display on (default: 0)
 * @returns JSX window element
 */
export default function Botbar({ monitor = 0 }: ComponentProps = {}) {
    const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

    return (
        <window
            class="botbar"
            name="botbar"
            monitor={monitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={BOTTOM | LEFT | RIGHT}
            visible
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                hexpand
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.FILL}
                class="botbar-box"
                spacing={16}
            >
                {/* Left Cava Visualizer */}
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    halign={Gtk.Align.START}
                    class="botbar-section left"
                >
                    <CavaVisualizerWidget monitor={monitor} position="left" />
                </box>
                
                {/* Left Separator */}
                <label
                    label="│"
                    class="botbar-separator"
                />
                
                {/* Center Media Information */}
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    halign={Gtk.Align.CENTER}
                    hexpand
                    class="botbar-section center"
                >
                    <MediaInfoWidget monitor={monitor} />
                </box>
                
                {/* Right Separator */}
                <label
                    label="│"
                    class="botbar-separator"
                />
                
                {/* Right Cava Visualizer */}
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    halign={Gtk.Align.END}
                    class="botbar-section right"
                >
                    <CavaVisualizerWidget monitor={monitor} position="right" />
                </box>
            </box>
        </window>
    );
}