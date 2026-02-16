import type { ViewType } from '../types';

interface MobileNavProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    onMenuClick: () => void;
}

const mobileNavItems: { id: ViewType; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'calendar', label: 'Calendar' },
];

function MobileNavIcon({ viewId }: { viewId: ViewType }) {
    if (viewId === 'home') {
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-10.5z" />
            </svg>
        );
    }

    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v3M16 4v3M4 9h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" />
        </svg>
    );
}

export default function MobileNav({ currentView, onViewChange, onMenuClick }: MobileNavProps) {
    const getIconColorClass = (viewId: ViewType) => {
        if (viewId === 'home') return 'text-blue-600';
        return 'text-orange-500';
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <div className="flex items-center h-16 px-2">
                <div className="flex items-center justify-around flex-1 h-full">
                    {mobileNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className="relative flex items-center justify-center flex-1 h-full transition-all duration-200"
                        >
                            <span className={`text-xl ${getIconColorClass(item.id)}`}><MobileNavIcon viewId={item.id} /></span>
                            {currentView === item.id && (
                                <div className="absolute bottom-1 w-8 h-1 bg-gray-900 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onMenuClick}
                    className="w-12 h-12 ml-1 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </nav>
    );
}
