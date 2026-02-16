import type { ViewType, User } from '../types';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    users: User[];
    selectedUserIdFilter: string | null;
    onUserFilterChange: (userId: string | null) => void;
}

function NavIcon({ viewId }: { viewId: ViewType }) {
    if (viewId === 'home') {
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-10.5z" />
            </svg>
        );
    }

    if (viewId === 'calendar') {
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v3M16 4v3M4 9h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" />
            </svg>
        );
    }

    if (viewId === 'users') {
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M21 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        );
    }

    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1 1 0 011.35-.936l1.233.54a1 1 0 00.799 0l1.233-.54a1 1 0 011.35.936l.133 1.34a1 1 0 00.563.813l1.205.602a1 1 0 01.443 1.388l-.67 1.167a1 1 0 000 .994l.67 1.167a1 1 0 01-.443 1.388l-1.205.602a1 1 0 00-.563.813l-.133 1.34a1 1 0 01-1.35.936l-1.233-.54a1 1 0 00-.799 0l-1.233.54a1 1 0 01-1.35-.936l-.133-1.34a1 1 0 00-.563-.813l-1.205-.602a1 1 0 01-.443-1.388l.67-1.167a1 1 0 000-.994l-.67-1.167a1 1 0 01.443-1.388l1.205-.602a1 1 0 00.563-.813l.133-1.34z" />
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
        </svg>
    );
}

export default function Sidebar({
    currentView,
    onViewChange,
    isOpen,
    onClose,
    currentUser,
    users,
    selectedUserIdFilter,
    onUserFilterChange,
}: SidebarProps) {
    const isAdmin = currentUser.role === 'Admin';
    const canAccessUsersPage = currentUser.role === 'Admin' || currentUser.role === 'Moderator';

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed md:hidden inset-y-0 right-0 z-50
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
            >
                {/* Mobile Drawer */}
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                        <h2 className="text-base font-semibold text-gray-900">Menu</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {isAdmin && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">User Filter</p>
                                <div className="relative">
                                    <select
                                        value={selectedUserIdFilter || ''}
                                        onChange={(e) => onUserFilterChange(e.target.value || null)}
                                        className="
                    appearance-none bg-gray-50 border border-gray-200 
                    text-gray-700 text-sm rounded-xl px-4 py-2 pr-10 w-full
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    hover:bg-gray-100 transition-colors cursor-pointer
                  "
                                    >
                                        <option value="">All Users</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.username}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {canAccessUsersPage && (
                            <button
                                onClick={() => {
                                    onViewChange('users');
                                    onClose();
                                }}
                                className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 text-left
                ${currentView === 'users'
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
              `}
                            >
                                <span className="text-xl"><NavIcon viewId="users" /></span>
                                <span>Users</span>
                            </button>
                        )}

                        <button
                            onClick={() => {
                                onViewChange('settings');
                                onClose();
                            }}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 text-left
                ${currentView === 'settings'
                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
              `}
                        >
                            <span className="text-xl"><NavIcon viewId="settings" /></span>
                            <span>Settings</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
