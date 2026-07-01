// typescript
// file: `frontend/contexts/ThemeContext.tsx`
import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {Theme, ThemeContextType} from '../types';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

const THEMES: Theme[] = ['light', 'dark', 'colorful', 'ocean'];

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            return THEMES.includes(savedTheme as Theme) ? (savedTheme as Theme) : 'light';
        } catch (error) {
            console.warn('Could not access localStorage. Defaulting to light theme.', error);
            return 'light';
        }
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Manage dark class for dark and ocean themes
        if (theme === 'dark' || theme === 'ocean') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Manage data-theme for color palette
        // 'dark' theme uses the 'light' palette but with dark mode styles.
        // Other themes use their own named palette.
        const dataTheme = (theme === 'dark') ? 'light' : theme;
        root.setAttribute('data-theme', dataTheme);

        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Could not access localStorage to save theme.', error);
        }
    }, [theme]);


    const changeTheme = (newTheme: Theme) => {
        if (THEMES.includes(newTheme)) {
            setTheme(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{theme, changeTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};