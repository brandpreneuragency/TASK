import { useDraggable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import type { Task, User } from '../types';

interface DraggableTaskCardProps {
    task: Task;
    assignees: User[];
    onToggleComplete: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function DraggableTaskCard(props: DraggableTaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: props.task.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 100 : undefined,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
            <TaskCard {...props} />
        </div>
    );
}
