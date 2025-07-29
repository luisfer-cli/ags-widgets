/**
 * Shared components and UI primitives
 */
import { Gtk } from "ags/gtk4";
import { ComponentProps } from "../types";

/**
 * Reusable label component with consistent styling
 */
export interface LabelProps extends ComponentProps {
    text: string;
    icon?: string;
    size?: 'small' | 'medium' | 'large';
    weight?: 'normal' | 'bold';
    color?: 'primary' | 'secondary' | 'accent' | 'muted';
}

export function Label({
    text,
    icon,
    size = 'medium',
    weight = 'normal',
    color = 'primary',
    className = '',
    ...props
}: LabelProps) {
    const classes = `label ${size} ${weight} ${color} ${className}`.trim();

    if (icon) {
        return (
            <box 
                class={classes}
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={4}
                {...props}
            >
                <label label={icon} class="label-icon" />
                <label label={text} class="label-text" />
            </box>
        );
    }

    return (
        <label 
            label={text} 
            class={classes}
            {...props}
        />
    );
}

/**
 * Reusable button component with consistent styling
 */
export interface ButtonProps extends ComponentProps {
    label: string;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: () => void;
}

export function Button({
    label,
    icon,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    onClick,
    className = '',
    ...props
}: ButtonProps) {
    const classes = `button ${variant} ${size} ${disabled ? 'disabled' : ''} ${className}`.trim();

    return (
        <button
            class={classes}
            onClicked={disabled ? undefined : onClick}
            {...props}
        >
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={6}>
                {icon && <label label={icon} class="button-icon" />}
                <label label={label} class="button-label" />
            </box>
        </button>
    );
}

/**
 * Reusable card/container component
 */
export interface CardProps extends ComponentProps {
    children: any;
    padding?: 'none' | 'small' | 'medium' | 'large';
    variant?: 'default' | 'elevated' | 'outlined';
    interactive?: boolean;
    onClick?: () => void;
}

export function Card({
    children,
    padding = 'medium',
    variant = 'default',
    interactive = false,
    onClick,
    className = '',
    ...props
}: CardProps) {
    const classes = `card ${variant} ${padding} ${interactive ? 'interactive' : ''} ${className}`.trim();

    if (interactive && onClick) {
        return (
            <button class={classes} onClicked={onClick} {...props}>
                {children}
            </button>
        );
    }

    return (
        <box class={classes} {...props}>
            {children}
        </box>
    );
}

/**
 * Reusable loading spinner component
 */
export interface SpinnerProps extends ComponentProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
}

export function Spinner({
    size = 'medium',
    text,
    className = '',
    ...props
}: SpinnerProps) {
    const classes = `spinner ${size} ${className}`.trim();

    return (
        <box 
            class={classes}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            {...props}
        >
            <label label="⏳" class="spinner-icon" />
            {text && <label label={text} class="spinner-text" />}
        </box>
    );
}

/**
 * Reusable error display component
 */
export interface ErrorProps extends ComponentProps {
    message: string;
    icon?: string;
    retry?: () => void;
}

export function Error({
    message,
    icon = "❌",
    retry,
    className = '',
    ...props
}: ErrorProps) {
    const classes = `error ${className}`.trim();

    return (
        <box 
            class={classes}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={12}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            {...props}
        >
            <label label={icon} class="error-icon" />
            <label label={message} class="error-message" />
            {retry && (
                <Button
                    label="Retry"
                    variant="secondary"
                    size="small"
                    onClick={retry}
                />
            )}
        </box>
    );
}