import type { User, ViewType } from '../types';

interface HeaderProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    currentUser: User;
    users: User[];
    selectedUserIdFilter: string | null;
    onUserFilterChange: (userId: string | null) => void;
}

export default function Header({
    currentView,
    onViewChange,
    currentUser,
    users,
    selectedUserIdFilter,
    onUserFilterChange,
}: HeaderProps) {
    const isAdmin = currentUser.role === 'Admin';
    const canAccessUsersPage = currentUser.role === 'Admin' || currentUser.role === 'Moderator';
    const navItems: { id: ViewType; label: string }[] = [
        { id: 'home', label: 'Home' },
        { id: 'calendar', label: 'Calendar' },
        ...(canAccessUsersPage ? [{ id: 'users' as ViewType, label: 'Users' }] : []),
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <header className="hidden md:flex h-16 bg-white border-b border-gray-100 items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-6 min-w-0">
                <nav className="flex items-center gap-2 overflow-x-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${currentView === item.id
                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
              `}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Admin User Filter */}
                {isAdmin && (
                    <div className="relative">
                        <select
                            value={selectedUserIdFilter || ''}
                            onChange={(e) => onUserFilterChange(e.target.value || null)}
                            className="
                appearance-none bg-gray-50 border border-gray-200 
                text-gray-700 text-sm rounded-xl px-4 py-2 pr-10
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
                )}

            </div>
        </header>
    );
}
