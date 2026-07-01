// File: frontend/components/Sidebar.tsx
import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {Droplets, LogOut, Moon, Sparkles, Sun} from 'lucide-react';
import {useTheme} from '../hooks/useTheme';
import {Theme} from '../types';
import {useUser} from "../contexts/UserContext.tsx";
import {userService} from "../services";
import {navItems} from './UiElements';

// navItems are now provided by frontend/components/UiElements.tsx

interface SidebarProps {
    isOpen: boolean;
    onProfileClick: () => void;
    onVersionClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, onProfileClick, onVersionClick}) => {
    const {theme, changeTheme} = useTheme();
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const {user, logout} = useUser();

    const themeOptions = [
        {name: 'light', icon: Sun, label: 'Light'},
        {name: 'dark', icon: Moon, label: 'Dark'},
        {name: 'colorful', icon: Sparkles, label: 'Colorful'},
        {name: 'ocean', icon: Droplets, label: 'Ocean'},
    ];

    const CurrentThemeIcon = themeOptions.find(t => t.name === theme)?.icon || Sun;

    const handleLogout = async () => {
        await logout();
    };

    const setNewTheme = async (newTheme: Theme) => {
        changeTheme(newTheme);
        userService.updateTheme(user.email, newTheme);
        setIsThemeMenuOpen(false);
    }

    return (
        <aside
            className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto ${isOpen ? 'w-64' : 'w-0'}`}>
            <nav className="flex-1 px-4 py-4 space-y-2 pt-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({isActive}) =>
                            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
                                isActive
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0"/>
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <div className="flex items-center justify-between mb-4 px-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Theme</p>
                    <div className="relative">
                        <button
                            onClick={() => setIsThemeMenuOpen(prev => !prev)}
                            onBlur={() => setTimeout(() => setIsThemeMenuOpen(false), 200)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-haspopup="true"
                            aria-expanded={isThemeMenuOpen}
                            aria-label="Select theme"
                        >
                            <CurrentThemeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300"/>
                        </button>
                        {isThemeMenuOpen && (
                            <div
                                className="absolute right-0 bottom-full mb-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10"
                            >
                                <ul className="py-1">
                                    {themeOptions.map((option) => (
                                        <li key={option.name}>
                                            <button
                                                onClick={() => {
                                                    setNewTheme(option.name as Theme);
                                                }}
                                                className={`w-full flex items-center px-3 py-2 text-sm text-left transition-colors ${theme === option.name ? 'font-semibold text-primary' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                                            >
                                                <option.icon className="h-4 w-4 mr-3"/>
                                                <span>{option.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={onProfileClick}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    {user ? (
                        <img
                            src={`/api/user/${user.email}/picture`}
                            alt="User"
                            className="h-10 w-10 rounded-full object-cover border-2 border-primary flex-shrink-0"
                        />
                    ) : (
                        <div
                            className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0"/>
                    )}
                    <div className="text-left overflow-hidden whitespace-nowrap">
                        {user ? (
                            <>
                                <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"/>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"/>
                            </div>
                        )}
                    </div>
                </button>

                {/* Login / Logout button */}
                <div className="mt-3">

                    <button onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 transition-colors"
                        title="Logout">
                        <LogOut className="h-4 w-4"/>
                        <span className="text-sm font-medium">Logout</span>
                    </button>

                </div>

                <button
                    onClick={onVersionClick}
                    type="button"
                    className="w-full text-center text-xs text-gray-400 dark:text-gray-500 mt-4 cursor-pointer select-none"
                    title="What could happen?"
                >
                    v1.0.0
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;