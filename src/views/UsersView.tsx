import { useRef, useState } from 'react';
import type { User, Task } from '../types';
import { getRolePermissions } from '../utils/rolePermissions';

interface UsersViewProps {
    users: User[];
    tasks: Task[];
    currentUser: User;
    onUpdateUser: (updatedUser: User) => Promise<void>;
    onAddUser: (newUser: User) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
}

export default function UsersView({ users, tasks, currentUser, onUpdateUser, onAddUser, onRemoveUser }: UsersViewProps) {
    const isAdmin = currentUser.role === 'Admin';
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [removePassword, setRemovePassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeletingUserId, setIsDeletingUserId] = useState<string | null>(null);
    const [addPassword, setAddPassword] = useState('');
    const [addConfirmPassword, setAddConfirmPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [addFormData, setAddFormData] = useState<User>({
        id: '',
        username: '',
        role: 'User',
        permissions: getRolePermissions('User'),
        color: '#6366f1',
    });

    const resetAddForm = () => {
        setAddFormData({
            id: '',
            username: '',
            role: 'User',
            permissions: getRolePermissions('User'),
            color: '#6366f1',
        });
        setAddPassword('');
        setAddConfirmPassword('');
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({ ...user, permissions: getRolePermissions(user.role) });
        setNewPassword('');
        setConfirmPassword('');
        setRemovePassword(false);
        setErrorMessage('');
    };

    const closeEditModal = () => {
        setEditingUser(null);
        setFormData(null);
        setNewPassword('');
        setConfirmPassword('');
        setRemovePassword(false);
        setErrorMessage('');
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !formData) return;

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please choose an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            setFormData({ ...formData, avatarUrl: result });
            setErrorMessage('');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSaveUser = async () => {
        if (!formData) return;

        if (!formData.username.trim()) {
            setErrorMessage('Username is required.');
            return;
        }

        if (!removePassword && (newPassword || confirmPassword)) {
            if (newPassword.length < 6) {
                setErrorMessage('New password must be at least 6 characters.');
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorMessage('Password confirmation does not match.');
                return;
            }
        }

        let nextPassword = formData.password;
        if (removePassword) {
            nextPassword = undefined;
        } else if (newPassword) {
            nextPassword = newPassword;
        }

        const nextUser: User = {
            ...formData,
            username: formData.username.trim(),
            permissions: getRolePermissions(formData.role),
            password: nextPassword,
        };

        setIsSaving(true);
        try {
            await onUpdateUser(nextUser);
            closeEditModal();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sync user changes.';
            setErrorMessage(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddUser = async () => {
        const username = addFormData.username.trim();
        if (!username) {
            setErrorMessage('Username is required for new user.');
            return;
        }

        if (addPassword || addConfirmPassword) {
            if (addPassword.length < 6) {
                setErrorMessage('Password must be at least 6 characters.');
                return;
            }

            if (addPassword !== addConfirmPassword) {
                setErrorMessage('Password confirmation does not match.');
                return;
            }
        }

        if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
            setErrorMessage('A user with this username already exists.');
            return;
        }

        const userId = `user-${Date.now()}`;
        const nextUser: User = {
            ...addFormData,
            id: userId,
            username,
            permissions: getRolePermissions(addFormData.role),
            password: addPassword || undefined,
        };

        setIsSaving(true);
        try {
            await onAddUser(nextUser);
            setIsAddModalOpen(false);
            resetAddForm();
            setErrorMessage('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to add user.';
            setErrorMessage(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (userId === currentUser.id) {
            setErrorMessage('You cannot remove the currently logged-in admin.');
            return;
        }

        const targetUser = users.find((user) => user.id === userId);
        const confirmed = window.confirm(`Remove ${targetUser?.username || 'this user'}?`);
        if (!confirmed) return;

        setIsDeletingUserId(userId);
        try {
            await onRemoveUser(userId);
            if (editingUser?.id === userId) {
                closeEditModal();
            }
            setErrorMessage('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to remove user.';
            setErrorMessage(message);
        } finally {
            setIsDeletingUserId(null);
        }
    };

    // Calculate workload per user
    const getWorkload = (userId: string) => {
        const userTasks = tasks.filter(
            (t) => t.assignedTo.includes(userId) && t.status !== 'DONE'
        );

        let hours = 0;
        userTasks.forEach((task) => {
            if (task.priority === 'high') hours += 3.0;
            else if (task.priority === 'medium') hours += 1.5;
            else hours += 0.5;
        });

        return { taskCount: userTasks.length, hours };
    };

    // Workload intensity colors (soft per spec)
    const getWorkloadColor = (hours: number) => {
        if (hours < 10) return 'from-emerald-400 to-cyan-400'; // Low load
        if (hours <= 20) return 'from-blue-400 to-indigo-400'; // Optimum
        return 'from-purple-500 to-rose-400'; // Overload
    };

    const getWorkloadLabel = (hours: number) => {
        if (hours < 10) return 'Low Load';
        if (hours <= 20) return 'Optimum';
        return 'Overload';
    };

    return (
        <div className="h-full">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Team & Workload</h1>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsAddModalOpen(true);
                            resetAddForm();
                            setErrorMessage('');
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                    >
                        Add User
                    </button>
                )}
            </div>
            <p className="text-gray-500 mb-6">Monitor team capacity and task distribution</p>
            {errorMessage && <p className="text-sm text-rose-600 mb-4">{errorMessage}</p>}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => {
                    const { taskCount, hours } = getWorkload(user.id);
                    const workloadColor = getWorkloadColor(hours);
                    const workloadLabel = getWorkloadLabel(hours);

                    return (
                        <div
                            key={user.id}
                            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* User Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-md"
                                    style={{ backgroundColor: user.color }}
                                >
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        user.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{user.username}</h3>
                                    <p className="text-sm text-gray-500">{user.role}</p>
                                </div>
                            </div>

                            {/* Workload Bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600">Workload</span>
                                    <span className="font-medium">{hours.toFixed(1)}h</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${workloadColor} rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.min((hours / 30) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{taskCount}</span>
                                    <span className="text-gray-500">active tasks</span>
                                </div>
                                <span
                                    className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${hours < 10
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : hours <= 20
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-rose-100 text-rose-700'
                                        }
                  `}
                                >
                                    {workloadLabel}
                                </span>
                            </div>

                            {/* Permissions */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400 mb-2">Permissions</p>
                                <div className="flex flex-wrap gap-1">
                                    {getRolePermissions(user.role).map((perm) => (
                                        <span
                                            key={perm}
                                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                        >
                                            {perm}
                                        </span>
                                    ))}
                                </div>

                                {isAdmin && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(user)}
                                            className="w-full py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
                                        >
                                            Edit User
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveUser(user.id)}
                                            disabled={isDeletingUserId === user.id || user.id === currentUser.id}
                                            className="w-full py-2 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDeletingUserId === user.id ? 'Removing...' : 'Remove'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isAdmin && isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Add User</h2>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={addFormData.username}
                                    onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={addFormData.role}
                                    onChange={(e) => {
                                        const nextRole = e.target.value as User['role'];
                                        setAddFormData({ ...addFormData, role: nextRole, permissions: getRolePermissions(nextRole) });
                                    }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="Moderator">Moderator</option>
                                    <option value="User">User</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions (fixed by role)</label>
                                <div className="flex flex-wrap gap-2">
                                    {getRolePermissions(addFormData.role).map((permission) => (
                                        <span key={permission} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                                            {permission}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
                                <input
                                    type="password"
                                    value={addPassword}
                                    onChange={(e) => setAddPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={addConfirmPassword}
                                    onChange={(e) => setAddConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Color</label>
                                <div className="flex items-center gap-3">
                                    {['#6366f1', '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b'].map((optionColor) => (
                                        <button
                                            key={optionColor}
                                            type="button"
                                            onClick={() => setAddFormData({ ...addFormData, color: optionColor })}
                                            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${addFormData.color === optionColor ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                            style={{ backgroundColor: optionColor }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddUser}
                                    disabled={isSaving}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Adding...' : 'Add User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Workload Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Workload Calculation</h3>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        High Priority = 3.0h
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        Medium Priority = 1.5h
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        Low Priority = 0.5h
                    </div>
                </div>
            </div>

            {isAdmin && editingUser && formData && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeEditModal}
                >
                    <div
                        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Edit User Settings</h2>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <section className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4">Profile</h3>

                                <div className="flex items-center gap-4 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-md hover:scale-105 transition-transform"
                                        style={{ backgroundColor: formData.color }}
                                        title="Click to upload photo"
                                    >
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            formData.username.charAt(0).toUpperCase()
                                        )}
                                    </button>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{formData.username}</p>
                                        <p className="text-xs text-gray-500">Click avatar to upload photo</p>
                                    </div>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => {
                                                const nextRole = e.target.value as User['role'];
                                                setFormData({ ...formData, role: nextRole, permissions: getRolePermissions(nextRole) });
                                            }}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                        >
                                            <option value="Moderator">Moderator</option>
                                            <option value="User">User</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4">Permissions (fixed by role)</h3>
                                <div className="flex flex-wrap gap-2">
                                    {getRolePermissions(formData.role).map((permission) => (
                                        <span key={permission} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                                            {permission}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4">Appearance</h3>
                                <div className="flex items-center gap-3">
                                    {['#6366f1', '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b'].map((optionColor) => (
                                        <button
                                            key={optionColor}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: optionColor })}
                                            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${formData.color === optionColor ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                            style={{ backgroundColor: optionColor }}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4">Account Security</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-600">
                                            {formData.password ? 'Password is set' : 'No password set'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRemovePassword(true);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                                        >
                                            Remove Password
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setRemovePassword(false);
                                            }}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setRemovePassword(false);
                                            }}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveUser}
                                    disabled={isSaving}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Saving...' : 'Save User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
