import React, {PointerEvent, useRef, useState} from 'react';
import {TimetableEntry} from '../types';
import {CirclePause, Trash2} from 'lucide-react';
import { timetableService } from '../services/TimetableService';

interface TimetableEntryProps {
    entry: TimetableEntry
    onStop: () => void;
    onDelete: () => void;
}

const SWIPE_THRESHOLD = 80; // pixels

const TimetableEntryItem: React.FC<TimetableEntryProps> = ({entry, onStop, onDelete }) => {
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
            onStop();
        } else if (dragX < -SWIPE_THRESHOLD) {
            onDelete();
        } else {
            // If not swiped far enough, check if it was a click/tap
            const dragDistance = Math.abs(e.clientX - pointerStart.current);
            if (dragDistance < 5) { // Threshold for a click
                // onView();
            }
        }
        setDragX(0);
    };


    const getSummary = () => {
        const content = entry.content || 'Hello World';
        const firstLine = content.split('\n')[0];
        return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
    }

    const getTime = () => {
        const start = entry.startTime;
        const end = entry.endTime;
        if(end < 0){
            return `Started at ${new Date(start).toLocaleTimeString()}`;
        }
        const durationMs = end - start;
        const durationHours = Math.floor(durationMs / 3600000);
        const durationMinutes = Math.floor((durationMs % 3600000) / 60000);
        const durationSeconds = Math.floor((durationMs % 60000) / 1000);
        return `Duration: ${durationHours}h ${durationMinutes}m ${durationSeconds}s`;
    }


    return (
        <div className="relative rounded-lg overflow-hidden group w-full touch-none select-none">
            <div
                className="absolute inset-y-0 left-0 flex items-center justify-start pl-6 bg-green-500 text-white transition-opacity duration-300"
                style={{opacity: dragX > 0 ? Math.min(dragX / SWIPE_THRESHOLD, 1) : 0}}
            >
                <CirclePause className="h-5 w-5 mr-2"/>
                <span>Stop</span>
            </div>
            <div
                className="absolute inset-y-0 right-0 flex items-center justify-end pr-6 bg-red-500 text-white transition-opacity duration-300"
                style={{opacity: dragX < 0 ? Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) : 0}}
            >
                <span>Delete</span>
                <Trash2 className="h-5 w-5 ml-2"/>
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
                <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{getSummary()}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm truncate mt-1">
                    {getTime()}
                </p>
            </div>
        </div>
    );
};

export default TimetableEntryItem;