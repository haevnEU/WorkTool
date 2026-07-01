import {IService} from './IService';
import {SearchResult} from '../types';


class DatabaseSearchService extends IService {
    private searchResultsStore: SearchResult[] = [];
    private tableNames: string[] = [];

    public async fetchTableNames(): Promise<string[]> {
        if (this.tableNames.length > 0) {
            return Promise.resolve(this.tableNames);
        }
        const tables = await this.getOld<string[]>('/db/tables');
        this.tableNames = tables;
        return this.tableNames;
    }

    public async searchDatabase(params: {
        searchTerm: string;
        searchField: 'id' | 'token' | 'description' | '',
        searchTable: string,
    }): Promise<SearchResult[]> {
        if (params.searchTable === undefined || params.searchTable === '') {
            throw new Error('Search table must be specified');
        } else if (params.searchField === undefined || params.searchField === '') {
            throw new Error('Search term must be specified');
        }

        let endpoint = `/db/tables/${params.searchTable}/${params.searchField}`;
        console.log('Searching database with params:', params, 'Endpoint:', endpoint);
        if (params.searchTerm && params.searchTerm.trim() !== '') {
            endpoint += `?value=${encodeURIComponent(params.searchTerm.trim())}`;
        }
        const response = await this.getOld<SearchResult[]>(endpoint);
        console.log(response);
        if (response && response.length > 0) {
            this.searchResultsStore = response;
        } else {
            this.searchResultsStore = [];
        }

        return this.searchResultsStore;
    }
}

export const databaseSearchService = new DatabaseSearchService();
