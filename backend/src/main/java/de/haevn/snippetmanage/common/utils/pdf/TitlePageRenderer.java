package de.haevn.snippetmanage.common.utils.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Zeichnet die Titelseite.
 * (Interne Hilfsklasse für PdfDocument)
 */
class TitlePageRenderer {

    // Schriftarten und Größen
    private static final PDType1Font FONT_BOLD = PageCanvas.FONT_BOLD;
    private static final PDType1Font FONT_NORMAL = PageCanvas.FONT_NORMAL;
    private static final float FONT_SIZE_TITLE = 24;
    private static final float FONT_SIZE_INFO_LABEL = 12;
    private static final float FONT_SIZE_INFO_VALUE = 12;
    private static final float LINE_HEIGHT_INFO = 20;
    private static final float MARGIN = 50;

    /**
     * Zeichnet die Titelseite auf eine neue Seite im Dokument.
     *
     * @param document Das Zieldokument
     * @param title    Der Haupttitel
     * @param info     Die Key-Value-Paare
     * @throws IOException Wenn das Zeichnen fehlschlägt
     */
    static void draw(PDDocument document, String title, Map<String, String> info) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        float width = page.getMediaBox().getWidth();
        float height = page.getMediaBox().getHeight();

        try (PDPageContentStream cs = new PDPageContentStream(document, page)) {

            // --- 1. Titel (Zentriert) ---
            cs.setFont(FONT_BOLD, FONT_SIZE_TITLE);
            String safeTitle = sanitize(title);
            float titleWidth = FONT_BOLD.getStringWidth(safeTitle) / 1000 * FONT_SIZE_TITLE;
            float titleX = (width - titleWidth) / 2;
            float titleY = height - 150; // Oben zentriert

            cs.beginText();
            cs.newLineAtOffset(titleX, titleY);
            cs.showText(safeTitle);
            cs.endText();

            // --- 2. Info-Block (Key-Value-Paare) ---
            float y = titleY - 80; // Startposition unter dem Titel
            float x_label = MARGIN + 50;
            float x_value = x_label + 170; // Position für die Werte
            float valueMaxWidth = width - x_value - MARGIN; // Max. Breite für umgebrochene Werte

            if (info != null && !info.isEmpty()) {
                for (Map.Entry<String, String> entry : info.entrySet()) {
                    String key = sanitize(entry.getKey());
                    String value = sanitize(entry.getValue());

                    // Label (Key) zeichnen
                    cs.setFont(FONT_BOLD, FONT_SIZE_INFO_LABEL);
                    cs.beginText();
                    cs.newLineAtOffset(x_label, y);
                    cs.showText(key);
                    cs.endText();

                    // --- KORREKTUR: Wert(e) mit Textumbruch zeichnen ---
                    cs.setFont(FONT_NORMAL, FONT_SIZE_INFO_VALUE);

                    // Text umbrechen
                    List<String> lines = wrapText(value, valueMaxWidth, FONT_NORMAL, FONT_SIZE_INFO_VALUE);

                    float currentY = y;
                    for (String line : lines) {
                        cs.beginText();
                        cs.newLineAtOffset(x_value, currentY);
                        cs.showText(line);
                        cs.endText();
                        currentY -= LINE_HEIGHT_INFO; // Gehe für die *nächste* Zeile nach unten
                    }

                    // Passe die Y-Position für das *nächste* Label an
                    // (Anzahl der Zeilen * Zeilenhöhe)
                    y -= (lines.size() * LINE_HEIGHT_INFO);
                    // --- ENDE KORREKTUR ---
                }
            }
        }
    }

    /**
     * Bereinigt Text von Zeilenumbrüchen.
     */
    private static String sanitize(String text) {
        if (text == null) return "N/A";
        return text.replaceAll("\\r\\n|\\r|\\n", " ");
    }

    // --- HELPER-METHODEN (Kopiert aus PdfBoxDinA4Generator) ---

    /**
     * Bricht einen langen Text in mehrere Zeilen um, damit er in eine Breite passt.
     */
    private static List<String> wrapText(String text, float maxWidth, PDType1Font font, float fontSize) throws IOException {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            lines.add("");
            return lines;
        }

        String sanitizedText = text.replaceAll("\\r\\n|\\r|\\n", " ");
        String[] words = sanitizedText.split(" ");
        StringBuilder line = new StringBuilder();

        for (String word : words) {
            if (word.isEmpty()) continue;

            float wordWidth = font.getStringWidth(word) / 1000 * fontSize;
            float lineWidth = font.getStringWidth(line.toString()) / 1000 * fontSize;

            if (wordWidth > maxWidth) {
                String tempWord = word;
                while (!tempWord.isEmpty()) {
                    int breakIndex = findBreakIndex(tempWord, maxWidth, font, fontSize);
                    String part = tempWord.substring(0, breakIndex);

                    if (line.length() > 0) {
                        lines.add(line.toString());
                        line = new StringBuilder(part);
                    } else {
                        lines.add(part);
                    }
                    tempWord = tempWord.substring(breakIndex);
                }
            } else if (lineWidth + wordWidth < maxWidth) {
                if (line.length() > 0) line.append(" ");
                line.append(word);
            } else {
                lines.add(line.toString());
                line = new StringBuilder(word);
            }
        }
        lines.add(line.toString());
        return lines;
    }

    /**
     * Hilfsfunktion für wrapText: Findet den Umbruchpunkt in einem zu langen Wort.
     */
    private static int findBreakIndex(String word, float maxWidth, PDType1Font font, float fontSize) throws IOException {
        int i = 0;
        float width = 0;
        while (i < word.length()) {
            char c = word.charAt(i);
            float charWidth = font.getStringWidth(String.valueOf(c)) / 1000 * fontSize;
            if (width + charWidth > maxWidth) {
                break;
            }
            width += charWidth;
            i++;
        }
        return Math.max(1, i); // Mindestens 1 Zeichen zurückgeben
    }
}