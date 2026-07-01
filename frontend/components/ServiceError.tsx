// frontend/components/ServiceError.tsx
import React, {useEffect, useRef, useState} from 'react';
import {useBackendCheck} from '../contexts/BackendCheck';
import {PlugZap, Search, CloudOff, Snail, ShieldX, Fingerprint} from 'lucide-react';
import {
    BACKEND_UNAVAILABLE_EVENT,
    TO_MANY_REQUESTS_EVENT,
    NOT_FOUND_ERROR_EVENT,
    SERVER_ERROR_EVENT,
    AUTHORIZATION_ERROR_EVENT,
    BACKEND_OK_EVENT
} from "../services/IService.ts";

interface ServiceErrorProps {
    errorType?: string;
}

const messages: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
    [BACKEND_UNAVAILABLE_EVENT]: {
        icon: <CloudOff size={64}/>,
        title: 'Service not available',
        description: 'The backend service is currently unavailable. Try reconnecting to re-establish the connection.',
    },
    [TO_MANY_REQUESTS_EVENT]: {
        icon: <Snail size={64}/>,
        title: 'Too many requests',
        description: 'You or the server are sending too many requests. Please wait a moment and try again.',
    },
    [NOT_FOUND_ERROR_EVENT]: {
        icon: <Search size={64}/>,
        title: 'Resource not found',
        description: 'The requested resource could not be found on the server.',
    },
    [SERVER_ERROR_EVENT]: {
        icon: <ShieldX size={64}/>,
        title: 'Unexpected error',
        description: 'An unexpected error occurred. Try reconnecting or contact support if the issue persists.',
    },
    [AUTHORIZATION_ERROR_EVENT]: {
        icon: <Fingerprint size={64}/>,
        title: 'Authorization error',
        description: 'There was an authorization error. Please check your credentials or contact support.',
    },
    [BACKEND_OK_EVENT]: {
        icon: <PlugZap size={64}/>,
        title: 'No error',
        description: 'There is no error to display.',
    }
};

const ServiceError: React.FC<ServiceErrorProps> = ({errorType = BACKEND_UNAVAILABLE_EVENT}) => {
    const {checkBackend} = useBackendCheck();
    const fallback = messages[BACKEND_UNAVAILABLE_EVENT];
    const {icon, title, description} = messages[errorType] ?? fallback;

    const [disabled, setDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleReconnect = () => {
        if (disabled) return;

        setDisabled(true);
        setIsLoading(true);

        const maybePromise = checkBackend?.();

        if (maybePromise && typeof (maybePromise as Promise<unknown>).then === 'function') {
            (maybePromise as Promise<unknown>).finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }

        timeoutRef.current = window.setTimeout(() => {
            setDisabled(false);
            timeoutRef.current = null;
        }, 3000);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6">
            <div
                className="mb-4"
                style={{color: 'var(--primary, #2563eb)'}}
                aria-hidden
            >
                {icon}
            </div>

            <h1 className="text-xl font-bold ml-2 text-gray-800 dark:text-gray-100">{title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                {description}
            </p>

            <button
                type="button"
                onClick={handleReconnect}
                disabled={disabled}
                aria-disabled={disabled}
                aria-busy={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                ) : (
                    <PlugZap size={18} style={{color: 'inherit'}}/>
                )}
                <span>{isLoading ? 'Connecting...' : 'Reconnect'}</span>
            </button>
        </div>
    );
};

export default ServiceError;