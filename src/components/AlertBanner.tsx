interface AlertBannerProps {
    message: string;
    onClick?: () => void;
}

export default function AlertBanner({ message, onClick }: AlertBannerProps) {
    return (
        <div
            onClick={onClick}
            className={`
        bg-gradient-to-r from-orange-500 to-amber-500 
        text-white text-center py-2 px-4 text-sm font-medium
        ${onClick ? 'cursor-pointer hover:from-orange-600 hover:to-amber-600' : ''}
        transition-all duration-200 shadow-sm
      `}
        >
            {message}
        </div>
    );
}
