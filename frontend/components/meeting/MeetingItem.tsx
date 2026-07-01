import React, {PointerEvent, useRef, useState} from 'react';
import {Calendar, Edit, Trash2} from 'lucide-react';
import {WeeklyMeetingModel} from "../../types/WeeklyMeetingModel.ts";

interface MeetingItemProps {
    meeting: WeeklyMeetingModel;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const SWIPE_THRESHOLD = 80; // pixels

const MeetingItem: React.FC<MeetingItemProps> = ({meeting, onView, onEdit, onDelete}) => {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const pointerStart = useRef(0);

    const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
        pointerStart.current = e.clientX;
        setIsDragging(true);
        try {
            itemRef.current?.setPointerCapture(e.pointerId);
        } catch (error) {
            console.warn("Pointer capture failed:", error);
        }
    };

    const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dragDistance = e.clientX - pointerStart.current;
        setDragX(dragDistance);
    };

    const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        try {
            itemRef.current?.releasePointerCapture(e.pointerId);
        } catch (error) {
            console.warn("Pointer release failed:", error);
        }

        if (dragX > SWIPE_THRESHOLD) {
            onDelete();
        } else if (dragX < -SWIPE_THRESHOLD) {
            onEdit();
        } else {
            const dragDistance = Math.abs(e.clientX - pointerStart.current);
            if (dragDistance < 5) { // Threshold for a click
                onView();
            }
        }
        setDragX(0);
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="relative rounded-lg overflow-hidden group w-full touch-none select-none">
            <div
                className="absolute inset-y-0 left-0 flex items-center justify-start pl-6 bg-red-500 text-white transition-opacity duration-300"
                style={{opacity: dragX > 0 ? Math.min(dragX / SWIPE_THRESHOLD, 1) : 0}}
            >
                <Trash2 className="h-5 w-5 mr-2"/>
                <span>Delete</span>
            </div>
            <div
                className="absolute inset-y-0 right-0 flex items-center justify-end pr-6 bg-blue-500 text-white transition-opacity duration-300"
                style={{opacity: dragX < 0 ? Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) : 0}}
            >
                <span>Edit</span>
                <Edit className="h-5 w-5 ml-2"/>
            </div>

            <div
                ref={itemRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative bg-white dark:bg-gray-800 p-4 shadow-md rounded-lg cursor-grab active:cursor-grabbing w-full"
                style={{
                    transform: `translateX(${dragX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
                }}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Week {meeting.weekNumber}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4"/>
                            {formatDate(meeting.startDate)} - {formatDate(meeting.endDate)}
                        </p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Created: {new Date(meeting.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MeetingItem;