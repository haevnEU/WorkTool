export interface MergeRequestUserModel {
    id: string;
    username: string;
    name: string;
    state: string;
    locked: boolean;
    avatar_url: string;
    web_url: string;
}