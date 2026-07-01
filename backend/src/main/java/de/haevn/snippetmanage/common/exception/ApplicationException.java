package de.haevn.snippetmanage.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.io.Serializable;

/**
 * <h1>ApplicationException</h1>
 * This class extends the {@link RuntimeException} and is used to throw exceptions with a status code and a message.<br>
 * The {@link info.hausheld.user_service_backend.config.GlobalExceptionHandler GlobalExceptionHandler} will catch
 * this and its subclasses and return a response with the status code and message.
 */
@Getter
public class ApplicationException extends RuntimeException implements Serializable {
    private final HttpStatus status;
    private final Serializable data;

    /**
     * <h2>ApplicationException(int)</h2>
     * Calls {@link ApplicationException#ApplicationException(HttpStatus)} with the status code.
     *
     * @param status The status code of the exception.
     */
    public ApplicationException(final int status) {
        this(HttpStatus.valueOf(status));
    }

    /**
     * <h2>ApplicationException(HttpStatus)</h2>
     * Creates a new instance of the {@link ApplicationException} with the status code.
     *
     * @param status The status code of the exception.
     */
    public ApplicationException(final HttpStatus status) {
        this.status = status;
        this.data = null;
    }

    /**
     * <h2>ApplicationException(String)</h2>
     * Calls {@link ApplicationException#ApplicationException(String, HttpStatus)} with the message and
     * {@link HttpStatus#INTERNAL_SERVER_ERROR} as status code.
     *
     * @param message The message of the exception.
     */
    public ApplicationException(final String message) {
        this(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * <h2>ApplicationException(String, HttpStatus)</h2>
     * Calls {@link ApplicationException#ApplicationException(String, HttpStatus, Serializable)} with the message, status code and null as data.
     *
     * @param message The message of the exception.
     * @param status  The status code of the exception.
     */
    public ApplicationException(final String message, final HttpStatus status) {
        this(message, status, null);
    }

    /**
     * <h2>ApplicationException(String, {@link Throwable})</h2>
     * Creates a new instance of the {@link ApplicationException} with the message and cause.
     *
     * @param message The message of the exception.
     * @param cause   The cause of the exception.
     */
    public ApplicationException(final String message, final Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
        this.data = null;
    }

    /**
     * <h2>ApplicationException(String, HttpStatus, Serializable)</h2>
     * Creates a new instance of the {@link ApplicationException} with the message, status code and data.
     *
     * @param message The message of the exception.
     * @param status  The status code of the exception.
     * @param data    The data of the exception.
     */
    public ApplicationException(final String message, final HttpStatus status, final Serializable data) {
        super(message);
        this.status = status;
        this.data = data;
    }

    public ApplicationException(String reason, Throwable cause, HttpStatus httpStatus) {
        super(reason, cause);
        this.status = httpStatus;
        this.data = null;
    }
}
