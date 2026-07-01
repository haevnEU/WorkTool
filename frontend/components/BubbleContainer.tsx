import React, {useState} from 'react';
import Bubble from './Bubble';
import {Plus} from 'lucide-react';

interface BubbleContainerProps {
    selectedItems: string[];
    possibleItems: string[];
    onAddItem: (item: string) => void;
    onRemoveItem: (item: string) => void;
    readOnly?: boolean;
}

const BubbleContainer: React.FC<BubbleContainerProps> = ({
                                                             selectedItems,
                                                             possibleItems,
                                                             onAddItem,
                                                             onRemoveItem,
                                                             readOnly = false,
                                                         }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const availableItems = possibleItems.filter(item => !selectedItems.includes(item));

    const handleSelect = (item: string) => {
        onAddItem(item);
        setShowDropdown(false);
    };

    return (
        <div
            className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[42px]">
            {selectedItems.map(item => (
                <Bubble key={item} text={item} onRemove={() => onRemoveItem(item)} readOnly={readOnly}/>
            ))}

            {!readOnly && availableItems.length > 0 && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center justify-center h-7 w-7 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                        aria-haspopup="true"
                        aria-expanded={showDropdown}
                    >
                        <Plus className="h-4 w-4"/>
                    </button>
                    {showDropdown && (
                        <div
                            className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                            <ul className="py-1">
                                {availableItems.map(item => (
                                    <li
                                        key={item}
                                        onClick={() => handleSelect(item)}
                                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BubbleContainer;
