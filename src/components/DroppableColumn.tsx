import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export default function DroppableColumn({ id, children, className }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`${className} ${isOver ? 'ring-2 ring-indigo-400 bg-indigo-50/50' : ''} transition-colors duration-200`}
        >
            {children}
        </div>
    );
}
