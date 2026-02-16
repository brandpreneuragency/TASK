import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useState } from 'react';
import type { Task, Project, User } from '../types';
import TaskCard from '../components/TaskCard';
import DraggableTaskCard from '../components/DraggableTaskCard';
import DroppableColumn from '../components/DroppableColumn';

interface ProjectsViewProps {
    tasks: Task[];
    projects: Project[];
    users: User[];
    onUpdateTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onOpenTask: (task?: Task) => void;
}

export default function ProjectsView({
    tasks,
    projects,
    users,
    onUpdateTask,
    onDeleteTask,
    onOpenTask,
}: ProjectsViewProps) {
    // Defines sensors for drag detection (Mouse + Touch)
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // Must move 10px to start dragging (prevents accidental clicks)
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const [activeId, setActiveId] = useState<string | null>(null);

    // Group tasks by project
    const tasksByProject = projects.map((project) => ({
        project,
        tasks: tasks.filter((t) => t.groupId === project.id),
    }));

    const getUserById = (userId: string) => users.find((u) => u.id === userId);

    const handleDragStart = (event: { active: { id: string | number } }) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const taskId = active.id as string;
        const newProjectId = over.id as string;

        // Find task
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        // Verify we dropped onto a valid project column (or even a task within that column if we wanted sorting later, but for now assuming column ID)
        // Check if over.id is a project ID
        const isProject = projects.some(p => p.id === newProjectId);

        if (isProject && task.groupId !== newProjectId) {
            onUpdateTask({ ...task, groupId: newProjectId });
        }
    };

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full relative">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Projects</h1>

                {/* Kanban Board - Fixed 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4 h-auto xl:h-[calc(100vh-140px)] overflow-x-hidden min-w-0">
                    {tasksByProject.map(({ project, tasks: projectTasks }) => (
                        <div
                            key={project.id}
                            className="bg-gray-50 rounded-2xl p-4 flex flex-col min-w-0"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-4 shrink-0">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
                                    {project.name}
                                </h2>
                                <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                    {projectTasks.length}
                                </span>
                            </div>

                            {/* Droppable Area */}
                            <DroppableColumn
                                id={project.id}
                                className="flex-1 overflow-visible min-h-[100px] rounded-xl flex flex-col gap-3"
                            >
                                <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2 min-h-0">
                                    {projectTasks.map((task) => (
                                        <DraggableTaskCard
                                            key={task.id}
                                            task={task}
                                            assignees={task.assignedTo.map((id) => getUserById(id)).filter(Boolean) as User[]}
                                            onToggleComplete={() => {
                                                onUpdateTask({
                                                    ...task,
                                                    status: task.status === 'DONE' ? 'OFF' : 'DONE',
                                                });
                                            }}
                                            onDelete={() => onDeleteTask(task.id)}
                                            onClick={() => onOpenTask(task)}
                                        />
                                    ))}

                                    {projectTasks.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            <p className="text-sm">No tasks</p>
                                        </div>
                                    )}
                                </div>
                            </DroppableColumn>
                        </div>
                    ))}
                </div>

                {/* Drag Overlay for smooth dragging */}
                <DragOverlay>
                    {activeTask ? (
                        <div className="rotate-2 cursor-grabbing opacity-90 scale-105 pointer-events-none">
                            <TaskCard
                                task={activeTask}
                                assignees={activeTask.assignedTo.map((id) => getUserById(id)).filter(Boolean) as User[]}
                                onToggleComplete={() => { }}
                                onDelete={() => { }}
                                onClick={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>

                {/* FAB - Add Task */}
                <button
                    onClick={() => onOpenTask()}
                    className="
            absolute bottom-8 right-8 
            w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 
            text-white text-3xl shadow-lg hover:shadow-xl hover:scale-105 
            transition-all duration-200 flex items-center justify-center z-20
            "
                    title="Add New Task"
                >
                    +
                </button>
            </div>
        </DndContext>
    );
}
