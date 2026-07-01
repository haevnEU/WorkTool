// file: `snippetManager/frontend/components/TicketItem.tsx`
import React from 'react';
import {ExternalLink, GitMerge} from 'lucide-react';
import {TicketModel} from "../../types/TicketModel";

interface TicketItemProps {
    ticket: TicketModel;
    onOpen?: (ticket: TicketModel) => void;
}

const TicketItem: React.FC<TicketItemProps> = ({ticket, onOpen}) => {
    const onClick = () => {
        onOpen?.(ticket);
    }

    return (
        <div onClick={onClick}
            className="cursor-pointer bg-white dark:bg-gray-800 p-5 shadow-md rounded-lg w-full transition-shadow duration-200 hover:shadow-lg">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {`[${ticket.tracker}] #${ticket.ticketId} ${ticket.title}`}
                </h3>
                <span className="text-sm font-semibold text-primary dark:text-primary-400 flex-shrink-0 ml-4">
                    #{ticket.project}
                </span>
            </div>
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                <span>Erstelldatum: {ticket.createdOn}</span>
                <span>Letztes Update: {ticket.lastUpdatedOn}</span>
                <span>Geschätzter Aufwand: {ticket.estimatedHours}h</span>
                <span>Aufwand: {ticket.spentHours}h</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {
                    ticket.description.length > 512 ? ticket.description.slice(0, 509) + '...' : ticket.description
                }
            </p>
            <div
                className="flex items-center justify-start space-x-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                {
                    ticket.ticketUrl && (
                        <a
                            href={ticket.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                        >
                            <ExternalLink className="h-3.5 w-3.5"/>
                            <span>View Ticket</span>
                        </a>
                    )}
                {
                    ticket.mergeRequestUrl && (
                        <a
                            href={ticket.mergeRequestUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
                        >
                            <GitMerge className="h-3.5 w-3.5"/>
                            <span>Merge Request</span>
                        </a>
                    )
                }

            </div>
        </div>
    );
};

export default TicketItem;