import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ClipboardPlus, Edit, Loader, Save, Share2, X} from 'lucide-react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneLight, vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {useTheme} from '../../hooks/useTheme.ts';
import {useToast} from '../../hooks/useToast.ts';
import {shareService} from '../../services/ShareService.ts';
import copy from 'copy-to-clipboard';
import {CodeSnippetModel} from "../../types/CodeSnippetModel.ts";

interface SnippetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (snippetData: { title: string; code: string; language: string }) => Promise<void>;
    snippet: CodeSnippetModel | null;
    mode: 'view' | 'edit' | 'new';
    onModeChange: (mode: 'view' | 'edit' | 'new') => void;
}

const ALL_LANGUAGES = [
    "textile", "arduino", "asciidoc", "asm6502", "bash", "basic", "batch", "bbcode", "c", "cmake", "cpp", "csharp", "css", "csv", "dart", "docker", "git", "go", "gradle", "groovy", "http", "java", "javadoc", "javascript", "json", "latex", "lua", "makefile", "markdown", "markup", "nginx", "objectivec", "php", "phpdoc", "plsql", "powershell", "properties", "protobuf", "python", "regex", "ruby", "rust", "sql", "swift", "typescript", "uri", "xml", "json"
];

const SnippetModal: React.FC<SnippetModalProps> = ({isOpen, onClose, onSave, snippet, mode, onModeChange}) => {
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [languages, setLanguages] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const {theme} = useTheme();
    const {showToast} = useToast();

    useEffect(() => {
        if (snippet) {
            setTitle(snippet.title);
            setCode(snippet.code);
            setLanguages(snippet.language);
        } else {
            setTitle('');
            setCode('');
            setLanguages('textfile');
        }
    }, [snippet, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({title, code, language: languages, shareType: 'snippet'});
        setIsSaving(false);
    };

    const handleClose = useCallback(() => {
        if (!isSaving) onClose();
    }, [isSaving, onClose]);

    const handleShare = async () => {
        if (!snippet) return;

        const shareUrl = await shareService.createSharedResource({
            content: snippet.code,
            language: snippet.language,
            shareType: 'snippet'
        });

        console.log("Share URL:", shareUrl);
        const copied = await copy(shareUrl);
        console.log("Copied:", copied);
        if (copied) {
            showToast('Shareable link copied to clipboard!', 'success');
        } else {
            showToast('Failed to copy shareable link.', 'error');
        }

    };

    const handleCopy = async () => {
        const code = snippet.code;
        const copied = await copy(code);
        if (copied) {
            showToast('Code copied to clipboard!', 'success');
        } else {
            showToast('Failed to copy code.', 'error');
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleClose]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            handleClose();
        }
    }

    if (!isOpen) return null;

    const isReadOnly = mode === 'view';
    const highlightLanguage = languages || 'text';
    const syntaxTheme = theme === "dark" ? vscDarkPlus : oneLight;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
        >
            <div ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === 'new' && 'New Snippet'}
                        {mode === 'edit' && 'Edit Snippet'}
                        {mode === 'view' && 'View Snippet'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Close modal"
                    >
                        <X className="h-6 w-6 text-gray-500 dark:text-gray-400"/>
                    </button>
                </header>

                <main className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="title"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            readOnly={isReadOnly}
                            placeholder="Snippet title (optional)"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                                isReadOnly
                                    ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-primary focus:border-primary'
                            }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Language Tags
                        </label>

                        <select
                            value={languages}
                            onChange={(e) => setLanguages(e.target.value)}
                            disabled={isReadOnly}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                                isReadOnly
                                    ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-primary focus:border-primary'
                            }`}
                        >
                            {ALL_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div>
                        <label htmlFor="code"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Code
                        </label>
                        {(isReadOnly) ? (
                            <div
                                className="mt-1 block w-full text-sm rounded-md bg-gray-50 dark:bg-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-700">
                                <SyntaxHighlighter
                                    language={highlightLanguage}
                                    style={syntaxTheme}
                                    showLineNumbers
                                    wrapLines
                                    customStyle={{
                                        margin: 0,
                                        maxHeight: '300px',
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
                                    {String(code)}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <textarea
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                readOnly={isReadOnly}
                                rows={12}
                                placeholder="Your code snippet..."
                                className={`font-mono mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm resize-y ${
                                    isReadOnly
                                        ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-primary focus:border-primary'
                                }`}
                                style={{maxHeight: '300px', overflow: 'auto'}}
                            />
                        )}
                    </div>
                </main>

                <footer className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        {snippet && (
                            <>
                                <button
                                    onClick={handleShare}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                    aria-label="Share snippet"
                                >
                                    <Share2 className="h-4 w-4"/>
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                    aria-label="Copy snippet"
                                >
                                    <ClipboardPlus className="h-4 w-4"/>
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        {mode === 'view' && (
                            <>
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => onModeChange('edit')}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
                                >
                                    <Edit className="h-4 w-4"/>
                                    Edit
                                </button>

                            </>
                        )}
                        {(mode === 'edit' || mode === 'new') && (
                            <>
                                <button
                                    onClick={handleClose}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !code}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Loader className="animate-spin h-5 w-5"/> :
                                        <Save className="h-4 w-4"/>}
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default SnippetModal;
