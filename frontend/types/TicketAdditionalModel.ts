import {ImageListItem} from "./ImageListItem.ts";

export interface TicketAdditionalInfoModel{
    id: string;
    ticketId: string;
    url: string;
    title: string;
    notes: string;
    imageList: ImageListItem[];
}
