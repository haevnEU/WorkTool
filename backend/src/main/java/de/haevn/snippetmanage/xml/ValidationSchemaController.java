package de.haevn.snippetmanage.xml;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import de.haevn.snippetmanage.common.annotation.RestApiController;
import de.haevn.snippetmanage.common.utils.DownloadUtils;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestApiController("/api/validation-schema")
public class ValidationSchemaController {

    private final DownloadUtils downloadUtils;
    private final ValidationService validationService;

    public ValidationSchemaController(DownloadUtils downloadUtils, ValidationService validationService) {
        this.downloadUtils = downloadUtils;
        this.validationService = validationService;
    }

    @PostMapping(path = "/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Uploads a file via multipart/form-data (field name: `file`)")

    public ResponseEntity<Resource> getPDF(@RequestPart("file") MultipartFile[] files) throws JsonProcessingException {
        // map body to ValidationSchema

        List<MultipartFile> fileList = List.of(files);
        if (fileList.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (fileList.size() == 1) {
                final MultipartFile file = fileList.getFirst();
                final XmlMapper mapper = new XmlMapper();
                final ValidationSchema schema = mapper.readValue(file.getBytes(), ValidationSchema.class);
                final var pdf = validationService.generateDocumentation(schema).orElseThrow(InternalError::new);
                return downloadUtils.download(pdf, schema.getSchemaName() + "_documentation.pdf", DownloadUtils.FileType.PDF);
            } else {
                final var pdfs = validationService.generateDocumentation(fileList);
                return downloadUtils.downloadFilesAsZip(pdfs, "validation_schemas_documentation.zip");
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(path = "/create")
    @Operation(summary = "Uploads a file via multipart/form-data (field name: `file`)")
    public ResponseEntity<Resource> validateSchema(@RequestBody ValidationSchema schema) {
        String xml = validationService.generateSchemaString(schema);
        return downloadUtils.download(xml.getBytes(), schema.getSchemaName() + ".xml", DownloadUtils.FileType.XML);
    }
}
