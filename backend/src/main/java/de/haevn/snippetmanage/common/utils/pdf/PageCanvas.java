package de.haevn.snippetmanage.common.utils.pdf;


import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.awt.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Repräsentiert eine einzelne Seite ("Leinwand") zum Zeichnen.
 * Implementiert AutoCloseable, um den PDPageContentStream zu schließen.
 */
public class PageCanvas implements AutoCloseable {

    // --- Öffentliche Konstanten für Schriftarten ---
    public static final PDType1Font FONT_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    public static final PDType1Font FONT_NORMAL = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    public static final PDType1Font FONT_OBLIQUE = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);
    public static final PDType1Font FONT_CODE = new PDType1Font(Standard14Fonts.FontName.COURIER);

    // --- Tabellen-Konstanten ---
    private static final float FONT_SIZE_TABLE_HEADER = 8;
    private static final float FONT_SIZE_TABLE_BODY = 8;
    private static final float TABLE_ROW_MIN_HEIGHT = 15;
    private static final float TABLE_LINE_HEIGHT = 10; // Für umgebrochenen Text
    private static final float CELL_PADDING = 5;

    private final PDDocument document;
    private final PDPageContentStream contentStream;
    private final PDRectangle mediaBox;

    /**
     * Erstellt eine neue Zeichenleinwand für eine Seite.
     * (Wird intern von PdfDocument aufgerufen)
     */
    PageCanvas(PDDocument document, PDPage page) throws IOException {
        this.document = document;
        this.mediaBox = page.getMediaBox();
        this.contentStream = new PDPageContentStream(document, page);
    }

    // --- ÖFFENTLICHE ZEICHENMETHODEN ---

    /**
     * Zeichnet einen Text-String.
     */
    public void drawText(float x, float y, String text, PDType1Font font, float fontSize, Color color) throws IOException {
        if (text == null) return;
        String sanitizedText = text.replaceAll("\\r\\n|\\r|\\n", " ");

        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.setNonStrokingColor(color);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(sanitizedText);
        contentStream.endText();
        contentStream.setNonStrokingColor(Color.BLACK); // Zurücksetzen
    }

    /**
     * Zeichnet ein gefülltes Rechteck.
     */
    public void drawRectangle(float x, float y, float width, float height, Color color) throws IOException {
        contentStream.setNonStrokingColor(color);
        contentStream.addRect(x, y, width, height);
        contentStream.fill();
        contentStream.setNonStrokingColor(Color.BLACK); // Zurücksetzen
    }

    /**
     * Zeichnet einen gefüllten Kreis.
     */
    public void drawCircle(float cx, float cy, float r, Color color) throws IOException {
        final float k = 0.552284749831f;

        contentStream.setNonStrokingColor(color);
        contentStream.moveTo(cx - r, cy);
        contentStream.curveTo(cx - r, cy + k * r, cx - k * r, cy + r, cx, cy + r);
        contentStream.curveTo(cx + k * r, cy + r, cx + r, cy + k * r, cx + r, cy);
        contentStream.curveTo(cx + r, cy - k * r, cx + k * r, cy - r, cx, cy - r);
        contentStream.curveTo(cx - k * r, cy - r, cx - r, cy - k * r, cx - r, cy);
        contentStream.fill();
        contentStream.setNonStrokingColor(Color.BLACK); // Zurücksetzen
    }

    /**
     * Zeichnet einen Textblock mit Hintergrund, ideal für Code oder Notizen.
     */
    public void drawCode(float x, float yTop, String text, float width, Color bgColor) throws IOException {
        if (text == null) return;

        float padding = 5;
        float lineHeight = 12;
        float fontSize = 9;

        List<String> lines = getLines(text, width - padding * 2, FONT_CODE, fontSize);

        float height = lines.size() * lineHeight + padding * 2;
        float yBottom = yTop - height;
        drawRectangle(x, yBottom, width, height, bgColor);

        float textY = yTop - padding - lineHeight + 2;

        contentStream.setFont(FONT_CODE, fontSize);
        contentStream.setNonStrokingColor(Color.BLACK);

        float textX = x + padding;
        for (String line : lines) {
            contentStream.beginText();
            contentStream.newLineAtOffset(textX, textY);
            contentStream.showText(line);
            contentStream.endText();
            textY -= lineHeight;
        }
    }

    /**
     * Zeichnet ein Bild.
     */
    public void drawImage(float x, float y, byte[] imageBytes, float width, float height) throws IOException {
        PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, imageBytes, "image");
        contentStream.drawImage(pdImage, x, y, width, height);
    }


    /**
     * Zeichnet eine PdfTable-Datenklasse mit Paginierungs-Logik.
     *
     * @param x            X-Koordinate der Tabelle.
     * @param yStart       Y-Koordinate für die *Oberkante* der Tabelle.
     * @param table        Das PdfTable-Objekt, das die Daten enthält.
     * @param yBottomLimit Die Y-Koordinate (z.B. der untere Rand), an der nicht mehr gezeichnet werden darf.
     * @return Ein neues PdfTable-Objekt, das alle Zeilen enthält, die nicht gezeichnet wurden,
     * oder 'null', wenn alle Zeilen gezeichnet wurden.
     * @throws IOException Wenn das Zeichnen fehlschlägt.
     */
    public PdfTable drawTable(float x, float yStart, PdfTable table, float yBottomLimit) throws IOException {
        float y = yStart;

        // 1. Header zeichnen
        List<String> header = table.getHeader();
        if (header == null) {
            throw new IOException("Table must have a header for pagination.");
        }

        float headerHeight = calculateRowHeight(header, table.getColWidths(), FONT_SIZE_TABLE_HEADER, true);

        // Prüfen, ob der Header selbst auf die Seite passt
        if (y - headerHeight < yBottomLimit) {
            throw new IOException("Table Header does not fit on page. availableHeight is too small.");
        }

        // Header zeichnen
        drawTableRow(x, y, header, table.getColWidths(), headerHeight, true);
        y -= headerHeight;

        // 2. Datenzeilen zeichnen
        List<List<String>> rows = table.getRows();
        List<List<String>> remainingRows = new ArrayList<>();
        boolean pageBreakOccurred = false;

        for (List<String> row : rows) {
            float rowHeight = calculateRowHeight(row, table.getColWidths(), FONT_SIZE_TABLE_BODY, false);

            // Prüfen, ob die Zeile auf die Seite passt
            if (y - rowHeight < yBottomLimit) {
                pageBreakOccurred = true;
            }

            if (pageBreakOccurred) {
                // Diese und alle folgenden Zeilen für die nächste Seite aufheben
                remainingRows.add(row);
            } else {
                // Zeile passt, also zeichnen
                drawTableRow(x, y, row, table.getColWidths(), rowHeight, false);
                y -= rowHeight;
            }
        }

        // 3. Reste zurückgeben
        if (!pageBreakOccurred) {
            return null; // Alles wurde gezeichnet
        }

        // Es gibt Reste, erstelle eine neue Tabelle für die nächste Seite
        PdfTable leftoverTable = new PdfTable(table.getColWidths());
        leftoverTable.addHeaderRow(header); // WICHTIG: Header erneut hinzufügen
        remainingRows.forEach(leftoverTable::addRow);

        return leftoverTable;
    }


    // --- HILFSMETHODEN FÜR TABELLEN ---

    /**
     * Zeichnet eine einzelne Tabellenzeile (Header oder Daten).
     * (Kombiniert Linien- und Inhaltszeichnung)
     */
    private void drawTableRow(float x, float y, List<String> row, float[] colWidths, float rowHeight, boolean isHeader) throws IOException {
        float tableWidth = 0;
        for (float w : colWidths) tableWidth += w;

        // 1. Linien zeichnen
        drawRowLines(x, y, rowHeight, colWidths, tableWidth);

        // 2. Inhalt zeichnen
        PDType1Font font = isHeader ? FONT_BOLD : FONT_NORMAL;
        float fontSize = isHeader ? FONT_SIZE_TABLE_HEADER : FONT_SIZE_TABLE_BODY;

        float currentX = x;
        float textY = y - TABLE_LINE_HEIGHT + 2; // Y-Startposition für Text (oben in Zelle)

        for (int i = 0; i < row.size(); i++) {
            String text = (row.get(i) == null) ? "-" : row.get(i);
            float cellWidth = colWidths[i] - CELL_PADDING * 2;

            // Wähle die Schriftart (Code-Schriftart für Spalte 5)
            PDType1Font cellFont = font;
            if (!isHeader && i == 4) { // Index 5 ist "Regex / Erlaubte Werte"
                cellFont = FONT_CODE;
            }



            // Hole alle Zeilen (unterstützt \n und automatischen Umbruch)
            List<String> lines = getLines(text, cellWidth, cellFont, fontSize);
            float currentTextY = textY;

            contentStream.setFont(cellFont, fontSize);
            contentStream.setNonStrokingColor(Color.BLACK);

            // Zeichne jede Zeile des Zellinhalts
            for (String line : lines) {
                contentStream.beginText();
                contentStream.newLineAtOffset(currentX + CELL_PADDING, currentTextY);
                contentStream.showText(line);
                contentStream.endText();
                currentTextY -= TABLE_LINE_HEIGHT;
            }
            currentX += colWidths[i];
        }
    }


    /**
     * Berechnet die Höhe einer Tabellenzeile basierend auf dem Inhalt.
     */
    private float calculateRowHeight(List<String> row, float[] colWidths, float fontSize, boolean isHeader) throws IOException {
        int maxLines = 1;

        for (int i = 0; i < row.size(); i++) {
            String text = (row.get(i) == null) ? "-" : row.get(i);
            float cellWidth = colWidths[i] - CELL_PADDING * 2;

            PDType1Font font = FONT_NORMAL;
            if (isHeader) {
                font = FONT_BOLD;
            } else if (i == 5) { // Index 5 ist "Regex / Erlaubte Werte"
                font = FONT_CODE;
            }

            List<String> lines = getLines(text, cellWidth, font, fontSize);
            maxLines = Math.max(maxLines, lines.size());
        }

        float height = (maxLines * TABLE_LINE_HEIGHT) + (CELL_PADDING * 2);
        return Math.max(TABLE_ROW_MIN_HEIGHT, height);
    }

    /**
     * Zeichnet die Gitterlinien für EINE Zeile.
     */
    private void drawRowLines(float x, float y, float rowHeight, float[] colWidths, float tableWidth) throws IOException {
        contentStream.setStrokingColor(Color.DARK_GRAY);
        contentStream.setLineWidth(0.5f);

        // Horizontale Linien
        contentStream.moveTo(x, y);
        contentStream.lineTo(x + tableWidth, y);
        contentStream.moveTo(x, y - rowHeight);
        contentStream.lineTo(x + tableWidth, y - rowHeight);

        // Vertikale Linien
        float currentX = x;
        contentStream.moveTo(currentX, y);
        contentStream.lineTo(currentX, y - rowHeight); // Erste Linie links

        for (float width : colWidths) {
            currentX += width;
            contentStream.moveTo(currentX, y);
            contentStream.lineTo(currentX, y - rowHeight); // Linien zwischen den Spalten
        }
        contentStream.stroke();
    }

    /**
     * Bricht Text in Zeilen um, *behält* aber manuelle \n-Umbrüche bei.
     */
    private List<String> getLines(String text, float maxWidth, PDType1Font font, float fontSize) throws IOException {
        List<String> finalLines = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            finalLines.add("");
            return finalLines;
        }

        String[] parts = text.split("\n");

        for (String part : parts) {
            // Jedes Teil dann automatisch umbrechen
            finalLines.addAll(wrapText(part, maxWidth, font, fontSize));
        }
        return finalLines;
    }


    /**
     * Bricht einen langen Text in mehrere Zeilen um, damit er in eine Breite passt.
     * (Ignoriert/entfernt \n-Zeichen)
     */
    private List<String> wrapText(String text, float maxWidth, PDType1Font font, float fontSize) throws IOException {
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
        lines.add(line.toString()); // Letzte Zeile hinzufügen
        return lines;
    }

    /**
     * Hilfsfunktion für wrapText: Findet den Umbruchpunkt in einem zu langen Wort.
     */
    private int findBreakIndex(String word, float maxWidth, PDType1Font font, float fontSize) throws IOException {
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

    /**
     * Schließt den Content-Stream.
     * Erforderlich durch AutoCloseable.
     */
    @Override
    public void close() throws IOException {
        if (this.contentStream != null) {
            this.contentStream.close();
        }
    }
}