import React, {useEffect, useState} from 'react';
import {AlertCircle, Database, Loader, Search, ServerCrash} from 'lucide-react';
import {SearchResult} from '../types';
import {databaseSearchService} from '../services';
import SearchResultItem from '../components/SearchResultItem';

const DatabaseSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState<'id' | 'token' | 'description'>('id');
    const [searchTable, setSearchTable] = useState<string>('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [tableNames, setTableNames] = useState<string[]>([]);

    useEffect(() => {
        updateTableNames();
    }, [tableNames]);

    const updateTableNames = async () => {
        const tables = await databaseSearchService.fetchTableNames();
        setTableNames(tables);
        setSearchTable(tables[0] || '');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const data = await databaseSearchService.searchDatabase({searchTerm, searchField, searchTable});
            console.log('Search results:', data);
            setResults(data);
        } catch (err) {
            setError('An error occurred while searching. Please try again.');
            console.log(err)
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-primary"/>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Search</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="search-term"
                           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Database Query
                    </label>
                    <div
                        className="mt-1 flex items-center border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
                        <select
                            id="search-field"
                            name="search-field"
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value as 'id' | 'token' | 'description')}
                            className="h-full pl-3 pr-7 py-2 border-transparent bg-transparent text-gray-500 dark:text-gray-400 sm:text-sm rounded-l-md focus:outline-none focus:ring-0 border-r border-gray-300 dark:border-gray-600"
                            aria-label="Search field"
                        >
                            <option value="id">ID</option>
                            <option value="token">Token</option>
                            <option value="description">Description</option>
                        </select>
                        <select
                            id="table-field"
                            name="table-field"
                            value={searchTable}
                            onChange={(e) => setSearchTable(e.target.value)}
                            className="h-full pl-3 pr-7 py-2 border-transparent bg-transparent text-gray-500 dark:text-gray-400 sm:text-sm rounded-l-md focus:outline-none focus:ring-0 border-r border-gray-300 dark:border-gray-600"
                            aria-label="Table Field"
                        >
                            {
                                tableNames.map((tableName) => (
                                    <option key={tableName} value={tableName}>{tableName}</option>
                                ))
                            }
                        </select>
                        <input
                            type="text"
                            id="search-term"
                            name="search-term"
                            value={searchTerm}
                            onKeyDown={e=> e.key === 'Enter' && handleSubmit(e)}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                            }}
                            placeholder="Enter a value to search..."
                            className="flex-1 w-full p-2 border-none bg-transparent focus:ring-0 sm:text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    {error && (
                        <div
                            className="mt-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md flex items-center">
                            <AlertCircle className="h-5 w-5 mr-3"/>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="text-right mt-6">
                        <button type="submit" disabled={loading}
                                className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <Loader className="animate-spin h-5 w-5 mr-3"/> :
                                <Search className="h-5 w-5 mr-2"/>}
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Results</h2>
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader className="h-8 w-8 animate-spin text-primary"/>
                    </div>
                ) : !hasSearched ? (
                    <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <Search className="h-12 w-12 mx-auto text-gray-400"/>
                        <h3 className="text-xl font-semibold mt-4">Perform a search</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your criteria above to find
                            records.</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-4">
                        {results.map(result => <SearchResultItem key={result.id} result={result}/>)}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <ServerCrash className="h-12 w-12 mx-auto text-gray-400"/>
                        <h3 className="text-xl font-semibold mt-4">No Results Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Your search did not match any records. Try
                            different criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatabaseSearch;
