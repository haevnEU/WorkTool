import React from 'react';
import {Box, Menu, Search} from 'lucide-react';

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({onToggleSidebar}) => {
    return (
        <header
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 h-16">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300"/>
                </button>
                <div className="flex items-center">
                    <Box className="h-8 w-8 text-primary"/>
                    <h1 className="text-xl font-bold ml-2 text-gray-800 dark:text-gray-100">OpsDash</h1>
                </div>
            </div>

            <div className="flex items-center">
                {/* Search Bar */}
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search everywhere..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-primary focus:ring-primary dark:text-gray-200 focus:outline-none transition"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;