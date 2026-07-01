package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>ToManyRequestException</h1>
 * This exception is thrown when a user sends to many requests in a given time frame.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#TOO_MANY_REQUESTS}.
 */
public class ToManyRequestException extends ApplicationException {
    public ToManyRequestException() {
        super(HttpStatus.TOO_MANY_REQUESTS);
    }

}
