import {ShareType} from "./services/ShareService.ts";
import {TicketModel} from "./types/TicketModel.ts";

export type Theme = 'light' | 'dark' | 'colorful' | 'ocean';
export type FileEntry = {
    shortId: string;
    password: string;
    creationDate: number;
    expirationDate: number;
    filename: string;
    hash: string;
};

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    changeTheme: (theme: Theme) => void;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    motto: string;
    pictureUrl: string;
    username: string;
    theme: Theme;
    password?: string;
    imgId?: string;
}


export interface SearchResult {
    id: string;
    token: string;
    description: string;
    type: 'User Data' | 'Transaction Logs' | 'System Events';
    timestamp: string;
}

export class CustomError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export class NetworkError extends Error {
    public statusCode: number;
    public body: any;

    constructor(message: string, statusCode: number, body: any = null) {
        super(message);
        this.statusCode = statusCode;
        this.body = body;
        Object.setPrototypeOf(this, CustomError.prototype);
    }

}

export interface ShareableResource {
    id?: string;
    creationDate?: string;
    expirationDate?: string | null;
    password?: string | null;
    content: string;
    language: string;
    shareType?: ShareType
}

export interface CustomRequestOptions {
    headers?: Headers;
    responseType?: ResponseType;
    body?: any;
    bodyType?: 'json' | 'formData' | 'urlEncoded' | 'text';
}

export interface DownloadFile {
    filename: string;
    data: Blob;
    checksum?: string;
}

export type ResponseType = 'JSON' | 'XML' | 'TXT' | 'BLOB' | 'NONE' | 'DOWNLOAD' | 'RESPONSE'
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// typescript
// frontend/types/ValidationSchema.ts
export interface FormatRule {
    identifierColumn: number;
    fieldName: string;
    description: string;
    regex?: string;
    choice?: string;
    errorCode?: string;
    errorMessage?: string;
    column?: number;
    optional?: boolean;
}

export interface ValidationSchema {
    readableName: string;
    schemaName: string;
    headerIdentifier: string;
    headerIdentifierColumn: number;
    idColumn: number;
    idName: string;
    totalColumns: number;
    mandatory: FormatRule[];
    optional: FormatRule[];
}

export interface TimetableEntry {
    id: number | undefined;
    startTime: number | undefined;
    endTime: number | undefined;
    comment: string | null;
    type: string | null;
    ticket: TicketModel | null;
}
