import {IService} from './IService';
import {DownloadFile, ValidationSchema} from "../types.ts";


class RuleService extends IService {

    public async createDocumentation(files: File[]): Promise<DownloadFile> {
        const fd = new FormData();
        for (const file of files) {
            fd.append("file", file, file.name);
        }
        const requestOptions = {
            body: fd,
            responseType: "DOWNLOAD" as const,
            bodyType: 'formData' as const,
        }

        return await this.post<DownloadFile>('/validation-schema/pdf', requestOptions);
    }

    async createValidationSchema(schema: ValidationSchema): Promise<DownloadFile> {
        console.log("Creating validation schema:", schema);
        const requestOptions = {
            body: schema,
            responseType: "DOWNLOAD" as const,
            bodyType: 'formData' as const,
        }

        return await this.post<DownloadFile>('/validation-schema/create', requestOptions);
    }
}

export const ruleService = new RuleService();
