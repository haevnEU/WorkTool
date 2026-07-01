package de.haevn.snippetmanage.common.utils.pdfv2;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public  class PdfPage {
    private List<IPdfObject> elements = new ArrayList<>();

    // Standard A4 Größe
    private float width = PDRectangle.A4.getWidth();
    private float height = PDRectangle.A4.getHeight();

    public void addObject(IPdfObject obj) {
        this.elements.add(obj);
    }

    /**
     * Generiert diese Seite und fügt sie dem PDFDocument hinzu.
     */
    public void render(PDDocument document) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        // Content Stream öffnen (try-with-resources schließt ihn automatisch)
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            for (IPdfObject obj : elements) {
                obj.render(document, contentStream);
            }
        }
    }
}