package de.haevn.snippetmanage.common.utils.pdfv2;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.awt.*;
import java.io.IOException;

public class PdfText implements IPdfObject {
    private float x, y;
    private String text;
    private int fontSize;
    private Color color;
    private boolean centered;
    private float pageWidth = PDRectangle.A4.getWidth();

    // Standard: Links bündig an X
    public PdfText(String text, float x, float y, int fontSize, Color color) {
        this(text, x, y, fontSize, color, false);
    }

    // Zentriert (X wird ignoriert)
    public PdfText(String text, float y, int fontSize, Color color) {
        this(text, 0, y, fontSize, color, true);
    }

    private PdfText(String text, float x, float y, int fontSize, Color color, boolean centered) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.color = color;
        this.centered = centered;
    }

    @Override
    public void render(PDDocument document, PDPageContentStream contentStream) throws IOException {
        PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

        // Sanitize Text: PDFBox kann \n oder \r nicht in showText rendern -> Crash
        String cleanText = text.replace("\n", " ").replace("\r", " ").replace("\t", " ");


        float drawX = x;

        if (centered) {
            try {
                float textWidth = font.getStringWidth(text) / 1000 * fontSize;
                drawX = (pageWidth - textWidth) / 2;
            } catch (IllegalArgumentException e) {
                drawX = (pageWidth) / 2;
            }
        }

        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.setNonStrokingColor(color);
        contentStream.newLineAtOffset(drawX, y);
        contentStream.showText(cleanText);
        contentStream.endText();
    }

    @Override public float getX() { return x; }
    @Override public float getY() { return y; }
    @Override public float getWidth() { return 0; }
    @Override public float getHeight() { return fontSize; }
}
