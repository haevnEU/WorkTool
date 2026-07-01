import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {BookOpen, ClipboardList, GitBranch, Loader, Ticket, Users} from 'lucide-react';
import {meetingService, noteService, snippetService, ticketService} from '../services';

const StatCard = ({title, value, icon: Icon, color, loading}: {
    title: string;
    value: string | number;
    icon: React.ElementType,
    color: string,
    loading?: boolean
}) => (
    <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform duration-200 hover:scale-105">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white"/>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <div className="h-8 flex items-center">
                {loading ? (
                    <Loader className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400"/>
                ) : (
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
                )}
            </div>
        </div>
    </div>
);


const Home: React.FC = () => {
    const [counts, setCounts] = useState({notes: 0, snippets: 0, meetings: 0, tickets: 0});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                setLoading(true);
                const [notesData, snippetsData, meetingsData, ticketsData] = await Promise.all([
                    noteService.fetchNotes(),
                    snippetService.fetchSnippets(),
                    meetingService.fetchWeeklyMeetings(),
                    ticketService.fetchTickets(),
                ]);
                setCounts({
                    notes: notesData.length,
                    snippets: snippetsData.length,
                    meetings: meetingsData.length,
                    tickets: ticketsData.length,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                // In a real app, you might set an error state to show a message to the user
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <Link to="/notes" className="col-span-1">
                    <StatCard title="Total Notes" value={counts.notes} icon={BookOpen} color="bg-blue-500"
                              loading={loading}/>
                </Link>
                <Link to="/snippets" className="col-span-1">
                    <StatCard title="Saved Snippets" value={counts.snippets} icon={ClipboardList} color="bg-green-500"
                              loading={loading}/>
                </Link>
                <Link to="/weekly-meeting" className="col-span-1">
                    <StatCard title="Meeting Archives" value={counts.meetings} icon={Users} color="bg-yellow-500"
                              loading={loading}/>
                </Link>
                <Link to="/ticketsystem" className="col-span-1">
                    <StatCard title="Ticketsystem" value={counts.tickets} icon={Ticket} color="bg-red-500"
                              loading={loading}/>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Welcome Back!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    This dashboard provides a quick overview of your notes, code snippets, weekly meetings, and tickets.
                    Use the links above to navigate to different sections of the application. Stay productive!
                </p>
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Quick Links</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <a
                            href="http://gitlab.intra.hausheld.info/layer-service/service_wmt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors shadow-sm"
                        >
                            <GitBranch className="h-4 w-4"/>
                            <span>GitLab Repo WMT</span>
                        </a>
                        <a
                            href="http://gitlab.intra.hausheld.info/erp/hh-erp-tool"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors shadow-sm"
                        >
                            <GitBranch className="h-4 w-4"/>
                            <span>GitLab Repo ERP Tool</span>
                        </a>
                        <a
                            href="http://gitlab.intra.hausheld.info/qa/itests"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors shadow-sm"
                        >
                            <GitBranch className="h-4 w-4"/>
                            <span>GitLab Repo itest</span>
                        </a>

                        <a
                            href="http://gitlab.intra.hausheld.info/bsimeter/bsimeter_gc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors shadow-sm"
                        >
                            <GitBranch className="h-4 w-4"/>
                            <span>GitLab Repo BSI Meter GC</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
