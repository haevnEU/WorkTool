import React, {useCallback, useEffect, useState} from 'react';
import {AlertCircle, Loader, PlusCircle, Users} from 'lucide-react';
import {WeeklyMeetingModel} from "../types/WeeklyMeetingModel.ts";

import {meetingService} from '../services';
import MeetingModal from '../components/meeting/MeetingModal.tsx';
import MeetingItem from '../components/meeting/MeetingItem.tsx';

type ModalMode = 'view' | 'edit' | 'new';
type WritableMeeting = Omit<WeeklyMeetingModel, 'id' | 'createdAt'>;

const WeeklyMeeting: React.FC = () => {
    const [meetings, setMeetings] = useState<WeeklyMeetingModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('new');
    const [selectedMeeting, setSelectedMeeting] = useState<WeeklyMeetingModel | null>(null);

    const loadMeetings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedMeetings = await meetingService.fetchWeeklyMeetings();
            setMeetings(fetchedMeetings);
        } catch (err) {
            setError('Failed to load weekly meetings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMeetings();
    }, [loadMeetings]);

    const openModal = (mode: ModalMode, meeting: WeeklyMeetingModel | null = null) => {
        setModalMode(mode);
        setSelectedMeeting(meeting);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMeeting(null);
    };

    const handleSaveMeeting = async (meetingData: WritableMeeting) => {
        try {
            if (modalMode === 'new') {
                await meetingService.createWeeklyMeeting(meetingData);
            } else if (modalMode === 'edit' && selectedMeeting) {
                await meetingService.updateWeeklyMeeting(selectedMeeting.id, meetingData);
            }
            closeModal();
            loadMeetings();
        } catch (err) {
            setError(`Failed to save meeting. ${err instanceof Error ? err.message : ''}`);
        }
    };

    const handleDeleteMeeting = async (id: string) => {
        setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== id));
        try {
            await meetingService.deleteWeeklyMeeting(id);
        } catch (err) {
            setError(`Failed to delete meeting. ${err instanceof Error ? err.message : ''}`);
            loadMeetings();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-primary"/>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Meeting</h1>
                </div>
                <button
                    onClick={() => openModal('new')}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                    <PlusCircle className="h-5 w-5"/>
                    <span>New Meeting</span>
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
            ) : meetings.length > 0 ? (
                <div className="space-y-4">
                    {meetings.map(meeting => (
                        <MeetingItem
                            key={meeting.id}
                            meeting={meeting}
                            onView={() => openModal('view', meeting)}
                            onEdit={() => openModal('edit', meeting)}
                            onDelete={() => handleDeleteMeeting(meeting.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">No Meetings Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Click "New Meeting" to plan your first
                        week.</p>
                </div>
            )}

            <MeetingModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveMeeting}
                meeting={selectedMeeting}
                mode={modalMode}
                onModeChange={(newMode) => setModalMode(newMode)}
            />
        </div>
    );
};

export default WeeklyMeeting;
