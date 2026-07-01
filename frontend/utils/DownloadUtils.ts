import {DownloadFile} from "../types.ts";


class DownloadUtils {

    public async downloadContent(data: Blob, filename: string): Promise<void> {
        const downloadFile = {
            filename: filename,
            data: data
        };
        return this.download(downloadFile);
    }


    public async downloadString(data: string, filename: string): Promise<void> {
        const blob = new Blob([data], {type: 'text/plain'});
        const downloadFile = {
            filename: filename,
            data: blob
        };
        return this.download(downloadFile);
    }

    public async download(downloadFile: DownloadFile): Promise<void> {
        const url = window.URL.createObjectURL(downloadFile.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadFile.filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

export const downloadUtils = new DownloadUtils();
