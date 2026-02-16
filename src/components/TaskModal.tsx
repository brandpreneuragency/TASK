import { useState, useEffect } from 'react';
import type { Task, User, Project, Priority } from '../types';

interface TaskModalProps {
    task: Task | null;
    projects: Project[];
    users: User[];
    currentUserId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    onCreateProject: (name: string) => Project;
    onDelete?: (taskId: string) => void;
    initialDate?: string | null;
}

export default function TaskModal({
    task,
    projects,
    users,
    currentUserId,
    isOpen,
    onClose,
    onSave,
    onCreateProject,
    onDelete,
    initialDate,
}: TaskModalProps) {
    const buildInitialFormData = (activeTask: Task | null): Partial<Task> => {
        if (activeTask) {
            return {
                ...activeTask,
                assignedTo: [...activeTask.assignedTo],
                subtasks: activeTask.subtasks.map((subtask) => ({ ...subtask })),
                files: activeTask.files.map((file) => ({ ...file })),
                comments: activeTask.comments.map((comment) => ({ ...comment })),
            };
        }

        return {
            title: '',
            description: '',
            status: 'OFF',
            priority: 'medium',
            deadline: initialDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
            groupId: 'proj-general',
            assignedTo: [],
            subtasks: [],
            files: [],
            comments: [],
        };
    };

    const isNew = !task;
    const [formData, setFormData] = useState<Partial<Task>>(buildInitialFormData(task));
    const [isDescriptionEditable, setIsDescriptionEditable] = useState(isNew);
    const [newSubtask, setNewSubtask] = useState('');
    const [showNewProject, setShowNewProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [projectError, setProjectError] = useState('');

    // Comment State
    const [newComment, setNewComment] = useState('');
    const [commentFile, setCommentFile] = useState<{ name: string; url: string; type: string } | null>(null);


    // Rehydrate modal state from active task/new task defaults on every open
    useEffect(() => {
        if (!isOpen) return;

        setFormData(buildInitialFormData(task));
        setIsDescriptionEditable(!task);
        setNewSubtask('');
        setShowNewProject(false);
        setNewProjectName('');
        setProjectError('');
        setNewComment('');
        setCommentFile(null);
    }, [isOpen, task, initialDate]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title?.trim()) return;

        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const finalDeadline = formData.deadline || tomorrow;

        let groupId = formData.groupId || 'proj-general';
        if (showNewProject) {
            const trimmedProjectName = newProjectName.trim();
            if (!trimmedProjectName) {
                setProjectError('Project name is required.');
                return;
            }

            const createdProject = onCreateProject(trimmedProjectName);
            groupId = createdProject.id;
            setProjectError('');
        }

        const savedTask: Task = {
            id: task?.id || `task-${Date.now()}`,
            title: formData.title || '',
            description: formData.description || '',
            status: formData.status || 'OFF',
            priority: formData.priority || 'medium',
            deadline: finalDeadline,
            groupId,
            assignedTo: formData.assignedTo || [],
            subtasks: formData.subtasks || [],
            files: formData.files || [],
            comments: formData.comments || [],
        };

        onSave(savedTask);
        onClose();
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        setFormData((prev) => ({
            ...prev,
            subtasks: [
                ...(prev.subtasks || []),
                { id: `sub-${Date.now()}`, text: newSubtask.trim(), completed: false },
            ],
        }));
        setNewSubtask('');
    };

    const toggleSubtask = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            subtasks: prev.subtasks?.map((s) =>
                s.id === id ? { ...s, completed: !s.completed } : s
            ),
        }));
    };

    const deleteSubtask = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            subtasks: prev.subtasks?.filter((s) => s.id !== id),
        }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) { // 20MB limit
            alert('File size exceeds 20MB limit.');
            return;
        }

        const newFile = {
            name: file.name,
            url: URL.createObjectURL(file), // Simulated URL
            type: file.type
        };

        setFormData(prev => ({
            ...prev,
            files: [...(prev.files || []), newFile]
        }));
    };

    const deleteFile = (index: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files?.filter((_, i) => i !== index)
        }));
    };



    const handleCommentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            alert('File size exceeds 20MB limit.');
            return;
        }

        setCommentFile({
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type
        });
    };

    const addComment = () => {
        if (!newComment.trim() && !commentFile) return;

        const comment = {
            userId: currentUserId,
            text: newComment.trim(),
            timestamp: Date.now(),
            file: commentFile || undefined
        };

        setFormData(prev => ({
            ...prev,
            comments: [...(prev.comments || []), comment]
        }));
        setNewComment('');
        setCommentFile(null);
    };



    const priorityOptions: { value: Priority; label: string; color: string }[] = [
        { value: 'high', label: 'High', color: 'bg-rose-500' },
        { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
        { value: 'low', label: 'Low', color: 'bg-emerald-500' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="
          relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden
          animate-in zoom-in-95 fade-in duration-200
        "
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isNew ? 'New Task' : 'Edit Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter task title"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Description with Lock Toggle */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            {!isNew && (
                                <button
                                    type="button"
                                    onClick={() => setIsDescriptionEditable(!isDescriptionEditable)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700"
                                >
                                    {isDescriptionEditable ? 'Lock' : 'Edit'}
                                </button>
                            )}
                        </div>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add description..."
                            rows={3}
                            disabled={!isDescriptionEditable}
                            className={`
                w-full px-4 py-2 border border-gray-200 rounded-xl resize-none
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all
                ${!isDescriptionEditable ? 'bg-gray-50 text-gray-500' : ''}
              `}
                        />
                    </div>

                    {/* Project & Priority Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Project */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                            {showNewProject ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => {
                                            setNewProjectName(e.target.value);
                                            if (projectError) {
                                                setProjectError('');
                                            }
                                        }}
                                        placeholder="New project name"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewProject(false);
                                            setNewProjectName('');
                                            setProjectError('');
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={formData.groupId || 'proj-general'}
                                    onChange={(e) => {
                                        if (e.target.value === 'new') {
                                            setShowNewProject(true);
                                        } else {
                                            setFormData({ ...formData, groupId: e.target.value });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                >
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                    <option value="new">+ New Project</option>
                                </select>
                            )}
                            {projectError && (
                                <p className="text-xs text-rose-500 mt-1">{projectError}</p>
                            )}
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <div className="flex gap-2">
                                {priorityOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: opt.value })}
                                        className={`
                      flex-1 py-2 rounded-xl text-sm font-medium transition-all
                      ${formData.priority === opt.value
                                                ? `${opt.color} text-white shadow-md`
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }
                    `}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input
                            type="date"
                            value={formData.deadline?.split('T')[0] || ''}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Assignees */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <div className="flex flex-wrap gap-2">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => {
                                        const current = formData.assignedTo || [];
                                        const updated = current.includes(user.id)
                                            ? current.filter((id) => id !== user.id)
                                            : [...current, user.id];
                                        setFormData({ ...formData, assignedTo: updated });
                                    }}
                                    className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all
                    ${formData.assignedTo?.includes(user.id)
                                            ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }
                  `}
                                >
                                    <span
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                        style={{ backgroundColor: user.color }}
                                    >
                                        {user.username.charAt(0)}
                                    </span>
                                    {user.username}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subtasks */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Subtasks</label>

                        </div>

                        {/* Subtask List */}
                        <div className="space-y-2 mb-2">
                            {formData.subtasks?.map((subtask) => (
                                <div
                                    key={subtask.id}
                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSubtask(subtask.id)}
                                        className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                      ${subtask.completed
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-gray-300'
                                            }
                    `}
                                    >
                                        {subtask.completed && (
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {subtask.text}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => deleteSubtask(subtask.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Subtask Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                placeholder="Add subtask..."
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                            <button
                                type="button"
                                onClick={addSubtask}
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                        <div className="space-y-2 mb-3">
                            {formData.files?.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 114.95 4.95l-8.5 8.49a1.5 1.5 0 01-2.12-2.12l7.78-7.78" />
                                        </svg>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate block max-w-[200px]">{file.name}</a>
                                    </div>
                                    <button type="button" onClick={() => deleteFile(index)} className="text-gray-400 hover:text-rose-500">✕</button>
                                </div>
                            ))}
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                id="task-file-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="task-file-upload"
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium cursor-pointer transition-colors w-fit"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 18a4 4 0 010-8 5 5 0 019.7-1.5A4 4 0 1117 18H7z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v8m0-8l-3 3m3-3l3 3" />
                                </svg>
                                Upload File (Max 20MB)
                            </label>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                        <div className="space-y-4 mb-4">
                            {formData.comments?.map((comment, index) => {
                                const user = users.find(u => u.id === comment.userId);
                                return (
                                    <div key={index} className="flex gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                            style={{ backgroundColor: user?.color || '#ccc' }}
                                        >
                                            {user?.username.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 text-sm text-gray-700">
                                                <div className="font-semibold text-gray-900 mb-1 flex justify-between">
                                                    <span>{user?.username || 'Unknown User'}</span>
                                                    <span className="text-xs text-gray-400 font-normal">
                                                        {new Date(comment.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p>{comment.text}</p>
                                                {comment.file && (
                                                    <div className="mt-2 flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                                                        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 114.95 4.95l-8.5 8.49a1.5 1.5 0 01-2.12-2.12l7.78-7.78" />
                                                        </svg>
                                                        <a href={comment.file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                                                            {comment.file.name}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                                {commentFile && (
                                    <div className="flex items-center justify-between p-1 bg-indigo-50 rounded mb-1 text-xs text-indigo-700">
                                        <span className="truncate max-w-[150px] inline-flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 114.95 4.95l-8.5 8.49a1.5 1.5 0 01-2.12-2.12l7.78-7.78" />
                                            </svg>
                                            {commentFile.name}
                                        </span>
                                        <button type="button" onClick={() => setCommentFile(null)} className="hover:text-indigo-900">✕</button>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={1}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            addComment();
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex gap-1">
                                <input
                                    type="file"
                                    id="comment-file-upload"
                                    className="hidden"
                                    onChange={handleCommentFileUpload}
                                />
                                <label
                                    htmlFor="comment-file-upload"
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                    title="Attach file"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 114.95 4.95l-8.5 8.49a1.5 1.5 0 01-2.12-2.12l7.78-7.78" />
                                    </svg>
                                </label>
                                <button
                                    type="button"
                                    onClick={addComment}
                                    disabled={!newComment.trim() && !commentFile}
                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h11" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6l6 6-6 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
                    {!isNew && onDelete && (
                        <button
                            type="button"
                            onClick={() => {
                                if (task) {
                                    onDelete(task.id);
                                    onClose();
                                }
                            }}
                            className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                            Delete
                        </button>
                    )}
                    <div className={`flex gap-2 ${isNew ? 'ml-auto' : ''}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                        >
                            {isNew ? 'Create' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
