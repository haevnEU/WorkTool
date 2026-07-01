package de.haevn.snippetmanage.common.utils.pdfv2;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

// ---------------------------------------------------------
// 7. Klasse: PdfDocument (Der Hauptcontainer)
// ---------------------------------------------------------
public class CustomPdfDocument {
    private List<PdfPage> pages = new ArrayList<>();
    private PdfMeta meta;

    public CustomPdfDocument(PdfMeta meta) {
        this.meta = meta;
    }

    public void addPage(PdfPage page) {
        this.pages.add(page);
    }

    public void save(String filename) throws IOException {
       final byte[] bytes = toBytes();
        Files.write(Path.of(filename), bytes);
    }

    public byte[] toBytes() throws IOException {
        try (PDDocument doc = new PDDocument()) {
            // Metadaten setzen
            if (meta != null) {
                PDDocumentInformation pdd = doc.getDocumentInformation();
                pdd.setTitle(meta.title);
                pdd.setAuthor(meta.author);
                pdd.setSubject(meta.subject);
                pdd.setKeywords(meta.keywords);
                pdd.setCreationDate(Calendar.getInstance());
            }

            // Seiten rendern
            for (PdfPage page : pages) {
                page.render(doc);
            }

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                doc.save(baos);
                return baos.toByteArray();
            }
        }
    }
}
