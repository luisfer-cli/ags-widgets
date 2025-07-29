/**
 * File Finder Component
 * 
 * Provides ultra-fast fuzzy search for FILES ONLY within the user's home directory
 * using fd command. Searches through all subdirectories for files (no directories shown)
 * including hidden files. Optimized for performance with limited results.
 */
import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import Graphene from "gi://Graphene"
import { ComponentProps } from "../../types"

/**
 * Get the current user's home directory - works on any machine
 */
async function getUserHome(): Promise<string> {
    try {
        const homeDir = await execAsync(["sh", "-c", "echo $HOME"])
        return homeDir.trim() + "/"
    } catch {
        return "/home/user/"
    }
}

export interface FileFinderProps extends ComponentProps {
    maxResults?: number;
    searchPath?: string;
}

interface FileResult {
    name: string;
    path: string;
    isDirectory: boolean;
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

    const [list, setList] = createState(new Array<FileResult>())
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

            // Use fd for ultra-fast searching - only files, no directories
            let output: string = ""
            
            try {
                // fd with --type f to only show files, limited results for performance
                output = await execAsync([
                    "fd",
                    text,
                    searchDir,
                    "--type", "f", // Only files, no directories
                    "--max-results", "50", // Much smaller limit since we only show ~10
                    "--hidden", // Include hidden files
                    "--no-ignore", // Don't respect .gitignore
                    "-i" // Case insensitive
                ])
            } catch {
                // Fallback to find if fd is not available - also only files
                output = await execAsync([
                    "sh", 
                    "-c",
                    `find "${searchDir}" -type f -iname "*${text}*" 2>/dev/null | head -50`
                ])
            }

            const lines = output.split('\n').filter(line => line.trim() !== '')
            const files: FileResult[] = []

            for (const path of lines) {
                // Ensure it's in home directory
                if (!path.startsWith(searchDir)) continue

                const name = path.split('/').pop() || path
                const score = fuzzyMatch(text, name)

                if (score > 0 && files.length < maxResults * 2) {
                    // Since we're only getting files with --type f, no need to check if it's a directory
                    files.push({
                        name,
                        path,
                        isDirectory: false // Always false since we only search files
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
    async function openFile(file?: FileResult) {
        if (file) {
            win.hide()
            try {
                // Since we only show files now, always use xdg-open for files
                await execAsync(["xdg-open", file.path])
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
    function getFileIcon(file: FileResult): string {
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
                    searchentry.set_text("")
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
