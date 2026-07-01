package de.haevn.snippetmanage.common.utils;

import de.haevn.snippetmanage.common.exception.DownloadException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@Component
public class DownloadUtils {

    private final ZipUtils zipUtils;

    public DownloadUtils(ZipUtils zipUtils) {
        this.zipUtils = zipUtils;
    }

    public ResponseEntity<Resource> downloadFile(File filename, FileType fileType) {
        try {
            byte[] data = Files.readAllBytes(filename.toPath());
            return download(data, filename.getName(), fileType);
        } catch (IOException ignored) {
            throw new DownloadException(filename, fileType);
        }
    }

    public ResponseEntity<Resource> download(byte[] data, String fileName, FileType fileType) {
        final ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .header("x-filename", fileName)
                .header("x-filetype", fileType.mediaType)
                .header("x-fileextension", fileType.extension)
                .header("x-filesize", String.valueOf(data.length))
                .header("x-suprise", RandomUtils.generateRandomString())
                .contentLength(data.length)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    public ResponseEntity<Resource> downloadFilesAsZip(List<ZipUtils.ZipFile> pdfs, String filename) throws IOException {
        final byte[] zipBytes = zipUtils.zipZipFiles(pdfs);
        return download(zipBytes, filename, DownloadUtils.FileType.ZIP);
    }


    public enum FileType {
        ZIP("zip", "application/zip"),
        JSON("json", "application/json"),
        XML("xml", "application/xml"),
        TXT("txt", "text/plain"),
        IMG_PNG("png", "image/png"),
        IMG_JPG("jpg", "image/jpg"),
        IMG_JPEG("jpeg", "image/jpeg"),
        IMG_GIF("gif", "image/gif"),
        PDF("pdf", "application/pdf"),
        HTML("html", "text/html"),
        CSV("csv", "text/csv"),
        MD("md", "text/markdown"),
        BIN("bin", "application/octet-stream"),
        UNKNOWN("???", "???");

        final String extension;
        final String mediaType;

        FileType(final String ext, final String contentType) {
            this.extension = ext;
            this.mediaType = contentType;
        }

        @Override
        public String toString() {
            return mediaType + " (*." + extension + ")";
        }
    }
}
