/**
 * TypeScript type definitions for AGS Desktop Shell Configuration
 */

// Bar component types
export interface BarStatus {
    workspace: number;
    app: string;
}

// Dashboard component types
export interface FlowmodoroStatus {
    alt: string;
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

// Widget status types
export type WidgetStatus = 'active' | 'inactive' | 'loading' | 'error';

// Component props
export interface ComponentProps {
    monitor?: number;
    className?: string;
    visible?: boolean;
}