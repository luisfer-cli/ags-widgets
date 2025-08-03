/**
 * Reloj ultra compacto con fecha en español
 */
import { createPoll } from "ags/time";
import { Gtk } from "ags/gtk4";
import { ICONS } from "../../config/constants";

/**
 * Componente de reloj ultra compacto para pantalla de 7"
 * @returns JSX box element
 */
export default function Clock() {
    // Poll para la hora cada segundo
    const time = createPoll("", 1000, () => {
        const now = new Date();
        return now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    });

    const date = createPoll("", 60000, () => {
        const now = new Date();
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
    });

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={0}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
        >
            <label 
                label={time} 
                class="clock-time-ultra-compact"
                halign={Gtk.Align.CENTER}
            />
            <label 
                label={date} 
                class="clock-date-ultra-compact"
                halign={Gtk.Align.CENTER}
            />
        </box>
    );
}