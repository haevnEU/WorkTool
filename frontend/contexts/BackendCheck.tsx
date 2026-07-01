// frontend/contexts/BackendCheck.tsx
import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import ServiceError from "../components/ServiceError.tsx";
import {
    IService,
    BACKEND_UNAVAILABLE_EVENT,
    SERVER_ERROR_EVENT,
    AUTHORIZATION_ERROR_EVENT,
    NOT_FOUND_ERROR_EVENT,
    TO_MANY_REQUESTS_EVENT,
    BACKEND_OK_EVENT
} from "../services/IService.ts";

type BackendCheckContextValue = {
    checkBackend: () => Promise<void>;
};

const BackendCheckContext = createContext<BackendCheckContextValue>({
    checkBackend: async () => {},
});
const service = new IService();

export const BackendCheckProvider = ({ children }: { children: ReactNode }) => {
    const [receivedEvent, setReceivedEvent] = useState<string | null>('');
    const checkBackend = async () => {
        await service.ping();
    };

    const recoverableEvents = [
        BACKEND_OK_EVENT
    ]

    useEffect(() => {
        void checkBackend();
    }, []);

    // --- ANGEPASSTER EVENT LISTENER ---
    useEffect(() => {

        const handleBackendError = (event: Event) => {
            setReceivedEvent(event.type);
        };

        // Registriere den EINEN Listener für MEHRERE Events
        const eventsToListenOn = [
            BACKEND_UNAVAILABLE_EVENT,
            SERVER_ERROR_EVENT,
            AUTHORIZATION_ERROR_EVENT,
            NOT_FOUND_ERROR_EVENT,
            TO_MANY_REQUESTS_EVENT,
            BACKEND_OK_EVENT
        ];

        eventsToListenOn.forEach(event =>
            window.addEventListener(event, handleBackendError)
        );

        // Aufräumen
        return () => {
            eventsToListenOn.forEach(event =>
                window.removeEventListener(event, handleBackendError)
            );
        };
    }, []);


    const isRecoverable = () => {
        return recoverableEvents.includes(receivedEvent);
    }


    return (
        <BackendCheckContext.Provider value={{ checkBackend }}>
            {isRecoverable() ? children : <ServiceError errorType={receivedEvent} />}
            {/*{children}*/}
        </BackendCheckContext.Provider>
    );
};

export const useBackendCheck = () => useContext(BackendCheckContext);