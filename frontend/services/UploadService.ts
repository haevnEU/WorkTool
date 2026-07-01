import {IService} from './IService';
import {DownloadFile, FileEntry} from "../types.ts";


class UploadService extends IService {

    public fetchFiles(): Promise<FileEntry[]> {
        return this.getOld<FileEntry[]>('/file_shares');
    }

    public async uploadFile(files: File[]): Promise<void> {
        const fd = new FormData();
        for (const file of files) {
            fd.append("file", file, file.name);
        }
        const requestOptions = {
            body: fd,
            responseType: "NONE" as const,
            bodyType: 'formData' as const
        }

        await this.post<void>('/file_shares/upload', requestOptions);
    }

    public async deleteFile(shortId: string): Promise<void> {
        await this.delete(`/file_shares/delete/${encodeURIComponent(shortId)}`);
    }

    public async downloadFile(shortId: string): Promise<DownloadFile> {
        const requestOptions = {
            responseType: "DOWNLOAD" as const
        }
        return this.get<DownloadFile>(`/file_shares/download/${encodeURIComponent(shortId)}`, requestOptions);
    }
}

export const uploadService = new UploadService();
