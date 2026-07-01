import {IService} from './IService';
import {TicketModel} from "../types/TicketModel.ts";
import {TicketAdditionalInfoModel} from "../types/TicketAdditionalModel.ts";


class TicketService extends IService {
    public async globalSearch(id: string): Promise<TicketModel> {
        console.log("Searching with id " + id);
        try{
        const ticket = await this.getOld<TicketModel>(`/tickets/global/${id}`);
        return ticket;
        } catch (error) {
            return undefined as unknown as TicketModel;
        }
    }

    public async fetchTickets(): Promise<TicketModel[]> {
        const tickets = await this.getOld<TicketModel[]>('/tickets');
        return tickets.sort((a, b) => b.ticketId - a.ticketId);
    }

    public async syncTickets(): Promise<void> {
        await this.getOld('/tickets/refresh', "NONE");
    }

    public async fetchLastUpdate(): Promise<number> {
        return  await this.getOld<number>('/tickets/last-update');
    }

    public async createChecklistFromTicket(ticket: TicketModel): Promise<void> {
        const ticketId = ticket.ticketId;
        if(!ticketId) {
            throw new Error("Ticket ID is missing");
        }else if(ticket.tracker.toLowerCase() !== 'task' && ticket.tracker.toLowerCase() !== 'bug') {
            throw new Error("Checklist can only be created for tickets of type 'Task' or 'Bug'");
        }
        
        await this.get(`/tickets/${ticketId}/add_checkbox`, );
    }

    public async ignoreTicket(id: number): Promise<void> {
        await this.put(`/tickets/ignore/${id}`);
    }

    public async unignoreTicket(id:number): Promise<void> {
        await this.delete(`/tickets/ignore/${id}`);
    }

    public async fetchIgnoredTickets(): Promise<number[]> {
        const data = await this.getOld<number[]>('/tickets/ignored');
        return data;
    }


    public async addNoteToTicket(ticketId: number, note: string): Promise<void> {
        this.post(`/issue-file/set-note/${ticketId}`, {
            body: note,
            bodyType: 'text' as const,
        });
    }

    public async uploadFiles(ticketId: number, files: File[]): Promise<void> {
        const formData = new FormData();

        
        files.forEach(file => {
            formData.append('files', file);
        });
        const requestOptions = {
            body: formData,
            responseType: "NONE" as const,
            bodyType: 'formData' as const
        }
        
        await this.post(`/issue-file/add-image/${ticketId}/ignored`, requestOptions);
        
        // TODO USE THIS ONE
        // await this.post(`/issue-file/upload/${ticketId}`, {

    }

    public async fetchAdditionalInfo(ticketId: number): Promise<TicketAdditionalInfoModel> {
        const reqOptions = {
            responseType: 'JSON' as const,
        }
        const data = await this.get<TicketAdditionalInfoModel>(`/issue-file/get/${ticketId}`, reqOptions);
        return data;
    }

    public async deleteFile(ticketId: number, fileName: string): Promise<void> {
        await this.delete(`/issue-file/image/delete/${ticketId}/${fileName}`);
    }

    public async exportToPdf(ticketId: number): Promise<Blob | void> {
        
    }
}

export const ticketService = new TicketService();
