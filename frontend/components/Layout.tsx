import React, {ReactNode, useEffect, useState} from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileModal from './user/ProfileModal.tsx';
import TicTacToe from './TicTacToe';
import {User} from '../types';
import {userService} from '../services';
import {useUser} from "../contexts/UserContext.tsx";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({children}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);

    const [versionClicks, setVersionClicks] = useState(0);
    const [showTicTacToe, setShowTicTacToe] = useState(false);
    const { user } = useUser();

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const handleProfileClick = () => {
        setProfileModalOpen(true);
    };

    const handleVersionClick = () => {
        const newClickCount = versionClicks + 1;
        if (newClickCount >= 10) {
            setShowTicTacToe(true);
            setVersionClicks(0);
        } else {
            setVersionClicks(newClickCount);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar
                isOpen={isSidebarOpen}
                onProfileClick={handleProfileClick}
                onVersionClick={handleVersionClick}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleSidebar={toggleSidebar}/>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6 md:p-8">
                    {children}
                </main>
            </div>
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
            <TicTacToe
                isOpen={showTicTacToe}
                onClose={() => setShowTicTacToe(false)}
            />
        </div>
    );
};

export default Layout;
