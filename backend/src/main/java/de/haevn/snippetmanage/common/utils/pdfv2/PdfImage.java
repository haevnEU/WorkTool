package de.haevn.snippetmanage.common.utils.pdfv2;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.awt.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class PdfImage implements IPdfObject {
    private float x, y, width, height;
    private String imagePath;

    public PdfImage(String imagePath, float x, float y, float width, float height) {
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    private void drawPlaceholder(PDPageContentStream contentStream, String msg) throws IOException {
        // Zeichnet ein graues Rechteck als Platzhalter
        contentStream.setNonStrokingColor(Color.LIGHT_GRAY);
        contentStream.addRect(x, y, width, height);
        contentStream.fill();

        contentStream.setNonStrokingColor(Color.RED);
        contentStream.beginText();
        contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.COURIER), 10);
        contentStream.newLineAtOffset(x + 5, y + (height/2));
        contentStream.showText("[" + msg + "]");
        contentStream.endText();
    }

    @Override public float getX() { return x; }
    @Override public float getY() { return y; }
    @Override public float getWidth() { return width; }
    @Override public float getHeight() { return height; }

    @Override
    public void render(PDDocument document, PDPageContentStream contentStream) throws IOException {
        try {
            // Versuchen das Bild zu laden
            if (Files.exists(Paths.get(imagePath))) {
                PDImageXObject pdImage = PDImageXObject.createFromFile(imagePath, document);
                contentStream.drawImage(pdImage, x, y, width, height);
            } else {
                drawPlaceholder(contentStream, "Bild nicht gef.");
            }
        } catch (Exception e) {
            drawPlaceholder(contentStream, "Error");
        }
    }
}