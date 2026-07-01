package de.haevn.snippetmanage.common.exception;

import de.haevn.snippetmanage.common.utils.DownloadUtils;
import org.springframework.http.HttpStatus;

import java.io.File;

/**
 * <h1>AccessDeniedException</h1>
 * This exception is thrown when a user tries to access a resource they are not allowed to access.
 * It extends the {@link ApplicationException}.
 * The HTTP status code is set to {@link HttpStatus#FORBIDDEN}.
 */
public class DownloadException extends ApplicationException {
    public DownloadException() {
        super(HttpStatus.PRECONDITION_FAILED);
    }

    public DownloadException(final File filename, final DownloadUtils.FileType fileType) {
        super("Failed to download " + filename + " with file type " + fileType.toString(), HttpStatus.PRECONDITION_FAILED);
    }
}
