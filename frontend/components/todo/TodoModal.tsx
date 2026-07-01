import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ClipboardPlus, Loader, Save} from 'lucide-react';
import {useTheme} from '../../hooks/useTheme.ts';
import {useToast} from '../../hooks/useToast.ts';
import copy from 'copy-to-clipboard';
import {TodoModel} from "../../types/TodoModel.ts";

interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (todo: TodoModel) => Promise<void>;
    todo: TodoModel | null;
    onModeChange: (mode: 'view' | 'edit' | 'new') => void;
}

const TodoModal: React.FC<TodoModalProps> = ({isOpen, onClose, onSave, todo}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);

    const modalRef = useRef<HTMLDivElement>(null);
    const {theme} = useTheme();
    const {showToast} = useToast();

    useEffect(() => {
        if (todo) {
            setContent(todo.content)
            setPriority(todo.priority);
        } else {
            setContent('');
            setPriority(undefined);
        }
    }, [todo, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({
            id: todo ? todo.id : undefined,
            content: content,
            priority: priority
        });
        setIsSaving(false);
    };

    const handleClose = useCallback(() => {
        if (!isSaving) onClose();
    }, [isSaving, onClose]);

    const handleCopy = async () => {
        const code = todo.content;
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

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
        >
            <div ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <main className="p-6 space-y-4 overflow-y-auto">
                    <div>
                            <textarea
                                id="code"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={12}
                                placeholder="Your code snippet..."
                                className={`font-mono mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm resize-y ${
                                    'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-primary focus:border-primary'
                                }`}
                                style={{maxHeight: '300px', overflow: 'auto'}}
                            />
                        <select
                            value={priority ?? ''}
                            onChange={(e) => {
                                const v = e.target.value;
                                setPriority(v === '' ? undefined : (v as 'low' | 'medium' | 'high'));
                            }}
                            className="mt-4 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white dark:bg-gray-900"
                        >
                            <option value="">Select priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </main>

                <footer className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        {todo && (
                            <>

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

                    </div>
                </footer>
            </div>
        </div>
    );
};

export default TodoModal;
