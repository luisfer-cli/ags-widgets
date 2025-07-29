/**
 * Mathematical Calculator Component
 * 
 * Provides a floating window calculator using Mathics as backend for mathematical computations.
 * Features multiple operation modes triggered by keyboard shortcuts:
 * - Enter: Evaluate expression
 * - Alt+D: Derivative
 * - Alt+I: Integrate
 * - Alt+E: Expand
 * - Alt+F: Factor
 * - Alt+S: Simplify
 */
import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import Graphene from "gi://Graphene"
import { ComponentProps } from "../../types"

export interface CalculatorProps extends ComponentProps {
    maxHistory?: number;
}

interface CalculationResult {
    expression: string;
    result: string;
    operation: string;
    timestamp: Date;
}

/**
 * Mathematical calculator with Mathics backend integration
 */
export default function Calculator({
    monitor = 0,
    className = "",
    visible = false,
    maxHistory = 10
}: CalculatorProps = {}) {
    let contentbox: Gtk.Box
    let searchentry: Gtk.Entry
    let win: Astal.Window

    const [history, setHistory] = createState(new Array<CalculationResult>())
    const [currentResult, setCurrentResult] = createState("")
    const [isCalculating, setIsCalculating] = createState(false)

    /**
     * Execute Mathics command with given expression and operation
     */
    async function executeMathics(expression: string, operation: string = "evaluate"): Promise<string> {
        if (!expression.trim()) return ""

        setIsCalculating(true)
        
        try {
            let mathicsExpression = expression

            // Prepare expression based on operation type
            switch (operation) {
                case "derivative":
                    // For derivatives, we need to specify the variable (usually x)
                    mathicsExpression = `D[${expression}, x]`
                    break
                case "integrate":
                    // For integration, we assume integration over x
                    mathicsExpression = `Integrate[${expression}, x]`
                    break
                case "expand":
                    mathicsExpression = `Expand[${expression}]`
                    break
                case "factor":
                    mathicsExpression = `Factor[${expression}]`
                    break
                case "simplify":
                    mathicsExpression = `Simplify[${expression}]`
                    break
                case "evaluate":
                default:
                    // Direct evaluation
                    mathicsExpression = expression
                    break
            }

            // Execute mathics command
            const result = await execAsync([
                "mathics",
                "-e",
                mathicsExpression
            ])

            return result.trim()
        } catch (error) {
            console.error("Mathics execution error:", error)
            return `Error: ${error}`
        } finally {
            setIsCalculating(false)
        }
    }

    /**
     * Process calculation and update history
     */
    async function calculate(expression: string, operation: string = "evaluate") {
        if (!expression.trim()) return

        const result = await executeMathics(expression, operation)
        setCurrentResult(result)

        // Add to history
        const newResult: CalculationResult = {
            expression,
            result,
            operation,
            timestamp: new Date()
        }

        const currentHistory = history.get()
        const newHistory = [newResult, ...currentHistory].slice(0, maxHistory)
        setHistory(newHistory)
    }

    /**
     * Get operation display name
     */
    function getOperationName(operation: string): string {
        switch (operation) {
            case "derivative": return "∂/∂x"
            case "integrate": return "∫ dx"
            case "expand": return "Expand"
            case "factor": return "Factor"
            case "simplify": return "Simplify"
            case "evaluate": return "="
            default: return "="
        }
    }

    /**
     * Handle keyboard events with operation shortcuts
     */
    function onKey(
        _e: Gtk.EventControllerKey,
        keyval: number,
        _: number,
        mod: number,
    ) {
        const expression = searchentry.get_text()
        
        if (keyval === Gdk.KEY_Escape) {
            win.visible = false
            return
        }

        // Check for Alt key combinations
        if (mod & Gdk.ModifierType.ALT_MASK) {
            switch (keyval) {
                case Gdk.KEY_d:
                case Gdk.KEY_D:
                    calculate(expression, "derivative")
                    return
                case Gdk.KEY_i:
                case Gdk.KEY_I:
                    calculate(expression, "integrate")
                    return
                case Gdk.KEY_e:
                case Gdk.KEY_E:
                    calculate(expression, "expand")
                    return
                case Gdk.KEY_f:
                case Gdk.KEY_F:
                    calculate(expression, "factor")
                    return
                case Gdk.KEY_s:
                case Gdk.KEY_S:
                    calculate(expression, "simplify")
                    return
            }
        }

        // Enter key for regular evaluation
        if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_ISO_Enter) {
            calculate(expression, "evaluate")
            return
        }
    }

    /**
     * Close calculator when clicking outside content area
     */
    function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
        const [, rect] = contentbox.compute_bounds(win)
        const position = new Graphene.Point({ x, y })

        if (!rect.contains_point(position)) {
            win.visible = false
            return true
        }
    }

    /**
     * Copy result to clipboard
     */
    async function copyToClipboard(text: string) {
        try {
            await execAsync(["wl-copy", text])
        } catch {
            try {
                await execAsync(["xclip", "-selection", "clipboard"], { input: text })
            } catch (error) {
                console.error("Failed to copy to clipboard:", error)
            }
        }
    }

    return (
        <window
            $={(ref) => (win = ref)}
            class={`calculator ${className}`}
            name="calculator"
            anchor={1}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            visible={visible}
            monitor={monitor}
            onNotifyVisible={({ visible }) => {
                if (visible) {
                    searchentry.grab_focus()
                } else {
                    searchentry.set_text("")
                    setCurrentResult("")
                }
            }}
        >
            <Gtk.EventControllerKey onKeyPressed={onKey} />
            <Gtk.GestureClick onPressed={onClick} />
            <box
                $={(ref) => (contentbox = ref)}
                name="calculator-content"
                height_request={600}
                width_request={800}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                orientation={Gtk.Orientation.VERTICAL}
            >
                {/* Input Section */}
                <box class="input-section" orientation={Gtk.Orientation.VERTICAL}>
                    <label 
                        label="Mathematical Calculator - Powered by Mathics"
                        class="calculator-title"
                    />
                    <box class="shortcuts-info">
                        <label 
                            label="Enter: Evaluate | Alt+D: Derivative | Alt+I: Integrate | Alt+E: Expand | Alt+F: Factor | Alt+S: Simplify"
                            class="shortcuts-text"
                        />
                    </box>
                    <box class="searchbox">
                        <entry
                            $={(ref) => (searchentry = ref)}
                            hexpand
                            placeholderText="Enter mathematical expression..."
                        />
                    </box>
                </box>

                {/* Current Result Section */}
                <box 
                    class="current-result"
                    visible={currentResult((r) => r !== "")}
                    orientation={Gtk.Orientation.VERTICAL}
                >
                    <Gtk.Separator />
                    <box class="result-box">
                        <label 
                            label={isCalculating((calc) => calc ? "Calculating..." : "Result:")}
                            class="result-label"
                        />
                        <button
                            class="result-value"
                            onClicked={() => copyToClipboard(currentResult.get())}
                            tooltip_text="Click to copy result"
                        >
                            <label 
                                label={currentResult} 
                                selectable
                                wrap
                                maxWidthChars={60}
                            />
                        </button>
                    </box>
                </box>

                {/* History Section */}
                <box 
                    class="history-section"
                    visible={history((h) => h.length > 0)}
                    orientation={Gtk.Orientation.VERTICAL}
                >
                    <Gtk.Separator />
                    <label label="History" class="history-title" />
                    <scrolledwindow
                        max_content_height={300}
                        propagate_natural_height
                    >
                        <box orientation={Gtk.Orientation.VERTICAL}>
                            <For each={history}>
                                {(item) => (
                                    <box class="history-item">
                                        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
                                            <box>
                                                <label 
                                                    label={`${item.expression} ${getOperationName(item.operation)}`}
                                                    class="history-expression"
                                                    selectable
                                                />
                                            </box>
                                            <box>
                                                <button
                                                    class="history-result"
                                                    onClicked={() => copyToClipboard(item.result)}
                                                    tooltip_text="Click to copy"
                                                >
                                                    <label 
                                                        label={item.result}
                                                        class="history-result-text"
                                                        selectable
                                                        wrap
                                                        maxWidthChars={50}
                                                    />
                                                </button>
                                            </box>
                                        </box>
                                        <button
                                            class="use-result-btn"
                                            onClicked={() => searchentry.set_text(item.result)}
                                            tooltip_text="Use this result"
                                        >
                                            <image iconName="edit-copy" />
                                        </button>
                                    </box>
                                )}
                            </For>
                        </box>
                    </scrolledwindow>
                </box>
            </box>
        </window>
    )
}