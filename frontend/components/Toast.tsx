import React, {useEffect, useState} from 'react';
import {AlertCircle, CheckCircle, X} from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({message, type, onClose}) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onClose, 300); // Wait for exit animation
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle : AlertCircle;

    return (
        <div
            role="alert"
            className={`
        flex items-center p-4 rounded-lg shadow-lg text-white w-full max-w-xs
        ${isSuccess ? 'bg-green-500' : 'bg-red-500'}
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
        >
            <Icon className="h-5 w-5 mr-3 flex-shrink-0"/>
            <p className="text-sm font-medium flex-grow">{message}</p>
            <button
                onClick={handleClose}
                className="ml-3 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close notification"
            >
                <X className="h-4 w-4"/>
            </button>
        </div>
    );
};

export default Toast;
