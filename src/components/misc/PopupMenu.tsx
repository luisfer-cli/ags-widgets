/**
 * Popup Menu Component
 * 
 * A fast and keyboard-friendly popup menu widget.
 * Designed to be extensible for taskwarrior/timewarrior integration.
 */
import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Graphene from "gi://Graphene"
import { ComponentProps } from "../../types"
import { CSS_CLASSES } from "../../config/constants"

export interface MenuOption {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    action: () => void;
    disabled?: boolean;
}

export interface PopupMenuProps extends ComponentProps {
    options: MenuOption[];
    title?: string;
    onClose?: () => void;
}

/**
 * Fast popup menu with keyboard navigation
 */
export default function PopupMenu({
    monitor = 0,
    className = "",
    visible = false,
    options = [],
    title = "Menu",
    onClose
}: PopupMenuProps = {}) {
    let contentbox: Gtk.Box
    let win: Astal.Window
    
    const [selectedIndex, setSelectedIndex] = createState(0)
    const [filteredOptions, setFilteredOptions] = createState(options)

    /**
     * Handle closing with animation
     */
    function closeWithAnimation() {
        const context = contentbox.get_style_context()
        context?.add_class("animate-out")
        
        setTimeout(() => {
            win.visible = false
            context?.remove_class("animate-out")
            onClose?.()
        }, 200)
    }

    /**
     * Execute selected option action
     */
    function executeOption(option: MenuOption) {
        if (!option.disabled) {
            closeWithAnimation()
            option.action()
        }
    }

    /**
     * Handle keyboard navigation
     */
    function onKey(
        _e: Gtk.EventControllerKey,
        keyval: number,
        keycode: number,
        mod: number,
    ) {
        const currentOptions = filteredOptions.get()
        const currentIndex = selectedIndex.get()
        
        switch (keyval) {
            case Gdk.KEY_Escape:
                closeWithAnimation()
                break
                
            case Gdk.KEY_Return:
            case Gdk.KEY_KP_Enter:
                if (currentOptions[currentIndex]) {
                    executeOption(currentOptions[currentIndex])
                }
                break
                
            case Gdk.KEY_Up:
            case Gdk.KEY_k:
                setSelectedIndex(Math.max(0, currentIndex - 1))
                break
                
            case Gdk.KEY_Down:
            case Gdk.KEY_j:
                setSelectedIndex(Math.min(currentOptions.length - 1, currentIndex + 1))
                break
                
            case Gdk.KEY_Home:
                setSelectedIndex(0)
                break
                
            case Gdk.KEY_End:
                setSelectedIndex(currentOptions.length - 1)
                break
                
            default:
                // Handle number shortcuts (1-9)
                if (keyval >= Gdk.KEY_1 && keyval <= Gdk.KEY_9) {
                    const index = keyval - Gdk.KEY_1
                    if (currentOptions[index]) {
                        executeOption(currentOptions[index])
                    }
                }
                break
        }
    }

    /**
     * Close menu when clicking outside content area
     */
    function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
        const [, rect] = contentbox.compute_bounds(win)
        const position = new Graphene.Point({ x, y })

        if (!rect.contains_point(position)) {
            closeWithAnimation()
            return true
        }
    }

    return (
        <window
            $={(ref) => (win = ref)}
            class={`popup-menu ${className}`}
            name="popup-menu"
            anchor={Astal.WindowAnchor.CENTER}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            visible={visible}
            monitor={monitor}
            onNotifyVisible={({ visible }) => {
                const context = contentbox.get_style_context()

                if (visible) {
                    // Reset animations and state
                    context?.remove_class("animate-in")
                    context?.remove_class("animate-out")
                    setSelectedIndex(0)
                    setFilteredOptions(options)
                    
                    // Trigger entrance animation
                    setTimeout(() => context?.add_class("animate-in"), 10)
                } else {
                    context?.remove_class("animate-in")
                }
            }}
        >
            <Gtk.EventControllerKey onKeyPressed={onKey} />
            <Gtk.GestureClick onPressed={onClick} />
            
            <box
                $={(ref) => (contentbox = ref)}
                name="popup-menu-content"
                class={CSS_CLASSES.CARD}
                orientation={Gtk.Orientation.VERTICAL}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
            >
                {/* Header */}
                {title && (
                    <box class="menu-header">
                        <label 
                            label={title}
                            class={`menu-title ${CSS_CLASSES.LABEL}`}
                        />
                    </box>
                )}
                
                {/* Menu Options */}
                <box 
                    class="menu-options"
                    orientation={Gtk.Orientation.VERTICAL}
                >
                    <For each={filteredOptions}>
                        {(option, index) => (
                            <button
                                class={`menu-option ${CSS_CLASSES.BUTTON} ${
                                    selectedIndex((i) => i === index.get()) ? CSS_CLASSES.WIDGET_ACTIVE : ""
                                } ${option.disabled ? "disabled" : ""}`}
                                onClicked={() => executeOption(option)}
                                sensitive={!option.disabled}
                            >
                                <box class="option-content">
                                    {/* Icon */}
                                    {option.icon && (
                                        <label 
                                            label={option.icon}
                                            class="option-icon"
                                        />
                                    )}
                                    
                                    {/* Label */}
                                    <label 
                                        label={option.label}
                                        class="option-label"
                                        hexpand
                                        halign={Gtk.Align.START}
                                    />
                                    
                                    {/* Shortcut hint */}
                                    {option.shortcut && (
                                        <label 
                                            label={option.shortcut}
                                            class="option-shortcut"
                                        />
                                    )}
                                    
                                    {/* Number hint for keyboard navigation */}
                                    {index.get() < 9 && (
                                        <label 
                                            label={`${index.get() + 1}`}
                                            class="option-number"
                                        />
                                    )}
                                </box>
                            </button>
                        )}
                    </For>
                </box>
                
                {/* Footer with keyboard hints */}
                <box class="menu-footer">
                    <label 
                        label="↑↓/jk: Navigate • Enter: Select • Esc: Close • 1-9: Quick select"
                        class="keyboard-hints"
                    />
                </box>
            </box>
        </window>
    )
}