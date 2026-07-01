package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>BadRequestException</h1>
 * This exception is thrown when a user sends a request that is not valid.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#BAD_REQUEST}.
 */
public class InternalServerErrorException extends ApplicationException {
    public InternalServerErrorException() {
        super(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public InternalServerErrorException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public InternalServerErrorException(Throwable e) {
        this(e.getMessage(), e);
    }

    public InternalServerErrorException(String message, Throwable e) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, e);
    }
}
