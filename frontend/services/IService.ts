import {CustomRequestOptions, DownloadFile, NetworkError, RequestMethod, ResponseType} from "../types.ts";

export const TO_MANY_REQUESTS_EVENT = 'backend-429-to-many-requests';
export const AUTHORIZATION_ERROR_EVENT = 'backend-401-auth-error';
export const SERVER_ERROR_EVENT = 'backend-500-server-error';
export const NOT_FOUND_ERROR_EVENT = 'backend-404-not-found';
export const BACKEND_UNAVAILABLE_EVENT = 'backend-unavailable';
export const BACKEND_OK_EVENT = 'backend-ok';

export class IService {
    protected readonly baseUrl: string;

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl;
    }

    protected async get<T>(endpoint: string, requestOption: CustomRequestOptions = {}): Promise<T> {
        return this.#sendRequest<T>(endpoint, 'GET', requestOption);
    }
    protected async getOld<T>(endpoint: string, responseType: ResponseType = "JSON", headers: Headers = undefined): Promise<T> {

        const customRequestOptions: CustomRequestOptions = {};
        if (headers) {
            customRequestOptions.headers = headers;
        }

        customRequestOptions.responseType = responseType;

        return this.get<T>(endpoint, customRequestOptions);
    }

    protected async post<T>(endpoint: string, requestOption: CustomRequestOptions = {}): Promise<T> {
        return this.#sendRequest<T>(endpoint, 'POST', requestOption);
    }

    protected async put<T>(endpoint: string, requestOption: CustomRequestOptions = {}): Promise<T> {
        return this.#sendRequest<T>(endpoint, 'PUT', requestOption);
    }

    protected async patch<T>(endpoint: string, requestOption: CustomRequestOptions = {}): Promise<T> {
        return this.#sendRequest<T>(endpoint, 'PATCH', requestOption);
    }

    protected async delete(endpoint: string): Promise<void> {
        return await this.#sendRequest<void>(endpoint, 'DELETE');
    }

    async #sendRequest<T>(endpoint: string, method: RequestMethod, requestOption: CustomRequestOptions = {}): Promise<T> {
        console.log(`[${method}] ${this.baseUrl}${endpoint}`, requestOption);
        const reqOptions: RequestInit = this.#createReqOptions(method, requestOption);
        const response = await fetch(this.baseUrl + endpoint, reqOptions);
        return this.#mapResponse<T>(response, requestOption.responseType ? requestOption.responseType : "NONE");

    }

    async #mapResponse<T>(response: Response, responseType: ResponseType): Promise<T> {
        console.log(`Mapping response with status: ${response.status} and type: ${responseType}`);
        if(response.status == 429) {
            window.dispatchEvent(new Event(TO_MANY_REQUESTS_EVENT));
        }else if(response.status == 401 || response.status == 403) {
            window.dispatchEvent(new Event(AUTHORIZATION_ERROR_EVENT));
        }else if(response.status == 502){
            window.dispatchEvent(new Event(BACKEND_UNAVAILABLE_EVENT));
        }else if(response.status >= 500) {
            window.dispatchEvent(new Event(SERVER_ERROR_EVENT));
        }else{
            window.dispatchEvent(new Event(BACKEND_OK_EVENT));
        }


        if(response.status < 200 || response.status > 299) {
            throw new NetworkError(`Error fetching data: ${response.statusText}`, response.status, response.body);
        }

        console.log("Response Type:", responseType);
        const xmlMapper = (text: string): Document => {
            const parser = new DOMParser();
            return parser.parseFromString(text, "application/xml");

        }

        const extractDownload = async (response: Response): Promise<DownloadFile> => {
            const disposition = response.headers.get('Content-Disposition');

            let filename = response.headers.get('X-Filename') || undefined;
            if(!filename && disposition) {
                filename = decodeURIComponent(disposition.split('filename=')[1] || 'downloaded_file');
            }else if(!filename) {
                filename = 'downloaded_file';
            }

            const data = await response.blob();
            const checksum = response.headers.get('X-Checksum') || undefined;
            return {
                filename,
                data,
                checksum
            };
        }

        switch (responseType) {
            case "JSON":
                return await response.json() as Promise<T>;
            case "XML":
                return xmlMapper(await response.text()) as unknown as T;
            case "TXT":
                return await response.text() as unknown as T;
            case "BLOB":
                return  await response.blob() as unknown as T;
            case "DOWNLOAD":
                return await extractDownload(response) as unknown as T;
            case "RESPONSE":
                return response as Response as T;
            case "NONE":
                console.log("Response with no content");
                return Promise.resolve({} as T);
        }
    }

    async ping(): Promise<boolean> {
        try {
            const response = await fetch("/api/info/ping");
            await this.#mapResponse(response, "NONE");
        }catch (err){
            return false;
        }
    }

    #createReqOptions(method: string, requestOption: { headers?: Record<string,string> | Headers, body?: any }): RequestInit {
        const reqOptions: RequestInit = {
            credentials: 'include', // send cookies/session (use 'same-origin' if same host)
            mode: 'cors',
            method,
            headers: {}
        };

        const headers: Record<string, string> = {};

        if (requestOption.headers) {
            if (requestOption.headers instanceof Headers) {
                requestOption.headers.forEach((v, k) => (headers[k] = v));
            } else {
                Object.assign(headers, requestOption.headers);
            }
        }

        if (requestOption.body) {
            if (requestOption.body instanceof FormData) {
                // DO NOT set Content-Type for FormData; browser adds boundary
                reqOptions.body = requestOption.body;
            } else {
                reqOptions.body = JSON.stringify(requestOption.body);
                if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
            }
        }

        reqOptions.headers = headers;
        return reqOptions;
    }

}
