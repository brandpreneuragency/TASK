import { useState } from 'react';
import type { Task, Project } from '../types';
import TaskCard from '../components/TaskCard';

interface CalendarViewProps {
    tasks: Task[];
    projects: Project[];
    onOpenTask: (task: Task) => void;
    onAddTaskWithDate: (date: Date) => void;
}

export default function CalendarView({ tasks, projects, onOpenTask, onAddTaskWithDate }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get days in month and first day of week
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    // Create calendar grid
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    // Get tasks count for a specific day
    const getTasksForDay = (day: number) => {
        const dateStr = new Date(year, month, day).toDateString();
        return tasks.filter((t) => new Date(t.deadline).toDateString() === dateStr);
    };

    // Heatmap intensity (soft colors per spec)
    const getHeatmapClass = (taskCount: number) => {
        if (taskCount === 0) return '';
        if (taskCount < 6) return 'bg-indigo-100 text-indigo-700';
        if (taskCount <= 10) return 'bg-indigo-400 text-white';
        return 'bg-purple-500 text-white';
    };

    const getProjectName = (id: string) => projects.find((p) => p.id === id)?.name || 'Unknown';

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const handleDayClick = (day: number) => {
        setSelectedDate(new Date(year, month, day));
    };

    return (
        <div className="h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-lg font-semibold text-gray-800 min-w-[140px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Desktop: 7-column grid */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {days.map((day, idx) => {
                        const dayTasks = day ? getTasksForDay(day) : [];
                        const heatmapClass = getHeatmapClass(dayTasks.length);

                        return (
                            <div
                                key={idx}
                                onClick={() => day && handleDayClick(day)}
                                className={`
                                    min-h-[220px] p-2 border-b border-r border-gray-100
                  ${day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                  ${isToday(day || 0) ? 'ring-2 ring-inset ring-indigo-400' : ''}
                `}
                            >
                                {day && (
                                    <>
                                        <div
                                            className={`
                        w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1
                        ${heatmapClass || 'text-gray-700'}
                      `}
                                        >
                                            {day}
                                        </div>
                                        {/* Task previews */}
                                        <div className="space-y-1">
                                            {dayTasks.slice(0, 6).map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="text-xs text-gray-600 truncate px-1 py-0.5 bg-gray-100 rounded"
                                                >
                                                    {task.title}
                                                </div>
                                            ))}
                                            {dayTasks.length > 6 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDayClick(day);
                                                    }}
                                                    className="text-xs text-indigo-600 font-medium px-1 underline underline-offset-2 hover:text-indigo-700"
                                                >
                                                    +({dayTasks.length - 6}) More
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile: Day Drawer / List View */}
            <div className="md:hidden space-y-4">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayTasks = getTasksForDay(day);


                    const dateObj = new Date(year, month, day);

                    return (
                        <div key={day} className="bg-white rounded-xl p-4 shadow-sm" onClick={() => handleDayClick(day)}>
                            {/* Sticky Date Header */}
                            <div
                                className={`
                  sticky top-0 flex items-center gap-2 mb-3 pb-2 border-b border-gray-100
                  ${isToday(day) ? 'text-indigo-600' : 'text-gray-800'}
                `}
                            >
                                <span className="text-lg font-bold">{day}</span>
                                <span className="text-sm text-gray-500">
                                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                {isToday(day) && (
                                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                        Today
                                    </span>
                                )}
                            </div>

                            {/* Tasks */}
                            <div className="space-y-2">
                                {dayTasks.length === 0 ? (
                                    <p className="text-sm text-gray-400">No tasks</p>
                                ) : (
                                    dayTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <span
                                                className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'high'
                                                    ? 'bg-rose-500'
                                                    : task.priority === 'medium'
                                                        ? 'bg-amber-500'
                                                        : 'bg-emerald-500'
                                                    }`}
                                            />
                                            <span className={task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-800'}>
                                                {task.title}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-auto">
                                                {getProjectName(task.groupId)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Day Detail Popup */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <p className="text-xs text-gray-500">{getTasksForDay(selectedDate.getDate()).length} tasks</p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-gray-200 rounded-lg">
                                ✕
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 space-y-3">
                            {getTasksForDay(selectedDate.getDate()).length > 0 ? (
                                getTasksForDay(selectedDate.getDate()).map(task => (
                                    <div key={task.id} onClick={() => { setSelectedDate(null); onOpenTask(task); }}>
                                        <TaskCard
                                            task={task}
                                            assignees={[]} // Not needed for simple view or pass real users if available?
                                            onToggleComplete={() => { }} // Read only in popup or handle?
                                            onDelete={() => { }} // Read only
                                            onClick={() => { setSelectedDate(null); onOpenTask(task); }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No tasks for this day
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    onAddTaskWithDate(selectedDate);
                                    setSelectedDate(null);
                                }}
                                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                            >
                                + Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
