/**
 * File Finder Component
 * 
 * Provides fuzzy search functionality for files in the user's home directory.
 * Uses the find command for fast file searching with keyboard navigation.
 */
import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import Graphene from "gi://Graphene"
import { ComponentProps } from "../../types"

/**
 * Get the current user's home directory
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
     * Search files using find command and fuzzy matching
     */
    async function search(text: string) {
        if (text === "" || text.length < 2) {
            setList([])
            return
        }

        try {
            // Get current search path, fallback to getting home directory if needed
            let currentPath = searchPath
            if (!currentPath) {
                const currentHomeDir = homeDir.get()
                if (currentHomeDir) {
                    currentPath = currentHomeDir
                } else {
                    const home = await getUserHome()
                    setHomeDir(home)
                    currentPath = home
                }
            }

            // Use find command to search for files and directories
            // -maxdepth 4 to limit search depth for performance
            // -type f for files, -type d for directories
            const output = await execAsync(`find "${currentPath}" -maxdepth 8 -name "*${text}*" -not -path "*/.*" -printf "%p|%y\\n"`)

            const files: FileResult[] = []
            const lines = output.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
                const [path, type] = line.split('|')
                if (!path) continue

                const name = path.split('/').pop() || path
                const score = fuzzyMatch(text, name)

                if (score > 0 && files.length < maxResults * 2) { // Get more results to sort
                    files.push({
                        name,
                        path,
                        isDirectory: type === 'd'
                    })
                }
            }

            // Sort by fuzzy match score and limit results
            files.sort((a, b) => {
                const scoreA = fuzzyMatch(text, a.name)
                const scoreB = fuzzyMatch(text, b.name)
                return scoreB - scoreA
            })

            setList(files.slice(0, maxResults))
        } catch (error) {
            console.error("File search error:", error)
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
                if (file.isDirectory) {
                    await execAsync(["xdg-open", file.path])
                } else {
                    await execAsync(["xdg-open", file.path])
                }
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
     * Get appropriate icon for file type
     */
    function getFileIcon(file: FileResult): string {
        if (file.isDirectory) return "folder"

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
                const context = contentbox.get_style_context()

                if (visible) {
                    context?.remove_class("animate-in")
                    searchentry.grab_focus()
                    setTimeout(() => context?.add_class("animate-in"), 100)
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
                                        // Add visible class with slight delay for animation
                                        setTimeout(() => button.get_style_context()?.add_class("visible"), 10)
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
