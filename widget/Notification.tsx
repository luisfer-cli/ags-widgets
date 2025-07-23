import { createState } from "ags";
import { Gtk, Astal } from "ags/gtk4";
import GLib from "gi://GLib";

type Notification = {
    id: number;
    title: string;
    body: string;
    icon?: string;
    visible: boolean;
};

export default function NotificationManager() {
    // Estado con la lista de notificaciones
    const [notifications, setNotifications] = createState<Notification[]>([]);

    let nextId = 1;

    // Función para agregar notificación
    function addNotification(title: string, body: string, icon?: string, duration = 4000) {
        const id = nextId++;
        setNotifications((prev) => [...prev, { id, title, body, icon, visible: true }]);

        // Timer para ocultar y borrar la notificación
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, duration, () => {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, visible: false } : n))
            );

            // Después de ocultar, eliminarla
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
                return GLib.SOURCE_REMOVE;
            });

            return GLib.SOURCE_REMOVE;
        });
    }

    // Para probar, puedes llamar addNotification manualmente o exponerla
    // Por ejemplo:
    // addNotification("Hola", "Esto es una notificación", "dialog-information");

    return (
        <>
            {notifications((list) =>
                list.map(({ id, title, body, icon, visible }) =>
                    visible ? (
                        <window
                            name={`notif-${id}`}
                            layer={Astal.Layer.OVERLAY}
                            margin_top={10 + 70 * id} // para apilar notifs una abajo de otra
                            margin_right={10}
                            visible={visible}
                            class="notification-window"
                        >
                            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
                                {icon && <image icon_name={icon} />}
                                <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                                    <label class="notification-title" label={title} />
                                    <label class="notification-body" label={body} />
                                </box>
                            </box>
                        </window>
                    ) : null
                )
            )}
        </>
    );
}

