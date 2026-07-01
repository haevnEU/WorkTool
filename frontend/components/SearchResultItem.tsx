import React, {useState} from 'react';
import {SearchResult} from '../types';
import {Check, Clock, Copy} from 'lucide-react';
import {useToast} from '../hooks/useToast';

interface SearchResultItemProps {
    result: SearchResult;
}

const typeColors: { [key in SearchResult['type']]: string } = {
    'User Data': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'Transaction Logs': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'System Events': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

const SearchResultItem: React.FC<SearchResultItemProps> = ({result}) => {
    const {showToast} = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(result.token).then(() => {
            showToast('Token copied to clipboard!', 'success');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            showToast('Failed to copy token.', 'error');
            console.error('Copy failed:', err);
        });
    };

    const formatDateTime = (isoString: string) => {
        return new Date(isoString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 p-5 shadow-md rounded-lg w-full transition-shadow duration-200 hover:shadow-lg">
            <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white break-all">
                    Token: <span
                    className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-base">{result.token}</span>
                </h3>
                <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${typeColors[result.type]}`}>
                    {result.type}
                </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {result.description}
            </p>
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex items-center space-x-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">ID:</p>
                    <div
                        className="flex items-center gap-2 font-mono text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded-md">
                        <span className="text-gray-500 dark:text-gray-400 select-all">{result.id}</span>
                        <button onClick={handleCopy}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label="Copy token">
                            {copied ? <Check className="h-4 w-4 text-green-500"/> :
                                <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400"/>}
                        </button>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Token:</p>
                    <div
                        className="flex items-center gap-2 font-mono text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded-md">
                        <span className="text-gray-500 dark:text-gray-400 select-all">{result.token}</span>
                        <button onClick={handleCopy}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label="Copy token">
                            {copied ? <Check className="h-4 w-4 text-green-500"/> :
                                <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400"/>}
                        </button>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</p>
                    <div
                        className="flex items-center gap-2 font-mono text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded-md">
                        <span className="text-gray-500 dark:text-gray-400 select-all">{result.description}</span>
                        <button onClick={handleCopy}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label="Copy token">
                            {copied ? <Check className="h-4 w-4 text-green-500"/> :
                                <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400"/>}
                        </button>
                    </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5 mr-1.5"/>
                    <span>{formatDateTime(result.timestamp)}</span>
                </div>
            </div>
        </div>
    );
};

export default SearchResultItem;
