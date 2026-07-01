package de.haevn.snippetmanage.xml;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import de.haevn.snippetmanage.common.exception.BadRequestException;
import de.haevn.snippetmanage.common.exception.InternalServerErrorException;
import de.haevn.snippetmanage.common.utils.ZipUtils;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.JAXBException;
import jakarta.xml.bind.Marshaller;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ValidationService {

    private final ValidationSchemaPdfGeneratorV2 generator;
    private final ValidationSchemaPdfGenerator generatorNew;

    public ValidationService(ValidationSchemaPdfGeneratorV2 generatorV2, ValidationSchemaPdfGenerator generatorNew) {
        this.generator = generatorV2;
        this.generatorNew = generatorNew;
    }

    public static String marshalToString(Object obj) throws JAXBException {
        if (obj == null) return "";
        JAXBContext ctx = JAXBContext.newInstance(obj.getClass());
        Marshaller marshaller = ctx.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        StringWriter sw = new StringWriter();
        marshaller.marshal(obj, sw);
        return sw.toString();
    }


    public List<ZipUtils.ZipFile> generateDocumentation(List<MultipartFile> files) {
        List<ZipUtils.ZipFile> zipFiles = new ArrayList<>();
        final List<String> failedFiles = new ArrayList<>();
        final XmlMapper mapper = new XmlMapper();
        for (MultipartFile file : files) {
            try {
                final ValidationSchema schema = mapper.readValue(file.getBytes(), ValidationSchema.class);
                final byte[] data = generatorNew.createDocumentationAsBytes(schema);
                zipFiles.add(new ZipUtils.ZipFile(data, schema.getSchemaName() + "_documentation.pdf"));
            } catch (IOException e) {
                failedFiles.add(file.getOriginalFilename());
            }
        }

        if(!failedFiles.isEmpty()){
            // java
            final long count = failedFiles.size();
            final long total = files.size();
            final long success = total - count;
            final long failure = count;
            final long successRate = (total == 0) ? 0 : (success * 100) / total;
            final long failureRate = (total == 0) ? 0 : (failure * 100) / total;
            final long timestamp = System.currentTimeMillis();
            final String serverTimeUtc = java.time.Instant.ofEpochMilli(timestamp)
                    .atZone(java.time.ZoneOffset.UTC)
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'"));

            StringBuilder sb = new StringBuilder();
            sb.append("The Server encountered one or multiple error during the process.").append("\n")
                    .append("Server time: ").append(serverTimeUtc).append("\n")
                    .append("Timestamp: ").append(timestamp).append("\n")
                    .append("Total files: ").append(total).append("\n")
                    .append("Successful: ").append(success).append(" (").append(successRate).append("%)").append("\n")
                    .append("Failed: ").append(failure).append(" (").append(failureRate).append("%)").append("\n\n")
                    .append("This could be due to invalid XML format or other errors, please verify the following files:\n\n")
                    .append(String.join("\n", failedFiles));

            String data = sb.toString();
            zipFiles.add(new ZipUtils.ZipFile(data.getBytes(), "failed_files.txt"));
        }

        return zipFiles;
    }

    public Optional<byte[]> generateDocumentation(ValidationSchema schema) {
        try {
            byte[] data = generatorNew.createDocumentationAsBytes(schema);
            return Optional.of(data);
        } catch (IOException e) {
            throw new InternalServerErrorException(e);
        }

    }

    public String generateSchemaString(ValidationSchema schema) {
        try {
            return marshalToString(schema);
        } catch (JAXBException e) {
            throw new BadRequestException(e.getMessage());
        }
    }
}
