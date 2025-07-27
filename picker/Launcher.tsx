import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import AstalApps from "gi://AstalApps"
import Graphene from "gi://Graphene"

export default function Launcher() {
    let contentbox: Gtk.Box
    let searchentry: Gtk.Entry
    let win: Astal.Window

    const apps = new AstalApps.Apps()
    const [list, setList] = createState(new Array<AstalApps.Application>())

    function search(text: string) {
        if (text === "") setList([])
        else setList(apps.fuzzy_query(text).slice(0, 8))
    }

    function launch(app?: AstalApps.Application) {
        if (app) {
            win.hide()
            app.launch()
        }
    }

    // close on ESC
    // handle alt + number key
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

    // close on clickaway
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
            class="launcher"
            name="launcher"
            anchor={0.5}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            onNotifyVisible={({ visible }) => {
                const context = contentbox.get_style_context()

                if (visible) {
                    context?.remove_class("animate-in")
                    context?.add_class("animate-in")
                    searchentry.grab_focus()
                } else {
                    searchentry.set_text("")
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
                    placeholderText="Start typing to search"
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
                                        // Espera unos milisegundos antes de aplicar la clase visible
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
