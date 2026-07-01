import {IService} from './IService';
import {TimetableEntry} from '../types';


class TimetableService extends IService {

    public async fetch(): Promise<TimetableEntry[]> {
        const entries = await this.getOld<TimetableEntry[]>('/timetable/get');
        if (entries === null || entries === undefined) {
            return [];
        }
        return entries;
    }

    public async start(): Promise<void> {
        await this.get('/timetable/start');
    }

    public async stop(id: number): Promise<void> {
        await this.get(`/timetable/stop/${id}`);
    }

    public async deleteItem(id: number): Promise<void> {
        await this.delete(`/timetable/delete/${id}`);
    }

    public async update(id: number, data: TimetableEntry): Promise<void> {
        const requestOptions = {
            body: data,
            bodyType: 'json' as const,
        }
        await this.post(`/timetable/update/${id}`, requestOptions);
    }

    public async exportToPdf(noteId: string): Promise<Blob> {
        const response = await fetch(`${this.baseUrl}/notes/${noteId}/pdf`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/pdf',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to export note to PDF');
        }

        return await response.blob();
    }
}

export const timetableService = new TimetableService();
