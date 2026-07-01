package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>UnauthorizedException</h1>
 * This exception is thrown when a user tries to access a resource without being authorized.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#UNAUTHORIZED}.
 */
public class UnauthorizedException extends ApplicationException {
    public UnauthorizedException() {
        super(HttpStatus.UNAUTHORIZED);
    }

}
