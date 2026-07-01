package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>BadRequestException</h1>
 * This exception is thrown when a user sends a request that is not valid.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#BAD_REQUEST}.
 */
public class BadRequestException extends ApplicationException {
    public BadRequestException() {
        super(HttpStatus.BAD_REQUEST);
    }

    public BadRequestException(String reason) {
        super(reason, HttpStatus.BAD_REQUEST);
    }

    public BadRequestException(String reason, Throwable cause) {
        super(reason, cause, HttpStatus.BAD_REQUEST);
    }
}
