import { useEffect, useRef, useState } from 'react';
import type { User } from '../types';

interface SettingsViewProps {
    currentUser: User;
    onSave: (updatedUser: User) => void;
}

export default function SettingsView({ currentUser, onSave }: SettingsViewProps) {
    const [username, setUsername] = useState(currentUser.username);
    const [color, setColor] = useState(currentUser.color);
    const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savedMessage, setSavedMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setUsername(currentUser.username);
        setColor(currentUser.color);
        setAvatarUrl(currentUser.avatarUrl || '');
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
    }, [currentUser]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please choose an image file.');
            setSavedMessage('');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            setAvatarUrl(result);
            setErrorMessage('');
        };
        reader.readAsDataURL(file);

        e.target.value = '';
    };

    const handleSave = () => {
        const isPasswordChangeRequested = Boolean(newPassword || confirmPassword);

        if (isPasswordChangeRequested) {
            if (!newPassword || !confirmPassword) {
                setErrorMessage('Please complete all password fields.');
                setSavedMessage('');
                return;
            }

            if (newPassword.length < 6) {
                setErrorMessage('New password must be at least 6 characters.');
                setSavedMessage('');
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorMessage('New password and confirm password do not match.');
                setSavedMessage('');
                return;
            }
        }

        const nextUser: User = {
            ...currentUser,
            username: username.trim() || currentUser.username,
            color,
            avatarUrl,
        };

        onSave(nextUser);
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
        setSavedMessage(isPasswordChangeRequested ? 'Profile and password updated' : 'Profile updated');
        window.setTimeout(() => setSavedMessage(''), 2000);
    };

    return (
        <div className="h-full max-w-5xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    {/* Profile Section */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile</h2>

                <div className="flex items-center gap-4 mb-6">
                    <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                        title="Click to upload photo"
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            (username || currentUser.username).charAt(0).toUpperCase()
                        )}
                    </button>
                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Profile title"
                            className="font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none transition-colors"
                        />
                        <p className="text-sm text-gray-500">Click avatar to upload photo</p>
                    </div>
                </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Avatar Color (Hex)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="h-10 w-12 p-1 rounded-lg border border-gray-200 bg-white cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="#6366f1"
                                />
                            </div>
                        </div>

                    </section>
                </div>

                <div>
                    {/* Account Security */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Security</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Save Button */}
            <button
                type="button"
                onClick={handleSave}
                className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
            >
                Save Changes
            </button>
            {errorMessage && (
                <p className="text-sm text-rose-600 mt-3">{errorMessage}</p>
            )}
            {savedMessage && (
                <p className="text-sm text-emerald-600 mt-3">{savedMessage}</p>
            )}
        </div>
    );
}
