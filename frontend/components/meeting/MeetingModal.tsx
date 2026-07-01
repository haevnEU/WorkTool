import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Edit, FileText, Loader, Save, Share2, X} from 'lucide-react';
import {useToast} from '../../hooks/useToast.ts';
import {meetingService} from '../../services';
import TextAreaWithToolbar from '../TextAreaWithToolbar.tsx';
import {useClipboard} from "../../hooks/UseClipboard.ts";
import {downloadUtils} from "../../utils/DownloadUtils.ts";
import {WeeklyMeetingModel} from "../../types/WeeklyMeetingModel.ts";

type WritableMeeting = Omit<WeeklyMeetingModel, 'id' | 'createdAt'>;

interface MeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (meetingData: WritableMeeting) => Promise<void>;
    meeting: WeeklyMeetingModel | null;
    mode: 'view' | 'edit' | 'new';
    onModeChange: (mode: 'view' | 'edit' | 'new') => void;
}

// Helper to get ISO week number
const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};

const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
}

const MeetingModal: React.FC<MeetingModalProps> = ({isOpen, onSave, onClose, meeting, mode, onModeChange}) => {
    const [formData, setFormData] = useState<Omit<WritableMeeting, 'weekNumber' | 'endDate'>>({
        startDate: '', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', other: ''
    });
    const [derivedData, setDerivedData] = useState({weekNumber: 0, endDate: ''});
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [dateError, setDateError] = useState<string | null>(null);
    const {showToast} = useToast();
    const {copy} = useClipboard();

    const modalRef = useRef<HTMLDivElement>(null);

    const updateDateCalculations = useCallback((startDateString: string) => {
        if (!startDateString) {
            setDerivedData({weekNumber: 0, endDate: ''});
            setDateError(null);
            return;
        }

        const date = new Date(startDateString);
        // Note: getDay() is Sunday-based, getUTCDay() is what we need for consistency
        const dayOfWeek = date.getUTCDay();

        if (dayOfWeek !== 2) { // 2 = Tuesday
            setDateError('Start date must be a Tuesday.');
            setDerivedData({weekNumber: 0, endDate: ''});
        } else {
            setDateError(null);
            const endDate = new Date(date);
            endDate.setUTCDate(date.getUTCDate() + 6); // End date is 6 days after (next Monday)
            setDerivedData({
                weekNumber: getWeekNumber(date),
                endDate: endDate.toISOString()
            });
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (meeting) {
                setFormData({
                    startDate: meeting.startDate,
                    monday: meeting.monday,
                    tuesday: meeting.tuesday,
                    wednesday: meeting.wednesday,
                    thursday: meeting.thursday,
                    friday: meeting.friday,
                    other: meeting.other,
                });
                updateDateCalculations(meeting.startDate);
            } else {
                // Default to nearest upcoming Tuesday for new entries
                const today = new Date();
                const day = today.getDay();
                const offset = (2 - day + 7) % 7; // days to next Tuesday
                const nextTuesday = new Date(today.setDate(today.getDate() + offset));
                const startDate = nextTuesday.toISOString().split('T')[0];

                setFormData({
                    startDate: new Date(startDate).toISOString(),
                    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', other: ''
                });
                updateDateCalculations(new Date(startDate).toISOString());
            }
        }
    }, [meeting, isOpen, updateDateCalculations]);

    const handleInputChange = (name: keyof WritableMeeting, value: string) => {
        const newFormData = {...formData, [name]: value};
        if (name === "startDate") {
            const utcDate = new Date(value);
            newFormData.startDate = utcDate.toISOString();
            updateDateCalculations(newFormData.startDate);
        }
        setFormData(newFormData);
    };

    const handleSave = async () => {
        if (dateError) return;
        setIsSaving(true);
        await onSave({...formData, ...derivedData});
        setIsSaving(false);
    };

    const handleShare = async () => {
        if (!meeting) return;
        const shareUrl = `${window.location.origin}/#/fileShare/meeting/${meeting.id}`;
        const copied = await copy(shareUrl);
        if (copied) {
            showToast('Code copied to clipboard!', 'success');
        } else {
            showToast('Failed to copy code.', 'error');
        }
    };

    const handleExport = async () => {
        if (!meeting) return;
        setIsExporting(true);
        try {
            const pdfBlob = await meetingService.exportMeetingToPdf(meeting.id);
            await downloadUtils.downloadContent(pdfBlob, `Weekly-Meeting-Week-${meeting.weekNumber}.pdf`);
            showToast('PDF export started!', 'success');
        } catch (error) {
            showToast('Failed to export PDF.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleClose = useCallback(() => {
        if (!isSaving) onClose();
    }, [isSaving, onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]);

    if (!isOpen) return null;
    const isReadOnly = mode === 'view';
    const dayFields: (keyof Omit<WritableMeeting, 'startDate'>)[] = ['tuesday', 'wednesday', 'thursday', 'friday', 'monday', 'other'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
             onClick={(e) => {
                 if (modalRef.current && !modalRef.current.contains(e.target as Node)) handleClose()
             }}>
            <div ref={modalRef}
                 className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">
                        {mode === 'new' && 'New Weekly Meeting'}
                        {mode === 'edit' && `Edit Week ${derivedData.weekNumber}`}
                        {mode === 'view' && `View Week ${derivedData.weekNumber}`}
                    </h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Close"><X className="h-6 w-6"/></button>
                </header>

                <main className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div>
                            <label htmlFor="startDate"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start
                                Date</label>
                            <input type="date" id="startDate" name="startDate"
                                   value={formatDateForInput(formData.startDate)}
                                   onChange={(e) => handleInputChange('startDate', e.target.value)}
                                   readOnly={isReadOnly}
                                   className={`mt-1 block w-full input ${isReadOnly ? 'input-readonly' : 'input-editable'}`}/>
                            {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Week
                                Number</label>
                            <p className="mt-1 h-10 flex items-center px-3 text-gray-600 dark:text-gray-400">{derivedData.weekNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End
                                Date</label>
                            <p className="mt-1 h-10 flex items-center px-3 text-gray-600 dark:text-gray-400">{derivedData.endDate ? new Date(derivedData.endDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                    {dayFields.map(day => (
                        <div key={day}>
                            <label htmlFor={day}
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{day}</label>
                            <TextAreaWithToolbar
                                id={day}
                                value={String(formData[day])}
                                onChange={(value) => handleInputChange(day, value)}
                                readOnly={isReadOnly}
                                rows={3}
                            />
                        </div>
                    ))}
                </main>

                <footer className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        {meeting && (
                            <div className="flex items-center space-x-2">
                                <button onClick={handleShare} className="btn-secondary-icon" aria-label="Share meeting">
                                    <Share2 className="h-4 w-4"/><span>Share</span></button>
                                <button onClick={handleExport} disabled={isExporting} className="btn-secondary-icon"
                                        aria-label="Export to PDF">
                                    {isExporting ? <Loader className="animate-spin h-4 w-4"/> :
                                        <FileText className="h-4 w-4"/>}
                                    <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        {mode === 'view' ? (
                            <>
                                <button onClick={handleClose} className="btn-secondary">Close</button>
                                <button onClick={() => onModeChange('edit')}
                                        className="btn-primary inline-flex items-center gap-2"><Edit
                                    className="h-4 w-4"/>Edit
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleClose} disabled={isSaving} className="btn-secondary">Cancel
                                </button>
                                <button onClick={handleSave} disabled={isSaving || !!dateError || !formData.startDate}
                                        className="btn-primary inline-flex items-center gap-2">
                                    {isSaving ? <Loader className="animate-spin h-5 w-5"/> :
                                        <Save className="h-4 w-4"/>}
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </>
                        )}
                    </div>
                </footer>
                <style>{`
          .input { border-radius: 0.375rem; padding: 0.5rem 0.75rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
          .input-editable { border: 1px solid; border-color: #D1D5DB; background-color: white; }
          .dark .input-editable { border-color: #4B5563; background-color: #1F2937; }
          .input-editable:focus { outline: 2px solid transparent; outline-offset: 2px; ring: 2px; ring-offset-2px; border-color: hsl(210, 40%, 50%); ring-color: hsl(210, 40%, 50%); }
          .input-readonly { background-color: #F3F4F6; border: 1px solid #E5E7EB; }
          .dark .input-readonly { background-color: rgb(55 65 81 / 0.5); border-color: #4B5563; }
          .btn-primary { padding: 0.5rem 1rem; font-medium text-sm text-white bg-primary rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed }
          .btn-secondary { padding: 0.5rem 1rem; font-medium text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 }
          .btn-secondary-icon { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; font-medium text-sm text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 }
        `}</style>
            </div>
        </div>
    );
};

export default MeetingModal;
