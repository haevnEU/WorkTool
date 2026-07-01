package de.haevn.snippetmanage.fileshare;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import de.haevn.snippetmanage.common.exception.ApplicationException;
import de.haevn.snippetmanage.common.utils.DownloadUtils;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestApiController("/api/file_shares")
class FileShareController {
    private final FileShareService fileShareService;
    private final DownloadUtils downloadUtils;

    public FileShareController(final FileShareService fileShareService, DownloadUtils downloadUtils) {
        this.fileShareService = fileShareService;
        this.downloadUtils = downloadUtils;
    }

    @GetMapping
    @Operation(summary = "Gets all file shares' metadata")
    public List<FileShare> getAllFileShares() {
        return fileShareService.getAllFileShares();
    }

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Uploads a file via multipart/form-data (field name: `file`)")
    public List<String> uploadFileMultipart(@RequestPart("file") MultipartFile[] files) throws IOException {
        List<String> ids = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            ids.add(fileShareService.storeFile(file.getOriginalFilename(), file.getBytes()));
        }
        return ids;
    }

    @GetMapping("/download/{shortId}")
    @Operation(summary = "Downloads a file from the file share service")
    public ResponseEntity<Resource> downloadFile(@PathVariable String shortId) throws ApplicationException, IOException {
        var fs = fileShareService.getFile(shortId);
        return downloadUtils.download(fs.getData(), fs.getFilename(), DownloadUtils.FileType.BIN);
    }

    @DeleteMapping("/delete/{shortId}")
    @Operation(summary = "Deletes a file from the file share service")
    public void deleteFile(@PathVariable String shortId) {
        fileShareService.deleteFile(shortId);
    }
}
