/**
 * Calendar Widget Component
 * 
 * Provides a floating calendar with vim-style keybindings for navigation:
 * - h/l: Previous/next day
 * - j/k: Previous/next week
 * - H/L: Previous/next month
 * - J/K: Previous/next year
 * - g: Go to today
 * - t: Go to today (alias)
 * - Escape/q: Close calendar
 */
import { createState, For } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Graphene from "gi://Graphene"
import { ComponentProps } from "../../types"

export interface CalendarProps extends ComponentProps {
    showWeekNumbers?: boolean;
}

interface CalendarDay {
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    date: Date;
}

/**
 * Calendar widget with vim-style navigation
 */
export default function Calendar({
    monitor = 0,
    className = "",
    visible = false,
    showWeekNumbers = true
}: CalendarProps = {}) {
    let contentbox: Gtk.Box
    let win: Astal.Window

    /**
     * Generate calendar days for the current month view
     */
    function generateCalendarDays(year: number, month: number, selected: Date): CalendarDay[] {

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const today = new Date()

        // Start from Monday (1) instead of Sunday (0)
        const firstDayOfWeek = firstDay.getDay()
        const daysFromMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
        const startOfCalendar = new Date(firstDay)
        startOfCalendar.setDate(firstDay.getDate() - daysFromMonday)

        const days: CalendarDay[] = []
        const current = new Date(startOfCalendar)

        // Generate 6 weeks (42 days) to ensure full calendar
        for (let i = 0; i < 42; i++) {
            const isCurrentMonth = current.getMonth() === month
            const isToday = current.toDateString() === today.toDateString()
            const isSelected = current.toDateString() === selected.toDateString()

            days.push({
                day: current.getDate(),
                isCurrentMonth,
                isToday,
                isSelected,
                date: new Date(current)
            })

            current.setDate(current.getDate() + 1)
        }

        return days
    }

    const [selectedDate, setSelectedDate] = createState(new Date())
    const [currentMonth, setCurrentMonth] = createState(new Date().getMonth())
    const [currentYear, setCurrentYear] = createState(new Date().getFullYear())

    // Initialize calendar days immediately
    const today = new Date()
    const [calendarDays, setCalendarDays] = createState<CalendarDay[]>(
        generateCalendarDays(today.getFullYear(), today.getMonth(), today)
    )

    /**
     * Update calendar days when date changes
     */
    function updateCalendar() {
        const days = generateCalendarDays(currentYear.get(), currentMonth.get(), selectedDate.get())
        setCalendarDays(days)
    }

    /**
     * Handle closing with animation
     */
    function closeWithAnimation() {
        win.visible = false
    }

    /**
     * Navigate to today
     */
    function goToToday() {
        const today = new Date()
        setSelectedDate(today)
        setCurrentMonth(today.getMonth())
        setCurrentYear(today.getFullYear())
        updateCalendar()
    }

    /**
     * Navigate by days
     */
    function navigateDay(direction: number) {
        const current = new Date(selectedDate.get())
        current.setDate(current.getDate() + direction)
        setSelectedDate(current)
        setCurrentMonth(current.getMonth())
        setCurrentYear(current.getFullYear())
        updateCalendar()
    }

    /**
     * Navigate by weeks
     */
    function navigateWeek(direction: number) {
        const current = new Date(selectedDate.get())
        current.setDate(current.getDate() + (direction * 7))
        setSelectedDate(current)
        setCurrentMonth(current.getMonth())
        setCurrentYear(current.getFullYear())
        updateCalendar()
    }

    /**
     * Navigate by months
     */
    function navigateMonth(direction: number) {
        const current = new Date(selectedDate.get())
        current.setMonth(current.getMonth() + direction)
        setSelectedDate(current)
        setCurrentMonth(current.getMonth())
        setCurrentYear(current.getFullYear())
        updateCalendar()
    }

    /**
     * Navigate by years
     */
    function navigateYear(direction: number) {
        const current = new Date(selectedDate.get())
        current.setFullYear(current.getFullYear() + direction)
        setSelectedDate(current)
        setCurrentMonth(current.getMonth())
        setCurrentYear(current.getFullYear())
        updateCalendar()
    }

    /**
     * Handle vim-style keyboard navigation
     */
    function onKey(
        _e: Gtk.EventControllerKey,
        keyval: number,
        _: number,
        mod: number,
    ) {
        // Ignore modified keys except for our specific uppercase keys
        if (mod & (Gdk.ModifierType.CONTROL_MASK | Gdk.ModifierType.ALT_MASK)) {
            return
        }

        switch (keyval) {
            // Close calendar
            case Gdk.KEY_Escape:
            case Gdk.KEY_q:
                closeWithAnimation()
                return

            // Navigation: h/l for day, j/k for week
            case Gdk.KEY_h:
                navigateDay(-1) // h: previous day
                return

            case Gdk.KEY_l:
                navigateDay(1) // l: next day
                return

            case Gdk.KEY_H:
                navigateMonth(-1) // H: previous month
                return

            case Gdk.KEY_L:
                navigateMonth(1) // L: next month
                return

            case Gdk.KEY_j:
                navigateWeek(1) // j: next week (down)
                return

            case Gdk.KEY_k:
                navigateWeek(-1) // k: previous week (up)
                return

            case Gdk.KEY_J:
                navigateYear(-1) // J: previous year
                return

            case Gdk.KEY_K:
                navigateYear(1) // K: next year
                return

            // Go to today
            case Gdk.KEY_g:
            case Gdk.KEY_t:
                goToToday()
                return

            // Arrow keys as fallback
            case Gdk.KEY_Left:
                navigateDay(-1)
                return
            case Gdk.KEY_Right:
                navigateDay(1)
                return
            case Gdk.KEY_Up:
                navigateWeek(-1)
                return
            case Gdk.KEY_Down:
                navigateWeek(1)
                return
        }
    }

    /**
     * Close calendar when clicking outside content area
     */
    function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
        const [, rect] = contentbox.compute_bounds(win)
        const position = new Graphene.Point({ x, y })

        if (!rect.contains_point(position)) {
            closeWithAnimation()
            return true
        }
    }

    /**
     * Format date for display
     */
    function formatDate(date: Date): string {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    /**
     * Get day class names for styling
     */
    function getDayClasses(day: CalendarDay): string {
        let classes = "calendar-day"
        if (!day.isCurrentMonth) classes += " other-month"
        if (day.isToday) classes += " today"
        if (day.isSelected) classes += " selected"
        return classes
    }

    /**
     * Handle day click
     */
    function onDayClick(day: CalendarDay) {
        setSelectedDate(day.date)
        setCurrentMonth(day.date.getMonth())
        setCurrentYear(day.date.getFullYear())
        updateCalendar()
    }

    return (
        <window
            $={(ref) => (win = ref)}
            class={`calendar ${className}`}
            name="calendar"
            anchor={1}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.EXCLUSIVE}
            visible={visible}
            monitor={monitor}
            onNotifyVisible={({ visible }) => {
                if (visible) {
                    // Initialize to today
                    const today = new Date()
                    setSelectedDate(today)
                    setCurrentMonth(today.getMonth())
                    setCurrentYear(today.getFullYear())
                    updateCalendar()
                }
            }}
        >
            <Gtk.EventControllerKey onKeyPressed={onKey} />
            <Gtk.GestureClick onPressed={onClick} />
            <box
                $={(ref) => (contentbox = ref)}
                name="calendar-content"
                height_request={500}
                width_request={400}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                orientation={Gtk.Orientation.VERTICAL}
            >
                {/* Header Section */}
                <box class="calendar-header" orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.CENTER}>
                    <label
                        label="Calendario"
                        class="calendar-title"
                    />
                    <label
                        label={currentMonth((month) => {
                            const months = [
                                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                            ]
                            return `${months[month]} ${currentYear.get()}`
                        })}
                        class="calendar-month-year"
                    />
                </box>

                {/* Calendar Grid */}
                <box class="calendar-widget-container" orientation={Gtk.Orientation.VERTICAL}>
                    {/* Week headers */}
                    <Gtk.FlowBox
                        class="week-headers"
                        columnSpacing={2}
                        rowSpacing={0}
                        maxChildrenPerLine={7}
                        minChildrenPerLine={7}
                        selectionMode={Gtk.SelectionMode.NONE}
                        homogeneous={true}
                    >
                        <label class="day-header" label="L" />
                        <label class="day-header" label="M" />
                        <label class="day-header" label="X" />
                        <label class="day-header" label="J" />
                        <label class="day-header" label="V" />
                        <label class="day-header" label="S" />
                        <label class="day-header" label="D" />
                    </Gtk.FlowBox>

                    {/* Calendar days using FlowBox */}
                    <Gtk.FlowBox
                        class="calendar-grid"
                        columnSpacing={2}
                        rowSpacing={2}
                        maxChildrenPerLine={7}
                        minChildrenPerLine={7}
                        selectionMode={Gtk.SelectionMode.NONE}
                        homogeneous={true}
                    >
                        <For each={calendarDays}>
                            {(day) => (
                                <button
                                    class={getDayClasses(day)}
                                    onClicked={() => onDayClick(day)}
                                >
                                    <label label={day.day.toString()} />
                                </button>
                            )}
                        </For>
                    </Gtk.FlowBox>
                </box>

                {/* Selected Date Display */}
                <box class="calendar-footer" halign={Gtk.Align.CENTER}>
                    <label
                        label={selectedDate((date) => formatDate(date))}
                        class="selected-date"
                        wrap
                    />
                </box>
            </box>
        </window>
    )
}
