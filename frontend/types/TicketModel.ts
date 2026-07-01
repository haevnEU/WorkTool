import {TicketJournal} from "./TicketJournalModel.ts";

export interface TicketModel {
    ticketId: number;
    title: string;
    tracker: string;
    project: string;
    description: string;
    ticketUrl: string;
    mergeRequestUrl: string;
    journals: TicketJournal[];
}

