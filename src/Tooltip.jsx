import { useState } from "react";

function Tooltip({
    children,
    content,
    placement = "top",
    className = "",
    iconClassName = "w-4 h-4 bg-stone-400 rounded-full flex items-center justify-center cursor-help",
}) {
    const [isVisible, setIsVisible] = useState(false);

    const getTooltipClasses = () => {
        const baseClasses =
            "absolute px-3 py-2 bg-stone-800 text-white text-sm rounded-md opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10";

        switch (placement) {
            case "top":
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
            case "bottom":
                return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
            case "left":
                return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
            case "right":
                return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
            default:
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
        }
    };

    const getArrowClasses = () => {
        const baseClasses = "absolute border-4 border-transparent";

        switch (placement) {
            case "top":
                return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-t-stone-800`;
            case "bottom":
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 border-b-stone-800`;
            case "left":
                return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 border-l-stone-800`;
            case "right":
                return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 border-r-stone-800`;
            default:
                return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-t-stone-800`;
        }
    };

    return (
        <div
            className={`relative group ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <div className={iconClassName}>{children}</div>
            <div
                className={`${getTooltipClasses()} ${
                    isVisible ? "opacity-100" : "opacity-0"
                }`}
            >
                {content}
                <div className={getArrowClasses()}></div>
            </div>
        </div>
    );
}

export default Tooltip;
