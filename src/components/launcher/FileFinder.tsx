/**
 * File Finder Component
 * 
 * Provides ultra-fast fuzzy search for FILES ONLY within the user's home directory
 * using fd command. Searches through all subdirectories for files (no directories shown)
 * including hidden files. Optimized for performance with limited results.
 */
import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Graphene from "gi://Graphene"
import { ComponentProps, FileSearchResult } from "../../types"
import { executeScript } from "../../utils"

export interface FileFinderProps extends ComponentProps {
    maxResults?: number;
    searchPath?: string;
}

/**
 * Get the current user's home directory - works on any machine
 */
async function getUserHome(): Promise<string> {
    try {
        const result = await executeScript("system-utils.sh", "get-home");
        return result?.text?.trim() + "/" || "/home/user/";
    } catch {
        return "/home/user/";
    }
}

/**
 * File finder with fuzzy search and keyboard navigation
 */
export default function FileFinder({
    monitor = 0,
    className = "",
    visible = false,
    maxResults = 8,
    searchPath
}: FileFinderProps = {}) {
    let contentbox: Gtk.Box
    let searchentry: Gtk.Entry
    let win: Astal.Window

    const [list, setList] = createState(new Array<FileSearchResult>())
    const [homeDir, setHomeDir] = createState("")

    // Initialize home directory on component mount
    if (!searchPath && homeDir(String).get() === "") {
        getUserHome().then(setHomeDir)
    }

    /**
     * Simple fuzzy matching function
     */
    function fuzzyMatch(query: string, target: string): number {
        query = query.toLowerCase()
        target = target.toLowerCase()

        let queryIndex = 0
        let score = 0

        for (let i = 0; i < target.length && queryIndex < query.length; i++) {
            if (target[i] === query[queryIndex]) {
                score += 1
                queryIndex++
            }
        }

        return queryIndex === query.length ? score : 0
    }

    /**
     * Search files using fd command for ultra-fast searching (files only, no directories)
     */
    async function search(text: string) {
        if (text === "" || text.length < 2) {
            setList([])
            return
        }

        try {
            // Get user's home directory dynamically
            const userHome = await getUserHome()
            const searchDir = searchPath || userHome.replace(/\/$/, '') // Remove trailing slash

            // Use file finder script
            const searchType = searchPath?.includes('/.config') ? 'config' : 'home';
            const result = await executeScript("file-finder.sh", text, searchType);
            
            if (!result?.text) {
                setList([]);
                return;
            }

            const lines = result.text.split('\n').filter(line => line.trim() !== '')
            const files: FileSearchResult[] = []

            for (const path of lines) {
                // Ensure it's in search directory
                if (!path.startsWith(searchDir)) continue

                const name = path.split('/').pop() || path
                const score = fuzzyMatch(text, name)

                if (score > 0 && files.length < maxResults * 2) {
                    files.push({
                        name,
                        path,
                        type: 'file', // Always file since we only search files
                        size: 0, // Could be enhanced with stat info
                        modified: new Date() // Could be enhanced with stat info
                    })
                }
            }

            files.sort((a, b) => {
                const scoreA = fuzzyMatch(text, a.name)
                const scoreB = fuzzyMatch(text, b.name)
                return scoreB - scoreA
            })

            setList(files.slice(0, maxResults))
        } catch (error) {
            console.warn("Error en búsqueda de archivos:", error)
            setList([])
        }
    }

    /**
     * Open selected file with default application
     */
    async function openFile(file?: FileSearchResult) {
        if (file) {
            win.hide()
            try {
                await executeScript("system-utils.sh", "open-file", file.path);
            } catch (error) {
                console.error("Failed to open file:", error)
            }
        }
    }

    /**
     * Handle keyboard events - ESC to close, Enter to open first result
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
     * Close file finder when clicking outside content area
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
     * Get appropriate icon for file type (files only)
     */
    function getFileIcon(file: FileSearchResult): string {
        const ext = file.name.split('.').pop()?.toLowerCase()

        switch (ext) {
            case 'txt':
            case 'md':
            case 'doc':
            case 'docx':
                return "text-x-generic"
            case 'pdf':
                return "application-pdf"
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return "image-x-generic"
            case 'mp3':
            case 'wav':
            case 'flac':
                return "audio-x-generic"
            case 'mp4':
            case 'avi':
            case 'mkv':
                return "video-x-generic"
            case 'zip':
            case 'tar':
            case 'gz':
                return "application-x-archive"
            case 'js':
            case 'ts':
            case 'py':
            case 'cpp':
            case 'c':
            case 'java':
                return "text-x-script"
            default:
                return "text-x-generic"
        }
    }

    return (
        <window
            $={(ref) => (win = ref)}
            class={`filefinder ${className}`}
            name="filefinder"
            anchor={1}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            visible={visible}
            monitor={monitor}
            onNotifyVisible={({ visible }) => {
                if (visible) {
                    searchentry.grab_focus()
                } else {
                    setList([])
                }
            }}
        >
            <Gtk.EventControllerKey onKeyPressed={onKey} />
            <Gtk.GestureClick onPressed={onClick} />
            <box
                $={(ref) => (contentbox = ref)}
                name="filefinder-content"
                height_request={800}
                width_request={800}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                orientation={Gtk.Orientation.VERTICAL}
            >
                <box
                    class="searchbox"
                >
                    <entry
                        $={(ref) => (searchentry = ref)}
                        onNotifyText={({ text }) => search(text)}
                        onActivate={() => openFile(list.get()[0])}
                        hexpand
                        placeholderText="Start typing to search files..."
                    />
                </box>
                <Gtk.Separator visible={list((l) => l.length > 0)} />
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                >
                    <For each={list}>
                        {(file) => {
                            let button: Gtk.Button

                            return (
                                <button
                                    class="file"
                                    $={(ref) => {
                                        button = ref
                                        // No animation - add visible class immediately
                                        button.get_style_context()?.add_class("visible")
                                    }}
                                    onClicked={() => openFile(file)}
                                >
                                    <box>
                                        <image iconName={getFileIcon(file)} />
                                        <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.START}>
                                            <label
                                                label={file.name}
                                                maxWidthChars={40}
                                                wrap
                                                halign={Gtk.Align.START}
                                            />
                                            <label
                                                label={file.path}
                                                maxWidthChars={50}
                                                wrap
                                                class="file-path"
                                                halign={Gtk.Align.START}
                                            />
                                        </box>
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
