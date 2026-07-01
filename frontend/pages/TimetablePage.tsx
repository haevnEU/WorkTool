import React, {useCallback, useEffect, useState} from 'react';
import {AlertCircle, BookOpen, Loader, PlusCircle} from 'lucide-react';
import {TimetableEntry} from '../types';
import {RegularNoteModel} from "../types/RegularNoteModel.ts";
import { timetableService } from '../services/TimetableService';
import TimetableEntryItem from '../components/TimetableEntry';

type ModalMode = 'view' | 'edit' | 'new';

const TimetablePage: React.FC = () => {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalMode, setModalMode] = useState<ModalMode>('new');
    const [selectedNote, setSelectedNote] = useState<RegularNoteModel | null>(null);

    const loadNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const entries = await timetableService.fetch();
            console.log('Loaded timetable entries:', entries);
            setTimetable(entries);
        } catch (err) {
            setError('Failed to load timetable entries.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const  handleStart = async () => {
        try {
            await timetableService.start();
            await loadNotes();
        } catch (err) {
            setError('Failed to start new timetable entry.');
        }
    }

    const handleStop = async (id: number) => {
        try {
            await timetableService.stop(id);
            await loadNotes();
        } catch (err) {
            setError('Failed to stop timetable entry.');
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await timetableService.deleteItem(id);
            await loadNotes();
        } catch (err) {
            setError('Failed to delete timetable entry.');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <BookOpen className="h-8 w-8 text-primary"/>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timetable</h1>
                </div>
                <button
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                    onClick={() => handleStart()}
               >
                    <PlusCircle className="h-5 w-5"/>
                    <span>New Entry</span>
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
            ) : timetable.length > 0 ? (
                <div className="space-y-4">
                     {timetable.map((entry) => (
                        <TimetableEntryItem key={entry.id} entry={entry} onStop={() => handleStop(entry.id)} onDelete={() => handleDelete(entry.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">No Timetable Entries Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Click "New Entry" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default TimetablePage;
