import { useState } from 'react';
import type { Task, User } from '../types';
import ContextMenu from './ContextMenu';

interface TaskCardProps {
    task: Task;
    assignees: User[];
    onToggleComplete: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function TaskCard({
    task,
    assignees,
    onToggleComplete,
    onDelete,
    onClick,
}: TaskCardProps) {
    const isCompleted = task.status === 'DONE';
    const deadlineDate = new Date(task.deadline);
    const isOverdue = !isCompleted && deadlineDate < new Date();

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <>
            <div
                onClick={onClick}
                onContextMenu={handleContextMenu}
                className={`
                group relative bg-white rounded-xl p-4 shadow-sm border border-gray-100
          hover:shadow-md transition-all duration-200 cursor-pointer
          ${isCompleted ? 'opacity-70' : ''}
        `}
            >
                {/* Title */}
                <h3
                    className={`
            font-medium text-gray-800 mb-2
            ${isCompleted ? 'line-through text-gray-500' : ''}
          `}
                >
                    {task.title}
                </h3>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    {/* Deadline */}
                    <span
                        className={`flex items-center gap-1 ${isOverdue ? 'text-rose-500 font-medium' : ''}`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v3M16 4v3M4 9h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" />
                        </svg>
                        {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>

                    {/* Assignees */}
                    {assignees.length > 0 ? (
                        <div className="flex items-center -space-x-2">
                        {assignees.slice(0, 3).map((user) => (
                            <div
                                key={user.id}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                style={{ backgroundColor: user.color }}
                                title={user.username}
                            >
                                {user.username.charAt(0)}
                            </div>
                        ))}
                        {assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                                +{assignees.length - 3}
                            </div>
                        )}
                        </div>
                    ) : (
                        <span className="text-gray-400">Unassigned</span>
                    )}
                </div>

            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onComplete={onToggleComplete}
                    onDelete={onDelete}
                    onClose={() => setContextMenu(null)}
                    isCompleted={isCompleted}
                />
            )}
        </>
    );
}
