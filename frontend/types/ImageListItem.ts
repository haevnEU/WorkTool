export interface ImageListItem {
    name: string;
    filename?: string;
    content: string | Uint8Array | number[] | ArrayBuffer | Blob;
    contentType?: string;
    mimeType?: string;
}
