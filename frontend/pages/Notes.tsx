import React, {useCallback, useEffect, useState} from 'react';
import {AlertCircle, BookOpen, Loader, PlusCircle} from 'lucide-react';
import {RegularNoteModel} from "../types/RegularNoteModel.ts";
import {noteService} from '../services';
import NoteModal from '../components/notes/NoteModal.tsx';
import NoteItem from '../components/notes/NoteItem.tsx';

type ModalMode = 'view' | 'edit' | 'new';

const Notes: React.FC = () => {
    const [notes, setNotes] = useState<RegularNoteModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('new');
    const [selectedNote, setSelectedNote] = useState<RegularNoteModel | null>(null);

    const loadNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedNotes = await noteService.fetchNotes();
            console.log('Loaded notes:', fetchedNotes);
            setNotes(fetchedNotes);
        } catch (err) {
            setError('Failed to load notes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const openModal = (mode: ModalMode, note: RegularNoteModel | null = null) => {
        setModalMode(mode);
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNote(null);
    };

    const handleSaveNote = async (noteData: { title: string; content: string }) => {
        try {
            if (modalMode === 'new') {
                await noteService.createNote(noteData);
            } else if (modalMode === 'edit' && selectedNote) {
                await noteService.updateNote(selectedNote.id, noteData);
            }
            closeModal();
            loadNotes(); // Reload notes to see changes
        } catch (err) {
            setError(`Failed to save note. ${err instanceof Error ? err.message : ''}`);
        }
    };

    const handleDeleteNote = async (id: string) => {
        // Optimistic UI update
        setNotes(prevNotes => prevNotes.filter(n => n.id !== id));
        try {
            await noteService.deleteNote(id);
        } catch (err) {
            setError(`Failed to delete note. ${err instanceof Error ? err.message : ''}`);
            loadNotes(); // Revert if delete fails
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <BookOpen className="h-8 w-8 text-primary"/>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
                </div>
                <button
                    onClick={() => openModal('new')}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                    <PlusCircle className="h-5 w-5"/>
                    <span>New Note</span>
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
            ) : notes.length > 0 ? (
                <div className="space-y-4">
                    {notes.map(note => (
                        <NoteItem
                            key={note.id}
                            note={note}
                            onView={() => openModal('view', note)}
                            onEdit={() => openModal('edit', note)}
                            onDelete={() => handleDeleteNote(note.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">No Notes Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Click "New Note" to get started.</p>
                </div>
            )}

            <NoteModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveNote}
                note={selectedNote}
                mode={modalMode}
                onModeChange={(newMode) => setModalMode(newMode)}
            />
        </div>
    );
};

export default Notes;
