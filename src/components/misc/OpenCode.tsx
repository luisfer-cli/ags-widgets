/**
 * OpenCode Chat Widget Component
 * 
 * Provides a floating window for quick conversations with opencode AI assistant.
 * Features conversation history management with automatic saving to ~/opencode directory.
 * 
 * Keyboard shortcuts:
 * - Enter: Send message
 * - Ctrl+Enter: New line
 * - Escape: Close widget
 * - Ctrl+N: New conversation
 * - Ctrl+S: Save current conversation
 */
import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import Graphene from "gi://Graphene"
import { ComponentProps } from "../../types"
import GLib from "gi://GLib"

export interface OpenCodeProps extends ComponentProps {
    maxMessages?: number;
    maxConversations?: number;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * OpenCode chat widget with conversation history management
 */
export default function OpenCode({
    monitor = 0,
    className = "",
    visible = false,
    maxMessages = 100,
    maxConversations = 50
}: OpenCodeProps = {}) {
    let contentbox: Gtk.Box
    let messageEntry: Gtk.Entry
    let messagesContainer: Gtk.Box
    let win: Astal.Window

    const [conversations, setConversations] = createState(new Array<Conversation>())
    const [currentConversation, setCurrentConversation] = createState<Conversation | null>(null)
    const [isProcessing, setIsProcessing] = createState(false)
    const [statusMessage, setStatusMessage] = createState("")
    const [streamingMessage, setStreamingMessage] = createState("")

    const homeDir = GLib.get_home_dir()
    const openCodeDir = `${homeDir}/opencode`
    const conversationsFile = `${openCodeDir}/conversations.json`

    /**
     * Ensure opencode directory exists
     */
    async function ensureOpenCodeDir() {
        try {
            await execAsync(["mkdir", "-p", openCodeDir])
        } catch (error) {
            console.error("Failed to create opencode directory:", error)
        }
    }

    /**
     * Load conversations from file
     */
    async function loadConversations() {
        try {
            await ensureOpenCodeDir()
            const content = await execAsync(["cat", conversationsFile])
            const parsed = JSON.parse(content)
            
            // Convert date strings back to Date objects
            const loadedConversations = parsed.map((conv: any) => ({
                ...conv,
                createdAt: new Date(conv.createdAt),
                updatedAt: new Date(conv.updatedAt),
                messages: conv.messages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }))
            }))
            
