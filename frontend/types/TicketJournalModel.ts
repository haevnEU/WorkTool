import {RedmineUser} from "./TicketUserModel.ts";

export interface TicketJournalModel {
    id: number;
    notes: string;
    created_on: string;
    user: RedmineUser;
}