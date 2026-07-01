package de.haevn.snippetmanage.common.utils.pdfv2;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import java.io.IOException;

public interface IPdfObject {
    float getX();
    float getY();
    float getWidth();
    float getHeight();
    void render(PDDocument document, PDPageContentStream contentStream) throws IOException;
}
