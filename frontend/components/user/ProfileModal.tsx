import React, {useEffect, useRef} from 'react';
import {Mail, User as UserIcon, X} from 'lucide-react';
import {useUser} from "../../contexts/UserContext.tsx";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({isOpen, onClose}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                style={{animationFillMode: 'forwards'}}
            >
                <div className="relative p-8 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Close modal"
                    >
                        <X className="h-6 w-6 text-gray-500 dark:text-gray-400"/>
                    </button>

                    {user ? (
                        <>
                            <img
                                src={`/api/user/${user.email}/picture`}
                                alt="Profile"
                                className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-primary shadow-lg"
                            />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">"{user.motto}"</p>

                            <div className="text-left mt-6 space-y-4">
                                <div className="flex items-center text-gray-700 dark:text-gray-300">
                                    <UserIcon className="h-5 w-5 mr-3 text-primary"/>
                                    <span>{"Developer"}</span>
                                </div>
                                <div className="flex items-center text-gray-700 dark:text-gray-300">
                                    <Mail className="h-5 w-5 mr-3 text-primary"/>
                                    <span>{user.email}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="animate-pulse">
                            <div className="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto mb-4"></div>
                            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-3/4 mx-auto"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 mx-auto mt-2"></div>
                            <div className="mt-6 space-y-4">
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-full"></div>
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-full"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
        @keyframes fade-in-scale {
            from {
                transform: scale(0.95);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
      `}</style>
        </div>
    );
};

export default ProfileModal;
