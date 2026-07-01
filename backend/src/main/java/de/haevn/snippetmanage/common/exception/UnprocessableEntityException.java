package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>UnprocessableEntityException</h1>
 * This exception is thrown when a user sends a request that is valid but cannot be processed.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#UNPROCESSABLE_ENTITY}.
 */
public class UnprocessableEntityException extends ApplicationException {
    public UnprocessableEntityException() {
        super(HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public UnprocessableEntityException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

}
