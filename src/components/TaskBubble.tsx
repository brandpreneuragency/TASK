import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Task, User } from '../types';
import ContextMenu from './ContextMenu';

interface TaskBubbleProps {
    task: Task;
    projectName: string;
    isRightAligned: boolean;
    assignerUser?: User;
    onToggleComplete: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function TaskBubble({
    task,
    projectName,
    isRightAligned,
    assignerUser,
    onToggleComplete,
    onDelete,
    onClick,
}: TaskBubbleProps) {
    const isCompleted = task.status === 'DONE';
    const deadlineDate = new Date(task.deadline);
    const isOverdue = !isCompleted && deadlineDate < new Date();

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    // Priority colors
    const priorityColors = {
        high: 'bg-rose-500',
        medium: 'bg-amber-500',
        low: 'bg-emerald-500',
    };

    // Swipe Handlers
    const [swipeOffset, setSwipeOffset] = useState(0);
    const handlers = useSwipeable({
        onSwiping: (data) => setSwipeOffset(data.deltaX),
        onSwipedLeft: (data) => {
            if (data.absX > 100) {
                onDelete();
            }
            setSwipeOffset(0);
        },
        onSwipedRight: (data) => {
            if (data.absX > 100) {
                onToggleComplete();
            }
            setSwipeOffset(0);
        },
        onSwiped: () => setSwipeOffset(0),
        trackMouse: true, // Enable mouse swiping for testing
        delta: 10,
    });

    const isSwiping = Math.abs(swipeOffset) > 0;
    const swipeAction = swipeOffset > 0 ? 'complete' : 'delete';
    const swipeOpacity = Math.min(Math.abs(swipeOffset) / 100, 1);

    return (
        <div
            className="flex items-end gap-2 relative"
        >
            {/* Avatar for left-aligned (assigned by others) */}
            {!isRightAligned && assignerUser && (
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                    style={{ backgroundColor: assignerUser.color }}
                >
                    {assignerUser.username.charAt(0)}
                </div>
            )}

            {/* Swipe Background Indicators */}
            {isSwiping && (
                <div
                    className={`
                        absolute inset-y-0 left-0 w-full rounded-2xl flex items-center justify-end px-4 font-bold text-white transition-colors
                        ${swipeAction === 'complete' ? 'bg-emerald-500' : 'bg-rose-500'}
                    `}
                    style={{ opacity: swipeOpacity }}
                >
                    {swipeAction === 'complete' ? '✅ Complete' : '🗑️ Delete'}
                </div>
            )}

            {/* Bubble */}
            <div
                {...handlers}
                onClick={(e) => {
                    if (isSwiping) return; // Prevent click during/after swipe
                    onClick();
                }}
                onContextMenu={handleContextMenu}
                className={`
                group relative w-full rounded-2xl px-4 py-3 shadow-sm
          transition-transform duration-75 cursor-pointer touch-pan-y
                rounded-bl-md
          ${isCompleted
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-white border border-gray-100'
                    }
        `}
                style={{
                    transform: `translateX(${swipeOffset}px)`,
                    zIndex: 10
                }}
            >
                {/* Priority Dot */}
                <div
                    className={`absolute top-3 right-3 w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
                />

                {/* Title */}
                <p
                    className={`
            font-medium text-gray-800 pr-4 select-none
            ${isCompleted ? 'line-through text-gray-500' : ''}
          `}
                >
                    {task.title}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 select-none">
                    {/* Project Icon */}
                    <span className="flex items-center gap-1">
                        <span>📁</span>
                        <span>{projectName}</span>
                    </span>

                    {/* Deadline Icon */}
                    <span
                        className={`flex items-center gap-1 ${isOverdue ? 'text-rose-500 font-medium' : ''}`}
                    >
                        <span>📅</span>
                        <span>
                            {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </span>

                    {/* Subtasks count */}
                    {task.subtasks.length > 0 && (
                        <span className="flex items-center gap-1">
                            <span>✓</span>
                            <span>
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                        </span>
                    )}
                </div>

                {/* Hover Actions (Desktop) */}
                <div
                    className={`
            absolute top-1/2 -translate-y-1/2
                        -right-20
            opacity-0 group-hover:opacity-100 transition-opacity
            flex items-center gap-1 md:flex hidden
          `}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete();
                        }}
                        className="p-2 bg-white rounded-full shadow hover:bg-emerald-50 transition-colors"
                        title={isCompleted ? 'Mark as pending' : 'Mark as done'}
                    >
                        <span className="text-sm">{isCompleted ? '↩️' : '✅'}</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-2 bg-white rounded-full shadow hover:bg-rose-50 transition-colors"
                        title="Delete task"
                    >
                        <span className="text-sm">🗑️</span>
                    </button>
                </div>
            </div>

            {/* Context Menu */}
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
        </div>
    );
}
