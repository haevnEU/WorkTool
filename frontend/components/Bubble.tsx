import React from 'react';
import {X} from 'lucide-react';

interface BubbleProps {
    text: string;
    onRemove?: () => void;
    readOnly?: boolean;
}

const Bubble: React.FC<BubbleProps> = ({text, onRemove, readOnly}) => {
    return (
        <div
            className="flex items-center bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 text-sm font-medium px-2.5 py-1 rounded-full">
            <span>{text}</span>
            {!readOnly && onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1.5 -mr-1 flex-shrink-0 p-0.5 rounded-full inline-flex items-center justify-center text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none"
                    aria-label={`Remove ${text}`}
                >
                    <X className="h-3 w-3"/>
                </button>
            )}
        </div>
    );
};

export default Bubble;
