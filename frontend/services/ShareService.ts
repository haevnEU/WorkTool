import {IService} from './IService';
import {ShareableResource} from '../types';

class ShareService extends IService {

    public async hasPassword(resourceId: string): Promise<boolean> {
        const hasPassword = this.getOld<boolean>(`/share/${resourceId}/hasPassword`);
        return hasPassword;
    }


    public async fetchSharedResource(resourceId: string, password: string = undefined): Promise<any> {
        const headers = new Headers();
        if (password) {
            headers.append('password', `${password}`);
        }
        const response = this.getOld<any>(`/share/${resourceId}`, "JSON", headers);
        return await response;
    }

    public async createSharedResource(resource: ShareableResource): Promise<string> {
        console.log(resource)
        const requestOptions = {
            body: resource,
            responseType: "TXT" as const,
        }
        const id = await this.post<string>('/share/create', requestOptions);
        const {protocol, hostname, port} = window.location;
        const host = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
        return `${host}/#/share/${id}`;

    }

    async deleteSharedResource(resourceId: string): Promise<void> {
        await this.delete(`/share/${resourceId}`);
    }

    async deleteExpiredResources(): Promise<void> {
        await this.delete('/share/cleanup');
    }

    async getAll(): Promise<ShareableResource[]> {
        const resources = await this.getOld<ShareableResource[]>('/share/all');
        if (resources === null || resources === undefined) {
            return [];
        }
        return resources.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }



    public convertIdToShareableLink(id: string): string {
        return `${window.location.origin}/#/share/${id}`;
    }
}

export type ShareType = 'meeting' | 'note' | 'snippet';
export const shareService = new ShareService();