            setConversations(loadedConversations)
            setStatusMessage("Conversations loaded")
        } catch (error) {
            console.log("No existing conversations found, starting fresh")
            setConversations([])
        }
    }

    /**
     * Save conversations to file
     */
    async function saveConversations() {
        try {
            await ensureOpenCodeDir()
            const conversationsData = JSON.stringify(conversations.get(), null, 2)
            await execAsync(["tee", conversationsFile], { input: conversationsData })
            setStatusMessage("Conversations saved")
        } catch (error) {
            console.error("Failed to save conversations:", error)
            setStatusMessage("Failed to save conversations")
        }
    }

    /**
     * Create a new conversation
     */
    function createNewConversation(): Conversation {
        const now = new Date()
        return {
            id: `conv_${now.getTime()}`,
            title: `Conversation ${now.toLocaleString()}`,
            messages: [],
            createdAt: now,
            updatedAt: now
        }
    }

    /**
     * Start a new conversation
     */
    function startNewConversation() {
        const newConv = createNewConversation()
        setCurrentConversation(newConv)
        
        const allConversations = conversations.get()
        const updatedConversations = [newConv, ...allConversations].slice(0, maxConversations)
        setConversations(updatedConversations)
        
        saveConversations()
        updateMessagesDisplay()
    }

    /**
     * Add message to current conversation
     */
    function addMessage(role: 'user' | 'assistant', content: string) {
        const current = currentConversation.get()
        if (!current) return

        const message: Message = {
            role,
            content,
            timestamp: new Date()
        }

        const updatedMessages = [...current.messages, message].slice(-maxMessages)
        const updatedConversation = {
            ...current,
            messages: updatedMessages,
            updatedAt: new Date()
        }

        setCurrentConversation(updatedConversation)

        // Update in conversations array
        const allConversations = conversations.get()
        const convIndex = allConversations.findIndex(c => c.id === current.id)
        if (convIndex >= 0) {
            allConversations[convIndex] = updatedConversation
            setConversations([...allConversations])
        }

        saveConversations()
        updateMessagesDisplay()
    }

    /**
     * Clean opencode response by removing ANSI codes and header
     */
    function cleanOpenCodeResponse(response: string): string {
        // Remove ANSI escape codes
        const ansiRegex = /\x1b\[[0-9;]*m/g
        let cleaned = response.replace(ansiRegex, '')
        
        // Remove the ASCII art header and model info if present
        const lines = cleaned.split('\n')
        let startIndex = 0
        
        // Skip ASCII art and empty lines at the beginning
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (line && !line.includes('█') && !line.includes('@') && !line.includes('github-copilot')) {
                startIndex = i
                break
            }
        }
        
        return lines.slice(startIndex).join('\n').trim()
    }

    /**
     * Send message to opencode with real-time streaming
     */
    async function sendMessage(userMessage: string) {
        if (!userMessage.trim() || isProcessing.get()) return

        let current = currentConversation.get()
        if (!current) {
            current = createNewConversation()
            setCurrentConversation(current)
        }

        addMessage('user', userMessage.trim())
        setIsProcessing(true)
        setStatusMessage("Connecting to OpenCode...")

        // Add a placeholder message for the assistant that we'll update in real-time
        const assistantMessage: Message = {
            role: 'assistant',
            content: '⏳ Thinking...',
            timestamp: new Date()
        }

        const updatedMessages = [...current.messages, assistantMessage].slice(-maxMessages)
        const updatedConversation = {
            ...current,
            messages: updatedMessages,
            updatedAt: new Date()
        }

        setCurrentConversation(updatedConversation)
        updateMessagesDisplay()

        try {
            setStatusMessage("Generating response...")

            // Create a script to run opencode with streaming output
            const streamScript = `
#!/bin/bash
cd "${openCodeDir}"
exec opencode run "${userMessage.trim().replace(/"/g, '\\"')}"
            `.trim()

            // Execute the streaming command
            const response = await execAsync([
                "bash", "-c", streamScript
            ])

            const cleanedResponse = cleanOpenCodeResponse(response)
            
            // Update the last message (assistant) with the actual response
            const finalMessages = [...updatedConversation.messages]
            finalMessages[finalMessages.length - 1] = {
                role: 'assistant',
                content: cleanedResponse,
                timestamp: new Date()
            }

            const finalConversation = {
                ...updatedConversation,
                messages: finalMessages,
                updatedAt: new Date()
            }

            setCurrentConversation(finalConversation)

            // Update in conversations array
            const allConversations = conversations.get()
            const convIndex = allConversations.findIndex(c => c.id === current!.id)
            if (convIndex >= 0) {
                allConversations[convIndex] = finalConversation
                setConversations([...allConversations])
            }

            saveConversations()
            updateMessagesDisplay()
            setStatusMessage("Message received")
            
        } catch (error) {
            console.error("OpenCode error:", error)
            let errorMessage = "Error connecting to OpenCode"
            
            // Try to extract meaningful error message
            if (typeof error === 'string') {
                errorMessage = error
            } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String(error.message)
            }
            
            // Update the last message with error
            const finalMessages = [...updatedConversation.messages]
            finalMessages[finalMessages.length - 1] = {
                role: 'assistant',
                content: `❌ ${errorMessage}`,
                timestamp: new Date()
            }

            const finalConversation = {
                ...updatedConversation,
                messages: finalMessages,
                updatedAt: new Date()
            }

            setCurrentConversation(finalConversation)
            updateMessagesDisplay()
            setStatusMessage("Error sending message")
        } finally {
            setIsProcessing(false)
        }
    }

    /**
     * Update messages display
     */
    function updateMessagesDisplay() {
        // Force refresh of messages container
        const current = currentConversation.get()
        if (current) {
            // Trigger a re-render by updating the state
            setCurrentConversation({ ...current })
        }
    }

    /**
     * Get message text from entry
     */
    function getMessageText(): string {
        return messageEntry.get_text()
    }

    /**
     * Clear message input
     */
    function clearMessageInput() {
        messageEntry.set_text("")
    }

    /**
     * Handle keyboard events
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

        // Ctrl+N: New conversation
        if ((mod & Gdk.ModifierType.CONTROL_MASK) && keyval === Gdk.KEY_n) {
            startNewConversation()
            return
        }

        // Ctrl+S: Save conversations
        if ((mod & Gdk.ModifierType.CONTROL_MASK) && keyval === Gdk.KEY_s) {
            saveConversations()
            return
        }

        // Enter: Send message (unless Ctrl+Enter for new line)
        if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_ISO_Enter) {
            const message = getMessageText()
            if (message.trim()) {
                sendMessage(message)
                clearMessageInput()
            }
            return true
        }
    }

    /**
     * Close widget when clicking outside content area
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
     * Format timestamp for display
     */
    function formatTime(date: Date): string {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Initialize conversations on component creation
    loadConversations()

    return (
        <window
            $={(ref) => (win = ref)}
            class={`opencode ${className}`}
            name="opencode"
            anchor={1}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            visible={visible}
            monitor={monitor}
            onNotifyVisible={({ visible }) => {
                if (visible) {
                    if (!currentConversation.get()) {
                        startNewConversation()
                    }
                    messageEntry.grab_focus()
                } else {
                    clearMessageInput()
                }
            }}
        >
            <Gtk.EventControllerKey onKeyPressed={onKey} />
            <Gtk.GestureClick onPressed={onClick} />
            <box
                $={(ref) => (contentbox = ref)}
                name="opencode-content"
                height_request={700}
                width_request={900}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                orientation={Gtk.Orientation.VERTICAL}
            >
                {/* Header */}
                <box class="opencode-header">
                    <label 
                        label="OpenCode Chat Assistant"
                        class="opencode-title"
                    />
                    <box class="header-controls">
                        <button
                            class="new-conversation-btn"
                            onClicked={() => startNewConversation()}
                            tooltip_text="New Conversation (Ctrl+N)"
                        >
                            <image iconName="document-new" />
                        </button>
                        <button
                            class="save-btn"
                            onClicked={() => saveConversations()}
                            tooltip_text="Save Conversations (Ctrl+S)"
                        >
                            <image iconName="document-save" />
                        </button>
                    </box>
                </box>

                {/* Status */}
                <box 
                    class="status-bar"
                    visible={statusMessage((msg) => msg !== "")}
                >
                    <label 
                        label={statusMessage}
                        class="status-text"
                    />
                </box>

                {/* Messages Area */}
                <scrolledwindow
                    class="messages-scroll"
                    hexpand
                    vexpand
                    max_content_height={400}
                    propagate_natural_height
                >
                    <box
                        $={(ref) => (messagesContainer = ref)}
                        class="messages-container"
                        orientation={Gtk.Orientation.VERTICAL}
                    >
                        <For each={currentConversation((conv) => conv?.messages || [])}>
                            {(message) => (
                                <box class={`message message-${message.role} ${message.content.includes('⏳') ? 'message-thinking' : ''}`}>
                                    <box class="message-header">
                                        <label 
                                            label={message.role === 'user' ? 'You' : 'OpenCode'}
                                            class="message-sender"
                                        />
                                        <label 
                                            label={formatTime(message.timestamp)}
                                            class="message-time"
                                        />
                                    </box>
                                    <label 
                                        label={message.content}
                                        class={`message-content ${message.content.includes('⏳') ? 'thinking-dots' : ''}`}
                                        selectable
                                        wrap
                                        xalign={0}
                                    />
                                </box>
                            )}
                        </For>
                    </box>
                </scrolledwindow>

                <Gtk.Separator />

                {/* Input Area */}
                <box class="input-area" orientation={Gtk.Orientation.VERTICAL}>
                    <label 
                        label="Enter: Send | Ctrl+N: New conversation | Escape: Close"
                        class="input-help"
                    />
                    <box class="input-box">
                        <entry
                            $={(ref) => (messageEntry = ref)}
                            class="message-input"
                            hexpand
                            placeholderText="Type your message here..."
                            onActivate={() => {
                                const message = messageEntry.get_text()
                                if (message.trim()) {
                                    sendMessage(message)
                                    messageEntry.set_text("")
                                }
                            }}
                        />
                    </box>
                    <box class="input-controls">
                        <button
                            class="send-btn"
                            onClicked={() => {
                                const message = getMessageText()
                                if (message.trim()) {
                                    sendMessage(message)
                                    clearMessageInput()
                                }
                            }}
                            sensitive={isProcessing((proc) => !proc)}
                        >
                            <label 
                                label={isProcessing((proc) => proc ? "Sending..." : "Send")}
                            />
                        </button>
                        <button
                            class="clear-btn"
                            onClicked={() => clearMessageInput()}
                        >
                            <label label="Clear" />
                        </button>
                    </box>
                </box>
            </box>
        </window>
    )
}