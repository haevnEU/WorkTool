import React, {PointerEvent, useRef, useState} from 'react';
import {Edit, Trash2} from 'lucide-react';
import {CodeSnippetModel} from "../../types/CodeSnippetModel.ts";

interface SnippetItemProps {
    snippet: CodeSnippetModel;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const SWIPE_THRESHOLD = 80; // pixels

const SnippetItem: React.FC<SnippetItemProps> = ({snippet, onView, onEdit, onDelete}) => {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const pointerStart = useRef(0);

    const getSnippetTitle = () => {
        if (snippet.title) return snippet.title;
        if (snippet.code.length > 61) {
            return `${snippet.code.substring(0, 61)}...`;
        }
        return snippet.code;
    };

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

    const formatDateTime = (isoString: string) => {
        return new Date(isoString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
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
                <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{getSnippetTitle()}</h3>
                <div className="flex items-center gap-2 mt-2">
                <span
                    className="px-2 py-0.5 text-xs font-semibold text-primary-700 bg-primary-100 dark:text-primary-200 dark:bg-primary-900 rounded-full">
                    {snippet.language}
                </span>

                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Created: {formatDateTime(snippet.createdAt)}
                </p>
            </div>
        </div>
    );
};

export default SnippetItem;