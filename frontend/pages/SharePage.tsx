import React, {useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import {shareService, ShareType} from "../services/ShareService";
import {ShareableResource} from "../types.ts";
import {oneLight, vscDarkPlus} from "react-syntax-highlighter/dist/esm/styles/prism";
import {useTheme} from "../hooks/useTheme.ts";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import { log } from 'node:console';


const SharePage: React.FC = () => {
    const {theme} = useTheme();


    const {type, id} = useParams<{ type: string; id: string }>();
    const [unlocked, setUnlocked] = React.useState<boolean>(false);
    const [password, setPassword] = React.useState<string>('');
    const [data, setData] = React.useState<ShareableResource>({});
    const syntaxTheme = theme === ('dark' || 'ocean') ? vscDarkPlus : oneLight;
    const codeContainerRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        fetchData();
    }, [type, id]);

    const fetchData = async () => {
         setData({});
        const hasPassword = await shareService.hasPassword(id);
        setUnlocked(!hasPassword);
        if (!hasPassword) {
            const resp = await shareService.fetchSharedResource(id);
            setData(resp);
            setUnlocked(true);
        }
    }


    const unlockWithPassword = async () => {
        const resp = await shareService.fetchSharedResource(id, password);
        setData(resp);
        setUnlocked(true);
    }

    const renderPasswordPrompt = () => {
        return (
            <div className="p-4 max-w-md">
                <h2 className="text-lg font-medium mb-2">This {type} is password protected.</h2>
                <p className="text-sm mb-4">Enter the password to access the shared content.</p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        unlockWithPassword();
                    }}
                >
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-3xl mx-auto">

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Password"
                            aria-label="password"
                        />

                        <button
                            type="submit"
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                        >Unlock
                        </button>

                        <div>
                            <label htmlFor="firstName"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300">First
                                Name</label>
                            <input type="text" name="firstName" id="firstName"
                                   className="mt-1 block w-full input-style"/>
                        </div>
                    </div>
                </form>
            </div>
        );
    }


    const formatDate = (ts?: number | string): string => {
        if (!ts) return '';
        const n = typeof ts === 'string' ? Number(ts) : ts;
        if (Number.isNaN(n)) return '';
        return new Date(n).toLocaleString();
    };


    const handleCodeClick = () => {
        codeContainerRef.current?.focus();
    };

    const handleCodeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        if (!isCtrlOrCmd || event.key.toLowerCase() !== 'a') return;

        const container = codeContainerRef.current;
        if (!container) return;

        const codeElement = container.querySelector('pre');
        if (!codeElement) return;

        event.preventDefault();

        const selection = window.getSelection();
        if (!selection) return;

        const range = document.createRange();
        range.selectNodeContents(codeElement);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    const renderContent = () => {
        return (
            <>                <div>
                    <div className="max-w-md mt-4">
                        <div className="flex items-center gap-4 mb-2">
                            <label className="w-36 text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                            <input
                                type="text"
                                readOnly
                                value={data?.language ?? 'N/A'}
                                className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                                aria-label="Expiration Date"
                            />
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                            <label className="w-36 text-sm font-medium text-gray-700 dark:text-gray-300">Creation Date</label>
                            <input
                                type="text"
                                readOnly
                                value={formatDate(data?.creationDate)}
                                className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                                aria-label="Creation Date"
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                            <label className="w-36 text-sm font-medium text-gray-700 dark:text-gray-300">Expiration Date</label>
                            <input
                                type="text"
                                readOnly
                                value={formatDate(data?.expirationDate)}
                                className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                                aria-label="Expiration Date"
                            />
                        </div>
                    </div>
                </div>
                <br/>
                <div
                    ref={codeContainerRef}
                    tabIndex={0}
                    onClick={handleCodeClick}
                    onKeyDown={handleCodeKeyDown}
                    className="mt-1 block w-full text-sm rounded-md bg-gray-50 dark:bg-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <SyntaxHighlighter
                        language={data.language || 'text'}
                        style={syntaxTheme}
                        showLineNumbers
                        wrapLines
                        customStyle={{
                            margin: 0,
                            borderRadius: '0',
                            border: 'none',
                            padding: '1rem',
                            backgroundColor: 'transparent'
                        }}
                        codeTagProps={{
                            style: {
                                fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
                                fontSize: '0.875rem',
                            }
                        }}
                    >
                        {String(data.content || '')}
                    </SyntaxHighlighter>
                </div>

            </>

        );
    }

    const renderInvalid = () => (
        <div className="p-4 max-w-md">
            <h2 className="text-lg font-medium mb-2">Invalid link</h2>
            <p className="text-sm mb-2">The requested share is invalid or expired.</p>
            <pre className="whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {id ?? 'unknown id'}
        </pre>
        </div>
    );

    return (
        <div>
            {unlocked ? (data?.content ? renderContent() : renderInvalid()) : renderPasswordPrompt()}
        </div>
    );
};

export default SharePage;