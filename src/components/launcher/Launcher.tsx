/**
 * Application Launcher Component
 * 
 * Provides fuzzy search functionality for system applications with keyboard navigation.
 * Integrated from standalone picker into the main AGS system.
 */
import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import AstalApps from "gi://AstalApps"
import Graphene from "gi://Graphene"
import { ComponentProps } from "../../types"

export interface LauncherProps extends ComponentProps {
    maxResults?: number;
}

/**
 * Application launcher with fuzzy search and keyboard navigation
 */
export default function Launcher({ 
    monitor = 0, 
    className = "", 
    visible = false,
    maxResults = 8
}: LauncherProps = {}) {
    let contentbox: Gtk.Box
    let searchentry: Gtk.Entry
    let win: Astal.Window

    const apps = new AstalApps.Apps()
    const [list, setList] = createState(new Array<AstalApps.Application>())

    /**
     * Search applications using fuzzy matching
     */
    function search(text: string) {
        if (text === "") setList([])
        else setList(apps.fuzzy_query(text).slice(0, maxResults))
    }

    /**
     * Launch selected application and hide launcher
     */
    function launch(app?: AstalApps.Application) {
        if (app) {
            win.hide()
            app.launch()
        }
    }

    /**
     * Handle keyboard events - ESC to close, Enter to launch first result
     */
    function onKey(
        _e: Gtk.EventControllerKey,
        keyval: number,
        _: number,
        mod: number,
    ) {
        if (keyval === Gdk.KEY_Escape) {
            win.visible = false
            return
        }
    }

    /**
     * Close launcher when clicking outside content area
     */
    function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
        const [, rect] = contentbox.compute_bounds(win)
        const position = new Graphene.Point({ x, y })

        if (!rect.contains_point(position)) {
            win.visible = false
            return true
        }
    }

    return (
        <window
            $={(ref) => (win = ref)}
            class={`launcher ${className}`}
            name="launcher"
            anchor={0.5}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            visible={visible}
            monitor={monitor}
            onNotifyVisible={({ visible }) => {
                const context = contentbox.get_style_context()

                if (visible) {
                    context?.remove_class("animate-in")
                    context?.add_class("animate-in")
                    searchentry.grab_focus()
                } else {
                    searchentry.set_text("")
                    setList([])
                }
            }}
        >
            <Gtk.EventControllerKey onKeyPressed={onKey} />
            <Gtk.GestureClick onPressed={onClick} />
            <box
                $={(ref) => (contentbox = ref)}
                name="launcher-content"
                height_request={800}
                width_request={800}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                orientation={Gtk.Orientation.VERTICAL}
            >
                <entry
                    $={(ref) => (searchentry = ref)}
                    onNotifyText={({ text }) => search(text)}
                    onActivate={() => launch(list.get()[0])}
                    hexpand
                    placeholderText="Start typing to search applications..."
                />
                <Gtk.Separator visible={list((l) => l.length > 0)} />
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                >
                    <For each={list}>
                        {(app) => {
                            let button: Gtk.Button

                            return (
                                <button
                                    class="app"
                                    $={(ref) => {
                                        button = ref
                                        // Add visible class with slight delay for animation
                                        setTimeout(() => button.get_style_context()?.add_class("visible"), 100)
                                    }}
                                    onClicked={() => launch(app)}
                                >
                                    <box>
                                        <image iconName={app.iconName} />
                                        <label label={app.name} maxWidthChars={40} wrap />
                                    </box>
                                </button>
                            )
                        }}
                    </For>
                </box>
            </box>
        </window>
    )
}