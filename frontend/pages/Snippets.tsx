import React, {useCallback, useEffect, useState} from 'react';
import {AlertCircle, ClipboardList, Loader, PlusCircle} from 'lucide-react';
import {snippetService} from '../services';
import SnippetModal from '../components/snippet/SnippetModal.tsx';
import SnippetItem from '../components/snippet/SnippetItem.tsx';
import {CodeSnippetModel} from "../types/CodeSnippetModel.ts";

type ModalMode = 'view' | 'edit' | 'new';

const Snippets: React.FC = () => {
    const [snippets, setSnippets] = useState<CodeSnippetModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('new');
    const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippetModel | null>(null);

    const loadSnippets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedSnippets = await snippetService.fetchSnippets();
            setSnippets(fetchedSnippets);
        } catch (err) {
            setError('Failed to load snippets.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSnippets();
    }, [loadSnippets]);

    const openModal = (mode: ModalMode, snippet: CodeSnippetModel | null = null) => {
        setModalMode(mode);
        setSelectedSnippet(snippet);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSnippet(null);
    };

    const handleSaveSnippet = async (snippetData: { title: string; code: string; language: string[], shareType: string }) => {
        try {
            if (modalMode === 'new') {
                console.log("SAVBING", snippetData)
                await snippetService.createSnippet(snippetData);
            } else if (modalMode === 'edit' && selectedSnippet) {
                await snippetService.updateSnippet(selectedSnippet.id, snippetData);
            }
            closeModal();
            loadSnippets(); // Reload snippets to see changes
        } catch (err) {
            setError(`Failed to save snippet. ${err instanceof Error ? err.message : ''}`);
        }
    };

    const handleDeleteSnippet = async (id: string) => {
        // Optimistic UI update
        setSnippets(prevSnippets => prevSnippets.filter(s => s.id !== id));
        try {
            await snippetService.deleteSnippet(id);
        } catch (err) {
            setError(`Failed to delete snippet. ${err instanceof Error ? err.message : ''}`);
            loadSnippets(); // Revert if delete fails
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <ClipboardList className="h-8 w-8 text-primary"/>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Snippets</h1>
                </div>
                <button
                    onClick={() => openModal('new')}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                    <PlusCircle className="h-5 w-5"/>
                    <span>New Snippet</span>
                </button>
            </div>

            {error && (
                <div
                    className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 mr-3"/>
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader className="h-8 w-8 animate-spin text-primary"/>
                </div>
            ) : snippets.length > 0 ? (
                <div className="space-y-4">
                    {snippets.map(snippet => (
                        <SnippetItem
                            key={snippet.id}
                            snippet={snippet}
                            onView={() => openModal('view', snippet)}
                            onEdit={() => openModal('edit', snippet)}
                            onDelete={() => handleDeleteSnippet(snippet.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">No Snippets Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Click "New Snippet" to get started.</p>
                </div>
            )}

            <SnippetModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveSnippet}
                snippet={selectedSnippet}
                mode={modalMode}
                onModeChange={(newMode) => setModalMode(newMode)}
            />
        </div>
    );
};

export default Snippets;
