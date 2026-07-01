import {IService} from './IService';
import {RegularNoteModel} from "../types/RegularNoteModel.ts";


class NoteService extends IService {
    private notesStore: RegularNoteModel[] = [];

    public async fetchNotes(): Promise<RegularNoteModel[]> {
        const notes = await this.getOld<RegularNoteModel[]>('/notes');
        if (notes === null || notes === undefined) {
            return [];
        }
        return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    public async createNote(data: { title: string; content: string }): Promise<boolean> {
        const requestOptions = {
            body: data,
        }
        return await this.post<boolean>('/notes', requestOptions);
    }

    public updateNote(id: string, data: { title: string; content: string }): Promise<boolean> {
        const requestOptions = {
            body: data,
        }
        return this.put<boolean>(`/notes/${id}`, requestOptions);
    }

    public async deleteNote(id: string): Promise<void> {
        await this.delete(`/notes/${id}`);
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

export const noteService = new NoteService();
