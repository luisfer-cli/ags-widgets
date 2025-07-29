/**
 * TypeScript type definitions for AGS Desktop Shell Configuration
 */

// Base types
export type WidgetStatus = 'active' | 'inactive' | 'loading' | 'error';
export type TimerStatus = 'pending' | 'done' | 'progress';

// Component props
export interface ComponentProps {
    monitor?: number;
    className?: string;
    visible?: boolean;
}

// Bar component types
export interface BarStatus {
    workspace: number;
    app: string;
}

export interface HyprlandWorkspace {
    id: number;
    name: string;
    monitor: string;
    windows: number;
    hasfullscreen: boolean;
    lastwindow: string;
    lastwindowtitle: string;
}

export interface HyprlandWindow {
    address: string;
    mapped: boolean;
    hidden: boolean;
    at: [number, number];
    size: [number, number];
    workspace: HyprlandWorkspace;
    floating: boolean;
    monitor: number;
    class: string;
    title: string;
    initialClass: string;
    initialTitle: string;
    pid: number;
    xwayland: boolean;
    pinned: boolean;
    fullscreen: boolean;
    fullscreenmode: number;
    fakeFullscreen: boolean;
    grouped: any[];
    swallowing: string;
}

// Dashboard component types
export interface FlowmodoroStatus {
    alt: TimerStatus;
    current: string;
    time: string;
}

export interface ChessStatus {
    alt: TimerStatus;
    current: string;
    time: string;
}

export interface ChessStats {
    rating: number;
    games: number;
    winRate: number;
}

export interface MonitoringData {
    cpu: number;
    memory: number;
    temperature: number;
}

export interface WeatherData {
    temperature: number;
    condition: string;
    location: string;
}

export interface WpmData {
    wpm: number;
    accuracy: number;
    status: string;
}

// Media types
export interface MediaPlayerStatus {
    artist: string;
    title: string;
    status: 'Playing' | 'Paused' | 'Stopped';
}

// Audio types
export interface AudioDevice {
    index: number;
    name: string;
    description: string;
    volume: number;
    muted: boolean;
}

export interface AudioState {
    sinks: AudioDevice[];
    sources: AudioDevice[];
    defaultSink: string;
    defaultSource: string;
}

// Notification types
export interface NotificationData {
    id: string;
    title: string;
    body: string;
    urgency: 'low' | 'normal' | 'critical';
    timestamp: number;
}

// OSD types
export interface OSDData {
    type: 'volume' | 'brightness' | 'media';
    value: number;
    icon: string;
    label?: string;
}

// Launcher component types
export interface LauncherProps extends ComponentProps {
    maxResults?: number;
}

export interface FileSearchResult {
    path: string;
    name: string;
    type: 'file' | 'directory';
    size?: number;
    modified?: Date;
}

// System types
export interface SystemCommand {
    name: string;
    command: string;
    description: string;
    icon?: string;
}

// Poll hook types
export interface PollOptions<T> {
    interval?: number;
    fallback?: T;
    onError?: (error: Error) => void;
}