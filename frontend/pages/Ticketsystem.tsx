// file: `snippetManager/frontend/pages/Ticketsystem.tsx`
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { AlertCircle, Loader, RefreshCw, Ticket as TicketIcon, Search, X } from 'lucide-react';
import { ticketService } from '../services';
import TicketItem from '../components/ticket/TicketItem.tsx';
import TicketModal from '../components/ticket/TicketModal.tsx';
import { useToast } from '../hooks/useToast';
import { formatTimestamp } from "../utils/TimeUtils.ts";
import {TicketModel} from "../types/TicketModel.ts";
import {TicketAdditionalInfoModel} from "../types/TicketAdditionalModel.ts";

const Ticketsystem: React.FC = () => {
    const [tickets, setTickets] = useState<TicketModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [filter, setFilter] = useState<string>(''); // Filter-Status
    const [ticketSearch, setTicketSearch] = useState<string>('');
    const [ticketSearchGlobal, setTicketSearchGlobal] = useState<string>('');

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>("N/A");
    const [selectedTicket, setSelectedTicket] = useState<TicketModel | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState<TicketAdditionalInfoModel | null>(null);
    const { showToast } = useToast();

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedTickets = await ticketService.fetchTickets();
            setTickets(fetchedTickets);
            const last = await ticketService.fetchLastUpdate();
            setLastUpdate(formatTimestamp(last));
        } catch (err) {
            setError('Failed to load tickets.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleSync = async () => {
        setIsSyncing(true);
        setError(null);
        try {
            await ticketService.syncTickets();
            const lastSync = await ticketService.fetchLastUpdate();
            setLastUpdate(formatTimestamp(lastSync));
            showToast("Tickets aktualisiert", 'success');
            await loadTickets(); // Refresh the list
        } catch (err) {
            const errorMessage = 'Failed to sync tickets.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            console.log(err)
        } finally {
            setIsSyncing(false);
        }
    };

    const globalSearch = async () => {
        if(!ticketSearchGlobal.trim()) {
            showToast("Please enter a ticket ID to search", 'error');
            return;
        }
        const result = await ticketService.globalSearch(ticketSearchGlobal.trim())

        if(result) {
            setSelectedTicket(result);
        } else {
            showToast("No ticket found with that ID", 'error');
        }
    }

    const setTicket = async(ticket: TicketModel | null) => {
        setSelectedTicket(ticket);
        if(ticket) {
            const data = await ticketService.fetchAdditionalInfo(ticket.ticketId);
            setAdditionalInfo(data);
        } else {
            setAdditionalInfo(null);
        }
    }

    // The ticketSearch input now acts as a live filter (ID or substring).

    const filteredTickets = tickets.filter(ticket => {
        // Tracker filter
        if (filter && ticket.tracker !== filter) return false;

        // Search filter: if empty, accept
        if (!ticketSearch || ticketSearch.trim() === '') return true;

        const s = ticketSearch.trim();
        // If the query is numeric (optionally prefixed with #), perform prefix matching on IDs
        const digits = s.replace(/^#/, '');
        if (/^\d+$/.test(digits)) {
            const prefix = digits;
            const tid = String(ticket.ticketId || '');
            const idStr = String(ticket.id || '');
            return tid.startsWith(prefix) || idStr.startsWith(prefix);
        }

        const lower = s.toLowerCase();
        // non-numeric: match title, tracker, project, or id as substring
        return (ticket.title || '').toLowerCase().includes(lower)
            || (ticket.tracker || '').toLowerCase().includes(lower)
            || String(ticket.ticketId).includes(lower)
            || String(ticket.id).includes(lower)
            || (ticket.project || '').toLowerCase().includes(lower);
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col justify-center">
                    <div className="flex items-center space-x-3">
                        <TicketIcon className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticketsystem</h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tickets: {filteredTickets.length} / {tickets.length}</p>
                </div>
                <div className="flex flex-col items-end">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing || loading}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSyncing ? (
                            <>
                                <Loader className="h-5 w-5 animate-spin" />
                                <span>Syncing...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-5 w-5" />
                                <span>Sync Tickets</span>
                            </>
                        )}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Last Sync: {lastUpdate}</p>
                </div>
            </div>
            {/* Search + Dropdown für Filter */}
            <div className="flex items-center justify-end space-x-3">
                <div className="flex items-center space-x-2">
                    <div>
                        <p>Globale Suche</p>
                        <input
                            id="ticket-search-global"
                            type="text"
                            placeholder="Ticket #1234"
                            value={ticketSearchGlobal}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^[A-Za-z0-9]*$/.test(value)) {
                                    setTicketSearchGlobal(value);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    globalSearch();
                                }
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white w-40"
                        />
                        <button onClick={() => globalSearch()} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-primary rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors" aria-label="Global search ticket by id">
                            Suche Global
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                    <div>
                        <p>Suche in eigenen Tickets</p>
                        <input
                            id="ticket-search"
                            type="text"
                            placeholder="Ticket #1234"
                            value={ticketSearch}
                            onChange={(e) => setTicketSearch(e.target.value)}
                            ref={inputRef}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white w-40"
                        />

                        <button
                            onClick={() => {
                                if (ticketSearch) setTicketSearch('');
                                else inputRef.current?.focus();
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-primary rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                            aria-label="Search ticket by id"
                        >
                            {ticketSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                >
                    <option value="">Alle</option>
                    <option value="Support">Support</option>
                    <option value="Bug">Fehlerbehebung</option>
                    <option value="Task">Task</option>
                </select>
            </div>

            {error && (
                <div
                    className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 mr-3" />
                    <p>{error}</p>
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center py-10">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!loading && filteredTickets.length > 0 && (
                <div className="space-y-4">
                    {filteredTickets.map(ticket => (
                        <TicketItem
                            key={ticket.id}
                            ticket={ticket}
                            onOpen={(t) =>setTicket(t)}
                        />
                    ))}
                </div>
            )}

            {!loading && filteredTickets.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">No Tickets Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">There are currently no tickets to display.</p>
                </div>
            )}

            {/* Modal */}
            <TicketModal
                open={!!selectedTicket}
                onClose={() => setTicket(null)}
                ticket={selectedTicket}
                additionalInfo={additionalInfo}
            />
        </div>
    );
};

export default Ticketsystem;