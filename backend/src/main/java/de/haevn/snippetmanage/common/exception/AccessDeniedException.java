package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>AccessDeniedException</h1>
 * This exception is thrown when a user tries to access a resource they are not allowed to access.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#FORBIDDEN}.
 */
public class AccessDeniedException extends ApplicationException {
    public AccessDeniedException() {
        super(HttpStatus.FORBIDDEN);
    }
}
