import {IService} from './IService';
import {CustomRequestOptions} from '../types';
import {WeeklyMeetingModel} from "../types/WeeklyMeetingModel.ts";

type WritableMeeting = Omit<WeeklyMeetingModel, 'id' | 'createdAt'>;


class MeetingService extends IService {

    public async fetchWeeklyMeetings(): Promise<WeeklyMeetingModel[]> {
        const meetings = await this.getOld<WeeklyMeetingModel[]>('/meetings');
        console.log('Fetched meetings:', meetings);
        if (meetings === null || meetings === undefined) {
            return [];
        }
        return meetings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    public async createWeeklyMeeting(data: WritableMeeting): Promise<void> {
        const requestOptions = {
            body: data,
        }
        await this.post<WeeklyMeetingModel>('/meetings', requestOptions);
    }

    public async updateWeeklyMeeting(id: string, data: WritableMeeting): Promise<void> {
        const customRequestOptions = {
            body: data,
        }
        await this.patch<WeeklyMeetingModel>(`/meetings/${id}`, customRequestOptions);
    }

    public async deleteWeeklyMeeting(id: string): Promise<void> {
        await this.delete(`/meetings/${id}`);
    }

    public exportMeetingToPdf(meetingId: string): Promise<Blob> {
        const requestOptions: CustomRequestOptions = {
            responseType: "BLOB"
        }
        return this.get<Blob>(`/meetings/${meetingId}/pdf`, requestOptions);

    };
}

export const meetingService = new MeetingService();
