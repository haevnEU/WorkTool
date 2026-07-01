package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>ConflictException</h1>
 * This exception is thrown when a user tries to create a resource that already exists.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#CONFLICT}.
 */
public class ConflictException extends ApplicationException {
    public ConflictException() {
        super(HttpStatus.CONFLICT);
    }

}
