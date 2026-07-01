import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RegularNoteModel} from "../../types/RegularNoteModel.ts";
import {Edit, FileText, Loader, Save, Share2, X} from 'lucide-react';
import {useToast} from '../../hooks/useToast.ts';
import TextAreaWithToolbar from '../TextAreaWithToolbar.tsx';
import {noteService} from "../../services";
import {shareService} from "../../services/ShareService.ts";
import {useClipboard} from "../../hooks/UseClipboard.ts";
import {downloadUtils} from "../../utils/DownloadUtils.ts";

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (noteData: { title: string; content: string }) => Promise<void>;
    note: RegularNoteModel | null;
    mode: 'view' | 'edit' | 'new';
    onModeChange: (mode: 'view' | 'edit' | 'new') => void;
}

const NoteModal: React.FC<NoteModalProps> = ({isOpen, onClose, onSave, note, mode, onModeChange}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const {copy} = useClipboard();
    const {showToast} = useToast();

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
        } else {
            setTitle('');
            setContent('');
        }
    }, [note, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({title, content});
        setIsSaving(false);
    };

    const handleClose = useCallback(() => {
        if (!isSaving) onClose();
    }, [isSaving, onClose]);

    const handleShare = async () => {
        console.log("content", content);
        if (!note) return;
        const shareUrl = await shareService.createSharedResource({
            content: content,
            language: "plaintext",
            shareType: 'note',
        });

        const copied = await copy(shareUrl);
        if (copied) {
            showToast('Code copied to clipboard!', 'success');
        } else {
            showToast('Failed to copy code.', 'error');
        }
    };

    const handleExport = async () => {
        if (!note) return;
        setIsExporting(true);
        try {
            const pdfBlob = await noteService.exportToPdf(note.id);
            await downloadUtils.downloadContent(pdfBlob, `Weekly-Meeting-Week-${note.id}.pdf`);
            showToast('PDF export started!', 'success');
        } catch (error) {
            showToast('Failed to export PDF.', 'error');
        } finally {
            setIsExporting(false);
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
                        {mode === 'new' && 'New Note'}
                        {mode === 'edit' && 'Edit Note'}
                        {mode === 'view' && 'View Note'}
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
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            readOnly={isReadOnly}
                            placeholder="Note title (optional)"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                                isReadOnly
                                    ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-primary focus:border-primary'
                            }`}
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Content
                        </label>
                        <TextAreaWithToolbar
                            id="content"
                            value={content}
                            onChange={setContent}
                            readOnly={isReadOnly}
                            rows={12}
                            placeholder="Your note content..."
                        />
                    </div>
                </main>

                <footer className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        {note && (
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                    <button onClick={handleShare} className="btn-secondary-icon"
                                        aria-label="Share meeting"><Share2 className="h-4 w-4"/><span>Share</span>
                                    </button>
                                    <button onClick={handleExport} disabled={isExporting} className="btn-secondary-icon"
                                        aria-label="Export to PDF">
                                        {isExporting ? <Loader className="animate-spin h-4 w-4"/> :
                                            <FileText className="h-4 w-4"/>}
                                        <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                                    </button>
                                </div>
                            </div>
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
                                    disabled={isSaving || !content}
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

export default NoteModal;
