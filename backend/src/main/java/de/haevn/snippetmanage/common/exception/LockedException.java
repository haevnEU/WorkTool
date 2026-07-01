package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>LockedException</h1>
 * This exception is thrown when a user tries to access a resource that is locked.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#LOCKED}.
 */
public class LockedException extends ApplicationException {
    public LockedException() {
        super(HttpStatus.LOCKED);
    }
}
