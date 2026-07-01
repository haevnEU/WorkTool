import {IService} from './IService';
import {CodeSnippetModel} from "../types/CodeSnippetModel.ts";


class SnippetService extends IService {

    public async fetchSnippets(): Promise<CodeSnippetModel[]> {
        const snippets = await this.getOld<CodeSnippetModel[]>('/snippets');
        if (snippets === null || snippets === undefined) {
            return [];
        }
        return snippets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    public async createSnippet(data: { title: string; code: string; language: string[], shareType: string }): Promise<void> {
        const requestOptions = {
            body: data,
        }
        console.log("Before posting snippet:", data);
        await this.post<boolean>('/snippets', requestOptions);
    }

    public async updateSnippet(id: string, data: { title: string; code: string; language: string[] }): Promise<void> {
        const requestOptions = {
            body: data,
        }
        await this.put<CodeSnippetModel>(`/snippets/${id}`, requestOptions);
    }

    public async deleteSnippet(id: string): Promise<void> {
        await this.delete(`/snippets/${id}`);
    }
}

export const snippetService = new SnippetService();
