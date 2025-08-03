/**
 * Widget de clima ultra minimalista para pantalla de 7"
 */
import { Gtk } from "ags/gtk4";
import { WeatherData } from "../../types";
import { useScript } from "../../utils/hooks";
import { POLL_INTERVALS, SCRIPTS, ICONS } from "../../config/constants";

/**
 * Componente de clima ultra minimalista
 * @returns JSX box element
 */
export default function Weather() {
    const weatherData = useScript<WeatherData>(
        SCRIPTS.WEATHER,
        POLL_INTERVALS.VERY_SLOW,
        { temperature: "+--°C", condition: "--", icon: ICONS.WEATHER }
    );

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={4}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            class="weather-widget-minimal"
        >
            <label
                label={weatherData.as((data) => data?.icon || ICONS.WEATHER)}
                class="weather-icon-large"
                halign={Gtk.Align.CENTER}
            />
            <label
                label={weatherData.as((data) => data?.temperature || "+--°C")}
                class="weather-temp-large"
                halign={Gtk.Align.CENTER}
            />
        </box>
    );
}