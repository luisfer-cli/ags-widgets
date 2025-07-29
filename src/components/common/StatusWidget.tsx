/**
 * Reusable status widget component
 * Provides consistent styling and behavior for status displays
 */
import { With } from "ags";
import { Gtk } from "ags/gtk4";
import { ComponentProps, WidgetStatus } from "../../types";
import { getStatusIcon } from "../../utils";

export interface StatusWidgetProps extends ComponentProps {
    label: string;
    status?: WidgetStatus;
    icon?: string;
    loading?: boolean;
    error?: boolean;
    onClick?: () => void;
}

/**
 * Reusable status widget component
 * @param props - Widget properties
 * @returns JSX box element
 */
export default function StatusWidget({
    label,
    status = 'inactive',
    icon,
    loading = false,
    error = false,
    onClick,
    className = '',
    ...props
}: StatusWidgetProps) {
    const displayIcon = icon || getStatusIcon(status);
    const widgetStatus = error ? 'error' : loading ? 'loading' : status;
    const displayLabel = error ? '❌ Error' : loading ? '⏳ Loading...' : label;

    const content = (
        <box
            class={`widget status-widget ${widgetStatus} ${className}`.trim()}
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={6}
            hexpand
            {...props}
        >
            {displayIcon && (
                <label label={displayIcon} class="widget-icon" />
            )}
            <label 
                label={displayLabel} 
                class="widget-label" 
                hexpand 
            />
        </box>
    );

    return onClick ? (
        <button onClick={onClick} class="widget-button">
            {content}
        </button>
    ) : content;
}

/**
 * Higher-order component for creating polling status widgets
 */
export interface PollingStatusWidgetProps extends ComponentProps {
    scriptName: string;
    interval?: number;
    fallback?: any;
    formatLabel: (data: any) => string;
    formatIcon?: (data: any) => string;
    formatStatus?: (data: any) => WidgetStatus;
    onClick?: () => void;
}

/**
 * Creates a status widget that polls a script for data
 */
export function createPollingStatusWidget({
    scriptName,
    interval = 1000,
    fallback = null,
    formatLabel,
    formatIcon,
    formatStatus,
    onClick,
    ...props
}: PollingStatusWidgetProps) {
    // This would need to import useScript hook, but avoiding circular dependency
    // Will be used in specific components instead
    return function PollingStatusWidget() {
        return (
            <StatusWidget
                label="Implement in component"
                onClick={onClick}
                {...props}
            />
        );
    };
}