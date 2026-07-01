package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>NotFoundException</h1>
 * This exception is thrown when a user tries to access a resource that does not exist.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#NOT_FOUND}.
 */
public class NotFoundException extends ApplicationException {
    public NotFoundException() {
        super(HttpStatus.NOT_FOUND);
    }

    public NotFoundException(final String columnNotFound) {
        super(columnNotFound, HttpStatus.NOT_FOUND);
    }
}
