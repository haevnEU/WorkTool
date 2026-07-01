package de.haevn.snippetmanage.common.exception;

import org.springframework.http.HttpStatus;

/**
 * <h1>AlreadyReportedException</h1>
 * This exception is thrown when a user tries to report a resource that has already been reported.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#ALREADY_REPORTED}.
 */
public class AlreadyReportedException extends ApplicationException {
    public AlreadyReportedException() {
        super(HttpStatus.ALREADY_REPORTED);
    }

    public AlreadyReportedException(final String message) {
        super(message, HttpStatus.ALREADY_REPORTED);
    }
}
