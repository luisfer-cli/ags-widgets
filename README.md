# 🚀 AGS Desktop Shell - Advanced Productivity Configuration

[![AGS](https://img.shields.io/badge/AGS-Desktop_Shell-blue?style=for-the-badge)](https://github.com/Aylur/ags)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![GTK4](https://img.shields.io/badge/GTK-4.0-green?style=for-the-badge&logo=gtk)](https://gtk.org/)

A comprehensive, productivity-focused desktop shell built with [AGS (Aylur's GTK Shell)](https://github.com/Aylur/ags). This configuration transforms your Linux desktop into a powerful productivity workspace with real-time monitoring, time tracking, project management integration, and seamless media controls.

## ✨ Features

### 🎯 **Productivity Dashboard**

- **🕐 Digital Clock** - Clean time display with modern styling
- **⌨️ WPM Counter** - Real-time typing speed monitoring with history tracking
- **🍅 Flowmodoro Timer** - Advanced Pomodoro technique implementation with customizable intervals
- **💻 TimeWarrior Integration** - Professional time tracking for projects and tasks
- **📊 System Monitoring** - Live CPU, memory, temperature, and system statistics
- **📋 TaskWarrior Integration** - Task management with pending and completed task tracking
- **🎯 Jira Integration** - Direct workspace integration for issue tracking and project management

### 🚀 **Launchers & Tools**

- **Application Launcher** - Fuzzy search for instant application access
- **🔍 File Finder** - Ultra-fast file search using `fd` with instant results
- **🧮 Calculator** - Built-in mathematical calculator using Mathics backend with advanced operations
- **📅 Calendar** - Quick date reference and scheduling
- **🔧 Task Manager** - System process monitoring and management
- **🔌 Shutdown Menu** - Power management with multiple options

### 🎵 **Media & Audio**

- **Media Controls** - Persistent bottom bar with track information and controls
- **🔊 Volume OSD** - On-screen volume feedback with smooth animations
- **🎶 Track Information** - Artist, title, album, and playback status display
- **🎵 Cava Audio Visualizer** - Real-time audio visualization widget

### 🔔 **Notification & Interface**

- **Popup Notifications** - Clean, non-intrusive notification system
- **Custom Styling** - Cohesive theming across all components
- **🖥️ Multi-monitor Support** - Intelligent monitor detection and placement
- **⌨️ Hyprland Integration** - Deep window manager integration with workspace awareness

## 🏗️ Architecture

```
src/
├── components/              # Modular reactive components
│   ├── bar/                # Top bar with workspace indicators
│   ├── dashboard/          # Main productivity widgets
│   │   ├── Clock.tsx       # Digital clock display
│   │   ├── WpmCounter.tsx  # Typing speed tracker
│   │   ├── Flowmodoro.tsx  # Pomodoro timer
│   │   ├── Monitoring.tsx  # System resources
│   │   ├── Timewarrior.tsx # Time tracking
│   │   ├── Weather.tsx     # TaskWarrior widget (task management)
│   │   ├── JiraWidget.tsx  # Project management

│   ├── launcher/           # Application launcher & file finder
│   ├── misc/               # Additional UI components
│   │   ├── Calculator.tsx  # Built-in calculator
│   │   ├── Calendar.tsx    # Date widget
│   │   ├── Botbar.tsx      # Media controls
│   │   ├── Shutdown.tsx    # Power menu
│   │   └── TaskManagerMenu.tsx # Process manager
│   ├── notifications/      # Notification system
│   └── osd/               # On-screen displays
├── config/                # Configuration constants
├── types/                 # TypeScript definitions
├── utils/                 # Utility functions and hooks
└── styles/               # CSS styling
scripts/                  # External shell scripts
├── flowmodoro.sh         # Pomodoro timer backend
├── get_wpm.sh           # WPM calculation
├── jira.sh              # Jira API integration

├── monitor.sh           # System monitoring
├── timewarrior.sh       # Time tracking
└── hyprctl-*.sh         # Hyprland integration
```

## 🚀 Quick Start

### 📦 Dependencies

#### Core Dependencies (Required)

- **Linux Desktop** (Hyprland recommended, X11/Wayland compatible)
- **AGS** - Install from [GitHub](https://github.com/Aylur/ags)
- **Node.js & npm** - For dependency management

#### System Tools (Required for specific features)

- **fd** - Ultra-fast file searching
  ```bash
  # Arch Linux
  sudo pacman -S fd
  # Ubuntu/Debian
  sudo apt install fd-find
  # Fedora
  sudo dnf install fd-find
  ```

#### Audio & Media Dependencies

- **playerctl** - Media player control
  ```bash
  # Arch Linux
  sudo pacman -S playerctl
  # Ubuntu/Debian
  sudo apt install playerctl
  # Fedora
  sudo dnf install playerctl
  ```

- **CAVA** - Audio visualization
  ```bash
  # Arch Linux
  sudo pacman -S cava
  # Ubuntu/Debian
  sudo apt install cava
  # Fedora
  sudo dnf install cava
  ```

- **pamixer** - Volume control
  ```bash
  # Arch Linux
  sudo pacman -S pamixer
  # Ubuntu/Debian
  sudo apt install pamixer
  # Fedora
  sudo dnf install pamixer
  ```

#### Clipboard Support

- **wl-copy** (Wayland) or **xclip** (X11) - Clipboard operations
  ```bash
  # Wayland (Arch)
  sudo pacman -S wl-clipboard
  # Wayland (Ubuntu/Debian)
  sudo apt install wl-clipboard
  
  # X11 (Arch)
  sudo pacman -S xclip
  # X11 (Ubuntu/Debian)
  sudo apt install xclip
  ```

#### Mathematical Calculator

- **Mathics** - Advanced mathematical computations
  ```bash
  # Using pip (recommended)
  pip install mathics-core
  
  # Arch Linux (AUR)
  yay -S mathics
  ```

#### Productivity Tools (Optional)

- **TimeWarrior** - Time tracking functionality
  ```bash
  # Arch Linux
  sudo pacman -S timew
  # Ubuntu/Debian
  sudo apt install timewarrior
  # Fedora
  sudo dnf install timewarrior
  ```

- **TaskWarrior** - Task management integration
  ```bash
  # Arch Linux
  sudo pacman -S task
  # Ubuntu/Debian
  sudo apt install taskwarrior
  # Fedora
  sudo dnf install taskwarrior
  ```

#### System Monitoring (Optional)

- **lm-sensors** - Temperature monitoring
  ```bash
  # Arch Linux
  sudo pacman -S lm_sensors
  # Ubuntu/Debian
  sudo apt install lm-sensors
  # Fedora
  sudo dnf install lm_sensors
  ```

- **radeontop** - AMD GPU monitoring (for AMD users)
  ```bash
  # Arch Linux
  sudo pacman -S radeontop
  # Ubuntu/Debian
  sudo apt install radeontop
  ```

#### Window Manager Integration

- **Hyprland** - Enhanced window manager integration (recommended)
  ```bash
  # Arch Linux
  sudo pacman -S hyprland
  # Ubuntu/Debian (recent versions)
  sudo apt install hyprland
  ```

### External Repositories (Optional Advanced Features)

Some advanced features require external tools:

#### **[Flowmodoro CLI](https://github.com/LuisFerRodVar/flowmodoro-cli)**

Powers the adaptive Pomodoro timer with flexible work/break intervals:

```bash
git clone https://github.com/LuisFerRodVar/flowmodoro-cli.git
cd flowmodoro-cli
# Follow installation instructions in the repository
```

#### **[Live WPM Tracker](https://github.com/LuisFerRodVar/live_wpm_tracker)**

Enables real-time typing speed monitoring and analytics:

```bash
git clone https://github.com/LuisFerRodVar/live_wpm_tracker.git
cd live_wpm_tracker
# Follow installation instructions in the repository
```

### Installation

1. **Clone to AGS config directory**

   ```bash
   git clone https://github.com/yourusername/ags-config ~/.config/ags
   cd ~/.config/ags
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Make scripts executable**

   ```bash
   chmod +x scripts/*.sh
   ```

4. **Launch AGS**
   ```bash
   ags
   ```

### Toggle Commands

Control the interface with these commands (bind to your window manager):

```bash
# Application launcher
ags request "toggle-launcher"

# File finder
ags request "toggle-filefinder"

# Calculator
ags request "toggle-calculator"

# Calendar
ags request "calendar"

# Task manager
ags request "toggle-taskmanager"

# Shutdown menu
ags request "toggle-shutdown"
```

### First Run Setup

The shell automatically initializes with:

- ✅ Top bar with workspace indicators and current application
- ✅ Dashboard with productivity widgets (time, monitoring, tasks)
- ✅ Media controls in bottom bar with track information
- ✅ Notification system with custom styling
- ✅ Volume OSD with smooth animations
- ✅ All launchers configured (hidden by default)

## ⚙️ Configuration

### Widget Customization

Each component accepts monitor targeting and visibility props:

```typescript
// Example: Multi-monitor setup
Dashboard({ monitor: 0 }); // Primary monitor
Bar({ monitor: 1 }); // Secondary monitor
```

### Hyprland Integration

Add these bindings to your Hyprland config:

```bash
# ~/.config/hypr/hyprland.conf
bind = SUPER, SPACE, exec, ags request "toggle-launcher"
bind = SUPER, F, exec, ags request "toggle-filefinder"
bind = SUPER, C, exec, ags request "toggle-calculator"
bind = SUPER, ESC, exec, ags request "toggle-shutdown"
```

### Time Tracking Setup

Configure TimeWarrior and TaskWarrior for enhanced productivity tracking:

```bash
# Install time tracking tools
sudo pacman -S timew task  # Arch Linux
sudo apt install timewarrior taskwarrior  # Ubuntu/Debian

# Start tracking a project
timew start project-name
task add "Complete feature X" project:work
```

### Script Configuration

All backend functionality is handled by shell scripts in `/scripts/`:

- `flowmodoro.sh` - Flowmodoro timer integration
- `get_wpm.sh` - Real-time WPM calculation
- `jira.sh` - Jira API integration for project management

- `get_wpm.sh` - Real-time WPM calculation (requires live_wpm_tracker)
- `jira.sh` - Jira API integration for project management
- `monitor.sh` - System resource monitoring (CPU, GPU, memory, disk, network)
- `timewarrior.sh` - Time tracking integration
- `taskwarrior.sh` - Task management
- `hyprctl-*.sh` - Hyprland window manager integration
- `cava-astal.sh` - Audio visualization (requires CAVA)
- `media-player.sh` - Media control backend (requires playerctl)

Edit script constants and endpoints to match your environment.

## 🎨 Theming

### CSS Customization

Edit `src/styles/style.css` for custom styling:

```css
/* Dashboard grid layout */
.dashboard-window {
  background: rgba(0, 0, 0, 0.9);
  borderrequestadius: 12px;
}

.dashboard-card {
  background: rgba(46, 52, 64, 0.95);
  border-radius: 8px;
  border: 1px solid rgba(76, 86, 106, 0.3);
  margin: 4px;
  padding: 12px;
}

/* Widget-specific styling */
.clock-card {
  border-left: 3px solid #88c0d0;
}
.monitoring-card {
  border-left: 3px solid #a3be8c;
}
.timewarrior-card {
  border-left: 3px solid #ebcb8b;
}
.flowmodoro-card {
  border-left: 3px solid #bf616a;
}
.jira-card {
  border-left: 3px solid #b48ead;
}
```

### Theme Integration

The shell automatically adapts to:

- GTK theme colors for consistent system integration
- Nord color palette for modern aesthetics
- Custom accent colors for different widget types
- Transparency and blur effects for visual depth

## 📊 Widget Details

### 🕐 Clock Widget

- **Format**: 24-hour display with real-time updates
- **Styling**: Clean typography with subtle animations
- **Position**: Top-left of dashboard grid

### ⌨️ WPM Counter

- **Tracking**: Live typing speed with rolling averages
- **Display**: Current WPM with history indicators
- **Integration**: Uses live_wpm_tracker for accuracy
- **Updates**: Real-time with configurable intervals

### 🍅 Flowmodoro Timer

- **Technique**: Adaptive work/break intervals based on flow state
- **Features**: Session tracking, notifications, statistics
- **Integration**: Flowmodoro CLI backend
- **Controls**: Start, pause, reset functionality

### 💻 TimeWarrior Integration

- **Time Tracking**: Professional project time monitoring
- **Sessions**: Automatic detection and display
- **Projects**: Multi-project support with tags
- **Reporting**: Real-time session duration and status

### 📊 System Monitoring

- **CPU**: Real-time usage percentage and load averages
- **Memory**: RAM usage with swap information
- **Temperature**: System thermal monitoring
- **Processes**: Active process count and system uptime
- **Network**: Connection status and activity

### 📋 TaskWarrior

- **Tasks**: Active task display with priorities and status tracking
- **Progress**: Shows pending tasks count with color-coded status indicators
- **Completed**: Displays recently completed tasks
- **Integration**: TaskWarrior database sync with real-time updates

### 🎯 Jira Integration

- **Projects**: Active project display
- **Issues**: Current assignments and status
- **API**: Direct workspace integration
- **Updates**: Real-time issue tracking

### ⌨️ Key History Tracking

- **Analytics**: Keystroke patterns and frequency
- **Monitoring**: Real-time input tracking
- **Privacy**: Local processing only
- **Statistics**: Typing behavior insights

### 🚀 Launchers & Tools

#### Application Launcher

- **Fuzzy Search**: Instant application discovery with smart filtering
- **Keyboard Navigation**: Arrow keys, Enter to launch, ESC to close
- **Multi-monitor**: Automatically appears on focused monitor
- **Theming**: Consistent styling with blur effects

#### 🔍 File Finder

- **Ultra-Fast Search**: `fd`-powered file discovery across home directory
- **Real-time Results**: Instant filtering with 2+ character queries
- **File Type Recognition**: Icons and preview support
- **Direct Opening**: Launch files with default applications
- **Hidden File Support**: Comprehensive file system coverage

#### 🧮 Calculator

- **Mathematical Engine**: Powered by Mathics for advanced mathematical computations
- **Advanced Operations**: Supports derivatives (Alt+D), integration (Alt+I), factoring (Alt+F)
- **Expression Support**: Complex mathematical expressions with symbolic computation
- **History**: Previous calculation recall and result copying
- **Keyboard Shortcuts**: 
  - Enter: Evaluate expression
  - Alt+D: Derivative calculation
  - Alt+I: Integration
  - Alt+E: Expand expressions
  - Alt+F: Factor expressions
  - Alt+S: Simplify expressions

#### 📅 Calendar

- **Date Reference**: Quick date lookup and navigation
- **Month View**: Clean calendar display
- **Scheduling**: Integration ready for calendar apps
- **Hotkey Access**: Instant calendar toggle

#### 🔧 Task Manager

- **Process Monitoring**: Real-time system process overview
- **Resource Usage**: Per-process CPU and memory statistics
- **Process Control**: Kill/manage running processes
- **System Health**: Quick system performance overview

#### 🔌 Shutdown Menu

- **Power Options**: Shutdown, restart, logout, suspend
- **Confirmation**: Safety prompts for destructive actions
- **Quick Access**: Emergency system control
- **Session Management**: User session handling

## 🔧 Advanced Usage

### Multi-Monitor Configuration

```typescript
// app.ts - Configure for multiple monitors
app.start({
  main() {
    Bar({ monitor: 0 }); // Primary monitor top bar
    Dashboard({ monitor: 0 }); // Dashboard on primary
    Botbar({ monitor: 0 }); // Media controls on primary

    // Launchers auto-detect focused monitor
    Launcher({ monitor: 0, visible: false });
    FileFinder({ monitor: 0, visible: false });
  },
});
```

### Hyprland Workspace Integration

The shell provides deep Hyprland integration:

```bash
# Window information
scripts/hyprctl-window.sh      # Current window details
scripts/hyprctl-workspace.sh   # Active workspace info
scripts/hyprctl-monitors.sh    # Monitor configuration

# Example workspace binding
bind = SUPER, 1, exec, hyprctl dispatch workspace 1
```

### Custom Widget Development

Create new widgets following the established patterns:

```typescript
import { ComponentProps } from "../../types";
import { useScript } from "../../utils/hooks";
import { SCRIPTS, POLL_INTERVALS } from "../../config/constants";

export default function CustomWidget({ monitor = 0 }: ComponentProps) {
  const data = useScript<CustomData>(
    SCRIPTS.CUSTOM_SCRIPT,
    POLL_INTERVALS.NORMAL,
    { fallback: "data" }
  );

  return (
    <box class="dashboard-card custom-widget">
      <label label={data?.value || "Loading..."} />
    </box>
  );
}
```

### External API Integration

The shell supports various external service integrations:

- **Jira API**: Project management and issue tracking
- **Weather Services**: Current conditions and forecasts
- **Media APIs**: Enhanced music/video information
- **Time Tracking**: Professional productivity analytics
- **System APIs**: Deep OS integration and monitoring

## 🛠️ Development

### Project Architecture

- **TypeScript**: Strict mode with comprehensive type safety
- **JSX**: React-like component syntax via AGS framework
- **CSS**: Modern styling with CSS3 features and custom properties
- **Modular Design**: Reusable components with clear interfaces
- **Script Architecture**: External shell scripts for all system interactions

### Development Workflow

```bash
# Start development session
ags

# Live reload (restart AGS after changes)
pkill ags && ags

# Debug mode with inspector
ags inspect
```

### Code Style Guidelines

Follow the patterns defined in `AGENTS.md`:

1. **Component Structure**: Use `ComponentProps` interface and default exports
2. **Script Integration**: All system calls through `/scripts/` directory
3. **State Management**: Use `useScript()` hooks for polling data
4. **Error Handling**: Implement graceful fallbacks for all external dependencies
5. **Performance**: Use appropriate polling intervals from constants

### Contributing

1. **Type Safety**: All components must be fully typed
2. **Documentation**: Clear JSDoc comments for public interfaces
3. **Performance**: Efficient polling and minimal renders
4. **Accessibility**: Proper GTK accessibility attributes
5. **Testing**: Manual testing across different system states

## 📈 Performance

- **Memory Usage**: ~50MB baseline (efficient GTK4 rendering)
- **CPU Impact**: <1% on modern systems (optimized polling intervals)
- **Startup Time**: <2 seconds to full functionality
- **Resource Monitoring**: Built-in performance tracking widgets
- **Battery Friendly**: Power-aware polling and animations

## 🐛 Troubleshooting

### Common Issues

**AGS not starting:**

```bash
# Check AGS installation
which ags
ags --version

# Verify dependencies
npm list
```

**Widgets not updating:**

```bash
# Check script permissions
chmod +x scripts/*.sh

# Verify external tools
timew --version
task --version
fd --version
playerctl --version
mathics --version
```

**Calculator not working:**

```bash
# Check Mathics installation
mathics --version
pip install mathics-core

# Test basic calculation
echo "2+2" | mathics
```

**Audio visualization issues:**

```bash
# Check CAVA installation
cava --version

# Test audio detection
pactl list short sink-inputs
```

**Media controls not working:**

```bash
# Check playerctl
playerctl status
playerctl metadata

# Check audio players
pactl list short sink-inputs
```

**Hyprland integration issues:**

```bash
# Check Hyprland socket
ls -la /tmp/hypr/
hyprctl version
```

**Styling issues:**

```bash
# Force CSS reload
pkill ags && ags

# Check GTK theme
gsettings get org.gnome.desktop.interface gtk-theme
```

## 📄 License

This AGS configuration is open source and available under the MIT License. Feel free to fork, modify, and distribute according to your needs.

## 🙏 Acknowledgments

- **[Aylur](https://github.com/Aylur)** - Creator of AGS framework
- **GTK Team** - GTK4 toolkit and ecosystem
- **Hyprland Community** - Window manager integration and support
- **Community Contributors** - Widget ideas, improvements, and feedback

---

**Transform your desktop into a productivity powerhouse with this advanced AGS configuration!**

⭐ Star this repository if you find it useful, and feel free to contribute improvements and new widgets.
