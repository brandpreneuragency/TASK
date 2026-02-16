import { useState } from 'react';
import type { Task, User, Project } from '../types';
import TaskBubble from '../components/TaskBubble';

interface HomeViewProps {
    tasks: Task[];
    users: User[];
    projects: Project[];
    currentUser: User;
    onAddTask: (title: string) => void;
    onUpdateTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onOpenTask: (task: Task) => void;
}

// Helper to group tasks by date
function getDateLabel(dateStr: string): string {
    const taskDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset times for comparison
    taskDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (taskDate.getTime() >= today.getTime()) return 'Today';
    if (taskDate.getTime() >= yesterday.getTime()) return 'Yesterday';
    return 'Earlier';
}

export default function HomeView({
    tasks,
    users,
    projects,
    currentUser,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
    onOpenTask,
}: HomeViewProps) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

    const tasksInSelectedProject =
        selectedProjectId === 'all'
            ? tasks
            : tasks.filter((task) => task.groupId === selectedProjectId);

    // Sort tasks by deadline (newest at bottom for chat style)
    const sortedTasks = [...tasksInSelectedProject].sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    // Group by date label
    const groupedTasks = sortedTasks.reduce((acc, task) => {
        const label = getDateLabel(task.deadline);
        if (!acc[label]) acc[label] = [];
        acc[label].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const dateOrder = ['Earlier', 'Yesterday', 'Today'];

    const projectTaskCounts = projects.reduce((acc, project) => {
        acc[project.id] = tasks.filter((task) => task.groupId === project.id).length;
        return acc;
    }, {} as Record<string, number>);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            onAddTask(newTaskTitle.trim());
            setNewTaskTitle('');
        }
    };

    const getProjectName = (projectId: string) => {
        return projects.find((p) => p.id === projectId)?.name || 'Unknown';
    };

    const getUserById = (userId: string) => {
        return users.find((u) => u.id === userId);
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Project Filter */}
            <div className="mb-4 overflow-x-auto pb-1">
                <div className="flex items-center gap-3 min-w-max pr-1">
                    <button
                        type="button"
                        onClick={() => setSelectedProjectId('all')}
                        className={`
              inline-flex items-center gap-2 px-5 py-2 rounded-full border transition-all
              ${selectedProjectId === 'all'
                                ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }
            `}
                    >
                        <span className="text-sm font-semibold">All Tasks</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedProjectId === 'all' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                            {tasks.length}
                        </span>
                    </button>

                    {projects.map((project) => (
                        <button
                            key={project.id}
                            type="button"
                            onClick={() => setSelectedProjectId(project.id)}
                            className={`
                inline-flex items-center gap-2 px-5 py-2 rounded-full border transition-all
                ${selectedProjectId === project.id
                                    ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                }
              `}
                        >
                            <span className="text-sm font-semibold">{project.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedProjectId === project.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                                {projectTaskCounts[project.id] || 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-auto space-y-6 pb-24">
                {dateOrder.map((dateLabel) => {
                    const dateTasks = groupedTasks[dateLabel];
                    if (!dateTasks?.length) return null;

                    return (
                        <div key={dateLabel}>
                            {/* Date Separator */}
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                    {dateLabel}
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="space-y-3">
                                {dateTasks.map((task) => {
                                    const assignerUser = getUserById(task.assignedTo[0]);

                                    return (
                                        <TaskBubble
                                            key={task.id}
                                            task={task}
                                            projectName={getProjectName(task.groupId)}
                                            isRightAligned={false}
                                            assignerUser={assignerUser}
                                            onToggleComplete={() => {
                                                onUpdateTask({
                                                    ...task,
                                                    status: task.status === 'DONE' ? 'OFF' : 'DONE',
                                                });
                                            }}
                                            onDelete={() => onDeleteTask(task.id)}
                                            onClick={() => onOpenTask(task)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {sortedTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <span className="text-6xl mb-4">💬</span>
                        <p className="text-lg font-medium">No tasks found</p>
                        <p className="text-sm">
                            {selectedProjectId === 'all'
                                ? 'Start typing to create your first task'
                                : 'No tasks in this project yet'}
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Input Pill */}
            <form
                onSubmit={handleSubmit}
                className="fixed z-50 bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl"
            >
                <div className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 hover:shadow-xl transition-shadow">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Type a new task..."
                        className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className={`
              p-2 rounded-full transition-all duration-200
              ${newTaskTitle.trim()
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }
            `}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
