package de.haevn.snippetmanage.common.config;

import de.haevn.snippetmanage.common.exception.ApplicationException;
import de.haevn.snippetmanage.els.exception.ElsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;


/**
 * <h1>GlobalExceptionHandler</h1>
 * This class handles all exceptions thrown by the application and returns a proper response.
 * It is annotated with {@link ControllerAdvice} to make it available to all controllers.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * <h2>buildResponse({@link HttpStatus}, {@link String}, {@link Object})</h2>
     * This is an internal method to build a response entity with the given status, message and data.
     *
     * @param status  The HTTP status of the response.
     * @param message The message of the response.
     * @param data    The data of the response.
     * @return A {@link ResponseEntity} containing the {@link Map} with the given status, message and data.
     */
    private ResponseEntity<Map<String, ?>> buildResponse(final HttpStatus status, final String message, final Object data) {
        Map<String, Object> body = new HashMap<>();

        if (message != null) {
            body.put("message", message);
        }
        if (data != null) {
            body.put("data", data);
        }
        body.put("status", status.value());

        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(ElsException.class)
    public ResponseEntity<Map<String, ?>> handleElsException(final ElsException e) {
        return buildResponse(e.getStatus(), e.getMessage(), e.getErrors());
    }

    /**
     * <h2>handleApplicationException({@link ApplicationException})</h2>
     * This method handles all {@link ApplicationException}s thrown by the application and returns a proper response.
     *
     * @param e The {@link ApplicationException} that was thrown.
     * @return A {@link ResponseEntity} containing the {@link Map} with the status of the exception and the message of the exception.
     */
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<Map<String, ?>> handleApplicationException(final ApplicationException e) {
        return buildResponse(e.getStatus(), e.getMessage(), e.getData());
    }


    /**
     * <h2>handleException({@link Exception})</h2>
     * This method handles all exceptions thrown by the application and returns a proper response.
     *
     * @param e The exception that was thrown.
     * @return A {@link ResponseEntity} containing the {@link Map} with the status 500 and the message of the exception.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, ?>> handleException(final Exception e) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), null);
    }
}
