import { useState, useRef, useEffect } from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    onComplete: () => void;
    onDelete: () => void;
    onClose: () => void;
    isCompleted: boolean;
}

export default function ContextMenu({
    x,
    y,
    onComplete,
    onDelete,
    onClose,
    isCompleted,
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Adjust position to keep menu in viewport
    const adjustedX = Math.min(x, window.innerWidth - 160);
    const adjustedY = Math.min(y, window.innerHeight - 120);

    return (
        <div
            ref={menuRef}
            className="fixed z-[100] bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
            style={{ left: adjustedX, top: adjustedY }}
        >
            <button
                onClick={() => {
                    onComplete();
                    onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
                <span>{isCompleted ? '↩️' : '✅'}</span>
                {isCompleted ? 'Mark as Pending' : 'Mark as Done'}
            </button>
            <button
                onClick={() => {
                    onDelete();
                    onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            >
                <span>🗑️</span>
                Delete
            </button>
        </div>
    );
}
