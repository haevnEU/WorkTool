import {IService} from './IService';

class elsServie extends IService {
    executeTest(selectedTest: string): Promise<void> {
        const requestOptions = {
        }
        if(!selectedTest) {
            throw new Error("No test selected");
        }
        return this.get<void>(`/itest/execute/${selectedTest}`, requestOptions);
    }

    executeAllTests(): Promise<void> {
        const requestOptions = {
        }
        return this.get<void>(`/itest/execute`, requestOptions);
    }

    public async extractSerialnumbers(serials: string): Promise<Blob> {
        const requestOptions = {
            body: serials,
            responseType: "BLOB" as const,
        }
        return await this.post<Blob>('/els2/extract', requestOptions);
    }

    public async getTests(): Promise<string[]> {
        const rquestOptions = {
            responseType: "JSON" as const,
        }
        return await this.get<string[]>('/itest', rquestOptions);
    }
}

export const elsService = new elsServie();
