// File: frontend/components/UiElements.tsx
import React from 'react';
import Home from "../pages/Home.tsx";
import Snippets from "../pages/Snippets.tsx";
import Notes from "../pages/Notes.tsx";
import TimetablePage from "../pages/TimetablePage.tsx";
import WeeklyMeeting from "../pages/WeeklyMeeting.tsx";
import Ticketsystem from "../pages/Ticketsystem.tsx";
import DatabaseSearch from "../pages/DatabaseSearch.tsx";
import FileUploadPage from "../pages/FileUploadPage.tsx";
import RulePage from "../pages/RulePage.tsx";
import Settings from "../pages/Settings.tsx";
import TodoPage from "../pages/TodoPage.tsx";
import SharedLinksPage from "../pages/SharedLinksPage.tsx";
import GitLab from "../pages/GitLab.tsx";

import {
    BookOpen,
    ClipboardList,
    Database,
    FileCode,
    GitMerge,
    Home as HomeIcon,
    ListTodo,
    Ticket,
    UploadCloud,
    Users,
    Share2,
    Settings as SettingsIcon,
} from 'lucide-react';


export const uiElements: UIElement[] = [
    {route: {path: '/home', element: <Home/>}, navItem: {name: 'Home', path: '/home', icon: HomeIcon, showInNav: true}},
    {route: {path: '/todo', element: <TodoPage/>}, navItem: {name: 'TODO List', path: '/todo', icon: ListTodo, showInNav: true}},
    {route: {path: '/gitlab', element: <GitLab/>}, navItem: {name: 'GitLab', path: '/gitlab', icon: GitMerge, showInNav: true}},
    {route: {path: '/snippets', element: <Snippets/>}, navItem: {name: 'Snippets', path: '/snippets', icon: ClipboardList, showInNav: true}},
    {route: {path: '/notes', element: <Notes/>}, navItem: {name: 'Notes', path: '/notes', icon: BookOpen, showInNav: true}},
    {route: {path: '/timetable', element: <TimetablePage/>}, navItem: {name: 'Timetable', path: '/timetable', icon: BookOpen, showInNav: true}},
    {route: {path: '/weekly-meeting', element: <WeeklyMeeting/>}, navItem: {name: 'Weekly Meeting', path: '/weekly-meeting', icon: Users, showInNav: true}},
    {route: {path: '/ticketsystem', element: <Ticketsystem/>}, navItem: {name: 'Ticketsystem', path: '/ticketsystem', icon: Ticket, showInNav: true}},
    {route: {path: '/database-search', element: <DatabaseSearch/>}, navItem: {name: 'DB Search', path: '/database-search', icon: Database, showInNav: true}},
    {route: {path: '/upload', element: <FileUploadPage/>}, navItem: {name: 'File Upload', path: '/upload', icon: UploadCloud, showInNav: true}},
    {route: {path: '/rule', element: <RulePage/>}, navItem: {name: 'Rule Management', path: '/rule', icon: FileCode, showInNav: true}},
    {route: {path: '/links', element: <SharedLinksPage/>}, navItem: {name: 'Shared Links', path: '/links', icon: Share2, showInNav: true}},
    {route: {path: '/settings', element: <Settings/>}, navItem: {name: 'Settings', path: '/settings', icon: SettingsIcon, showInNav: true}},
];



















// The following lines are required to make the above code work.
// They define the types and export the necessary data structures for use in other parts of the application.
export interface NavItem {
    name: string;
    path: string;
    icon: React.ElementType;
    showInNav?: boolean;
}

export interface RouteDef {
    path: string;
    element: React.ReactNode;
}

export interface UIElement {
    route: RouteDef;
    navItem: NavItem;
}

export const navItems: NavItem[] = uiElements.filter(u => u.navItem.showInNav !== false).map(u => u.navItem);

export default uiElements;

