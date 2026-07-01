import React, {FormEvent, useState} from 'react';
import {AlertTriangle, ArrowLeft, ArrowRight, Globe, Lock, RotateCw} from 'lucide-react';

const WebBrowser: React.FC = () => {
    const [history, setHistory] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [inputValue, setInputValue] = useState('');
    const [reloadKey, setReloadKey] = useState(0); // For forcing iframe reload
    const [loadError, setLoadError] = useState(false); // For tracking loading errors

    const currentUrl = history[currentIndex];

    const navigateTo = (url: string) => {
        let formattedUrl = url.trim();
        if (!formattedUrl) return;

        if (!/^(https?:\/\/)/i.test(formattedUrl)) {
            formattedUrl = `https://${formattedUrl}`;
        }

        setLoadError(false); // Reset error on new navigation
        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(formattedUrl);

        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
        setInputValue(formattedUrl);
    };

    const handleGoBack = () => {
        if (currentIndex > 0) {
            setLoadError(false);
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            setInputValue(history[newIndex]);
        }
    };

    const handleGoForward = () => {
        if (currentIndex < history.length - 1) {
            setLoadError(false);
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            setInputValue(history[newIndex]);
        }
    };

    const handleReload = () => {
        if (currentUrl) {
            setLoadError(false);
            setReloadKey(prev => prev + 1);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        navigateTo(inputValue);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-8 w-8 text-primary"/>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Web Browser</h1>
            </div>

            <div
                className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-4 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                <div>
                    <h3 className="font-semibold">Limited Functionality</h3>
                    <p className="text-sm">Please note that many websites cannot be embedded due to modern security
                        policies (like <code>X-Frame-Options</code>). If a page appears blank, it is likely blocking
                        requests from this browser.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex-grow flex flex-col overflow-hidden">
                {/* Browser Toolbar */}
                <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button onClick={handleGoBack} disabled={currentIndex <= 0}
                            className="p-2 rounded-full disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Go back">
                        <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300"/>
                    </button>
                    <button onClick={handleGoForward} disabled={currentIndex >= history.length - 1}
                            className="p-2 rounded-full disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Go forward">
                        <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-300"/>
                    </button>
                    <button onClick={handleReload} disabled={!currentUrl}
                            className="p-2 rounded-full disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Reload">
                        <RotateCw className="h-5 w-5 text-gray-600 dark:text-gray-300"/>
                    </button>
                    <form onSubmit={handleSubmit} className="flex-grow ml-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-primary focus:ring-primary dark:text-gray-200 focus:outline-none transition"
                                aria-label="Address bar"
                            />
                        </div>
                    </form>
                </div>

                {/* Browser Content */}
                <div className="flex-grow relative bg-gray-100 dark:bg-gray-900">
                    {currentUrl ? (
                        <>
                            <iframe
                                key={`${currentUrl}-${reloadKey}`} // Change key to force re-mount and thus reload
                                src={currentUrl}
                                title="Web Browser"
                                className="w-full h-full border-0"
                                sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts allow-top-navigation-by-user-activation allow-downloads"
                                onError={() => {
                                    console.error(`Error loading URL: ${currentUrl}`);
                                    setLoadError(true);
                                }}
                            />
                            {loadError && (
                                <div
                                    className="absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 text-red-500 p-4 text-center">
                                    <AlertTriangle className="h-16 w-16 mb-4"/>
                                    <p className="text-xl font-semibold">Failed to Load Page</p>
                                    <p className="mt-1 max-w-md">The requested URL could not be loaded. This might be
                                        due to the site's security policy, network issues, or an invalid URL.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className="w-full h-full flex flex-col justify-center items-center text-gray-500 dark:text-gray-400 p-4 text-center">
                            <Globe className="h-16 w-16 mb-4 opacity-50"/>
                            <p className="text-xl font-semibold">Browse the Web</p>
                            <p className="mt-1">Enter a URL in the address bar above to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebBrowser;
