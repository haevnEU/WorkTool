package de.haevn.snippetmanage.xml;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class PdfBoxDinA4Generator {

    // --- Konstanten ---
    private static final PDType1Font FONT_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDType1Font FONT_NORMAL = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDType1Font FONT_OBLIQUE = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

    private static final float MARGIN = 50;
    private static final float FONT_SIZE_TABLE_HEADER = 8;
    private static final float FONT_SIZE_TABLE_BODY = 8;
    private static final float TABLE_ROW_MIN_HEIGHT = 15;
    private static final float TABLE_LINE_HEIGHT = 10; // Für umgebrochenen Text
    private static final float CELL_PADDING = 5;

    // Spaltenbreiten (Summe = 595 - 2*MARGIN = 495)
    // ANGEPASST: 8 Spalten, Regex/Choice zusammengelegt (65+65=130)
    private static final float[] COL_WIDTHS = {90, 30, 40, 40, 60, 130, 45, 60};
    private static final String[] HEADERS = {
            "Feldname", "Spalte", "Excel", "Pflicht", "Beschreibung",
            "Regex / Erlaubte Werte", "Fehler-\nCode", "Fehler-\nmeldung"
    };

    /**
     * Hilfsfunktion zum Zeichnen der Gitterlinien für EINE Zeile.
     */
    private static void drawRowLines(PDPageContentStream cs, float x, float y, float rowHeight, float[] colWidths) throws IOException {
        float tableWidth = 0;
        for (float w : colWidths) tableWidth += w;

        // Horizontale Linien
        cs.moveTo(x, y);
        cs.lineTo(x + tableWidth, y);
        cs.moveTo(x, y - rowHeight);
        cs.lineTo(x + tableWidth, y - rowHeight);

        // Vertikale Linien
        float currentX = x;
        cs.moveTo(currentX, y);
        cs.lineTo(currentX, y - rowHeight); // Erste Linie links

        for (float width : colWidths) {
            currentX += width;
            cs.moveTo(currentX, y);
            cs.lineTo(currentX, y - rowHeight); // Linien zwischen den Spalten
        }
        cs.stroke(); // Alle Linien auf einmal zeichnen
    }

    /**
     * Zeichnet die Kopf- und Fußzeile (Seitenzahl).
     */
    private static void drawPageHeaderAndFooter(PDPageContentStream cs, PDPage page, String docTitle, int pageNum, float margin) throws IOException {
        float width = page.getMediaBox().getWidth();
        float height = page.getMediaBox().getHeight();

        // Kopfzeile
        // KORREKTUR: docTitle bereinigen, bevor er verwendet wird
        String safeDocTitle = (docTitle != null ? docTitle : "N/A").replaceAll("\\r\\n|\\r|\\n", " ");
        cs.beginText();
        cs.setFont(FONT_NORMAL, 10);
        cs.newLineAtOffset(margin, height - margin + 10); // Oben links
        cs.showText("Dokumentation: " + safeDocTitle);
        cs.endText();

        // Fußzeile (Seitenzahl)
        String pageNumText = "Seite " + pageNum;
        float textWidth = FONT_NORMAL.getStringWidth(pageNumText) / 1000 * 10;
        float pageNumX = width - margin - textWidth; // Unten rechts

        cs.beginText();
        cs.setFont(FONT_NORMAL, 10);
        cs.newLineAtOffset(pageNumX, margin - 10);
        cs.showText(pageNumText);
        cs.endText();
    }

    /**
     * Zeichnet die Box mit den allgemeinen Hinweisen.
     * Gibt die Y-Position *nach* der Box zurück.
     */
    private static float drawNotesBox(PDPageContentStream cs, float margin, float yStart) throws IOException {
        float width = PDRectangle.A4.getWidth() - 2 * margin;
        float y = yStart;
        float padding = 10;
        float lineHeight = 12;

        String[] notes = {
                "Hinweis zur Validierung:",
                "- Dynamische Fehlermeldungen: ... werden generiert nach dem Muster: <muster>",
                "- Regel-Priorität: Für jedes Feld ist ENTWEDER Regex ODER Auswahl definiert."
        };

        float boxHeight = (notes.length * lineHeight) + (2 * padding);
        cs.setNonStrokingColor(0.95f, 0.95f, 0.95f); // Helles Grau
        cs.addRect(margin, y - boxHeight, width, boxHeight);
        cs.fill();
        cs.setNonStrokingColor(0, 0, 0); // Zurück zu Schwarz

        y -= (padding + lineHeight);

        cs.beginText();
        cs.setFont(FONT_BOLD, 10);
        cs.newLineAtOffset(margin + padding, y);
        cs.showText(notes[0]);
        cs.endText();
        y -= lineHeight;

        cs.beginText();
        cs.setFont(FONT_OBLIQUE, 9);
        cs.newLineAtOffset(margin + padding, y);
        cs.showText(notes[1]);
        cs.newLineAtOffset(0, -lineHeight); // Nächste Zeile
        cs.showText(notes[2]);
        cs.endText();

        return y - padding - lineHeight; // Y-Position unterhalb der Box
    }

    /**
     * Erstellt das komplette PDF-Dokument und gibt es als Byte-Array zurück.
     *
     * @param schema Das geladene Validierungsschema
     * @return Ein byte[] des PDF-Dokuments
     * @throws IOException Wenn beim Zeichnen ein Fehler auftritt
     */
    public byte[] createDocumentationAsBytes(ValidationSchema schema) throws IOException {
        // Wir verwenden try-with-resources, um sicherzustellen, dass BEIDE
        // Ressourcen (Dokument und Stream) am Ende geschlossen werden.
        try (PDDocument document = createDocumentation(schema);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            // Speichere das Dokument in den In-Memory-Stream
            document.save(baos);

            // Gib die Bytes des Streams zurück
            return baos.toByteArray();
        }
        // document.close() und baos.close() werden hier automatisch aufgerufen.
    }

    /**
     * Erstellt das komplette PDF-Dokument basierend auf einem ValidationSchema.
     *
     * @param schema Das geladene Validierungsschema
     * @return Ein PDDocument, bereit zum Speichern
     * @throws IOException Wenn beim Zeichnen ein Fehler auftritt
     */
    public PDDocument createDocumentation(ValidationSchema schema) throws IOException {
        PDDocument document = new PDDocument();
        try {
            // --- SEITE 1: DECKBLATT ---
            addTitlePageContent(document, schema);

            // --- SEITE 2+: DEFINITIONEN ---
            addDefinitionPages(document, schema);

            return document;
        } catch (IOException e) {
            // Wenn ein Fehler auftritt, schließe das Dokument, bevor die Exception geworfen wird
            document.close();
            throw e;
        }
    }

    /**
     * Fügt das Deckblatt (Seite 1) hinzu.
     * (ANGEPASST, um alle XML-Attribute aufzulisten)
     */
    private void addTitlePageContent(PDDocument doc, ValidationSchema schema) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);

        float width = page.getMediaBox().getWidth();
        float height = page.getMediaBox().getHeight();

        try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {

            // --- Titel (zentriert) ---
            String title = (schema.getReadableName() != null ? schema.getReadableName() : "Validierungsregeln")
                    .replaceAll("\\r\\n|\\r|\\n", " "); // Bereinigen
            float fontSizeTitle = 24;
            float titleWidth = FONT_BOLD.getStringWidth(title) / 1000 * fontSizeTitle;
            float titleX = (width - titleWidth) / 2;
            float titleY = height - 150; // Oben zentriert

            cs.beginText();
            cs.setFont(FONT_BOLD, fontSizeTitle);
            cs.newLineAtOffset(titleX, titleY);
            cs.showText(title);
            cs.endText();

            // --- Info-Block (Attribute) ---
            float y = titleY - 80;
            float x_label = MARGIN + 50;
            float x_value = x_label + 160;
            float lineHeight = 25;
            float fontSizeInfo = 12;

            // 1. Schema-Name
            String schemaName = (schema.getSchemaName() != null ? schema.getSchemaName() : "N/A")
                    .replaceAll("\\r\\n|\\r|\\n", " ");
            drawInfoLine(cs, x_label, x_value, y, "Schema-Name:", schemaName, fontSizeInfo);
            y -= lineHeight;

            // 2. ID-Name
            String idName = (schema.getIdName() != null ? schema.getIdName() : "N/A")
                    .replaceAll("\\r\\n|\\r|\\n", " ");
            drawInfoLine(cs, x_label, x_value, y, "ID-Name (Schlüssel):", idName, fontSizeInfo);
            y -= lineHeight;

            // 3. ID-Spalte
            String idColumnStr = String.valueOf(schema.getIdColumn()) +
                    " (Excel-Spalte: " + getExcelColumnName(schema.getIdColumn()) + ")";
            drawInfoLine(cs, x_label, x_value, y, "ID-Spalte (Index):", idColumnStr, fontSizeInfo);
            y -= lineHeight;

            // 4. Header-Identifier
            String headerIdentifier = (schema.getHeaderIdentifier() != null ? schema.getHeaderIdentifier() : "N/A")
                    .replaceAll("\\r\\n|\\r|\\n", " ");

            // --- KORREKTUR: Text-Umbruch für Header-Erkennung ---
            int wrapLimit = 45;
            if (headerIdentifier.length() > wrapLimit) {
                // Versuche, an einem Leerzeichen vor dem Limit zu umbrechen
                int wrapIndex = headerIdentifier.lastIndexOf(' ', wrapLimit);

                // Wenn kein Leerzeichen gefunden wurde oder das Leerzeichen sehr früh ist (z.B. bei einem langen Wort),
                // dann hart am Limit umbrechen.
                if (wrapIndex == -1 || wrapIndex < 20) {
                    wrapIndex = wrapLimit;
                }

                String part1 = headerIdentifier.substring(0, wrapIndex);
                String part2 = headerIdentifier.substring(wrapIndex).trim(); // .trim() entfernt das Leerzeichen am Anfang

                // Zeichne Label und Teil 1
                drawInfoLine(cs, x_label, x_value, y, "Header-Erkennung:", part1, fontSizeInfo);
                y -= lineHeight; // Gehe zur nächsten Zeile

                // Zeichne Teil 2 (eingerückt auf Höhe des Wertes)
                cs.beginText();
                cs.setFont(FONT_NORMAL, fontSizeInfo);
                cs.newLineAtOffset(x_value, y); // Gleiche X-Position wie der Wert
                cs.showText(part2);
                cs.endText();
                y -= lineHeight; // Gehe zur nächsten Zeile (jetzt 2x dekrementiert für diese Info)

            } else {
                // Alte Logik: Passt in eine Zeile
                drawInfoLine(cs, x_label, x_value, y, "Header-Erkennung:", headerIdentifier, fontSizeInfo);
                y -= lineHeight;
            }
            // --- ENDE KORREKTUR ---

            // 5. Gesamtspalten
            String totalColsStr = String.valueOf(schema.getTotalColumns());
            if (totalColsStr.equals("-1")) totalColsStr = "N/A";
            drawInfoLine(cs, x_label, x_value, y, "Gesamtspalten (erwartet):", totalColsStr, fontSizeInfo);
            y -= lineHeight;
        }
    }

    /**
     * NEUE Hilfsmethode zum Zeichnen einer Zeile im Info-Block (Label + Wert).
     */
    private void drawInfoLine(PDPageContentStream cs, float x_label, float x_value, float y, String label, String value, float fontSize) throws IOException {
        // Label (Fett)
        cs.beginText();
        cs.setFont(FONT_BOLD, fontSize);
        cs.newLineAtOffset(x_label, y);
        cs.showText(label);
        cs.endText();

        // Wert (Normal)
        cs.beginText();
        cs.setFont(FONT_NORMAL, fontSize);
        cs.newLineAtOffset(x_value, y);
        cs.showText(value);
        cs.endText();
    }

    /**
     * Fügt alle Definitionsseiten hinzu, inkl. automatischer Seitenumbrüche.
     */
    private void addDefinitionPages(PDDocument doc, ValidationSchema schema) throws IOException {
        // 1. Alle Regeln sammeln und sortieren
        List<FormatRule> allRules = new ArrayList<>();
        // KORREKTUR: Regeln explizit als Pflicht (nicht optional) markieren
        schema.getMandatory().forEach(rule -> {
            rule.setOptional(false);
            allRules.add(rule);
        });
        // KORREKTUR: Regeln explizit als optional markieren
        schema.getOptional().forEach(rule -> {
            rule.setOptional(true);
            allRules.add(rule);
        });

        // Sortiere nach Spaltenindex
        allRules.sort(Comparator.comparing(FormatRule::getColumn));

        // 2. Setup für die erste Seite
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        PDPageContentStream cs = new PDPageContentStream(doc, page);

        int pageNum = 2;
        float yStart = page.getMediaBox().getHeight() - MARGIN - 40; // Y-Position nach Header
        float y = yStart; // Aktuelle Y-Position

        // 3. Header, Footer und Notizen für die erste Definitionsseite
        drawPageHeaderAndFooter(cs, page, schema.getReadableName(), pageNum, MARGIN);
        y = drawNotesBox(cs, MARGIN, y);
        y -= 20; // Abstand zur Tabe    lle

        // 4. Tabellenkopf zeichnen
        // ANGEPASST: Header-Höhe fix auf 2 Zeilen eingestellt wegen \n
        float headerHeight = 2 * TABLE_LINE_HEIGHT + CELL_PADDING; // ca. 25
        drawTableHeader(cs, MARGIN, y, headerHeight);
        y -= headerHeight;

        // 5. Alle Regeln durchlaufen und Zeilen zeichnen
        for (FormatRule rule : allRules) {

            // 5a. Dynamische Zeilenhöhe basierend auf Textumbruch berechnen
            float dynamicRowHeight = calculateDynamicRowHeight(rule);

            // 5b. Prüfen, ob ein Seitenumbruch NÖTIG ist
            if (y - dynamicRowHeight < MARGIN) {
                // Seite abschließen
                cs.close();

                // Neue Seite erstellen
                pageNum++;
                page = new PDPage(PDRectangle.A4);
                doc.addPage(page);
                cs = new PDPageContentStream(doc, page);
                y = yStart; // Y-Position zurücksetzen

                // Header und Footer auf neuer Seite
                drawPageHeaderAndFooter(cs, page, schema.getReadableName(), pageNum, MARGIN);

                // Tabellenkopf erneut zeichnen
                drawTableHeader(cs, MARGIN, y, headerHeight);
                y -= headerHeight;
            }

            // 5c. Zeile zeichnen (Linien und Inhalt)
            drawRowLines(cs, MARGIN, y, dynamicRowHeight, COL_WIDTHS);
            drawRowContent(cs, rule, MARGIN, y, dynamicRowHeight);

            y -= dynamicRowHeight;
        }

        // Letzten ContentStream schließen
        cs.close();
    }

    /**
     * Berechnet die Höhe einer Zeile basierend auf dem Inhalt, der umgebrochen werden muss.
     */
    private float calculateDynamicRowHeight(FormatRule rule) throws IOException {
        // Leere Strings oder Null-Werte abfangen
        // ANGEPASST: Logik für zusammengefasste Spalte
        String regex = rule.getRegex() != null && !rule.getRegex().isEmpty() ? rule.getRegex() : null;
        String choice = rule.getChoice() != null && !rule.getChoice().isEmpty() ? rule.getChoice() : null;
        String ruleContent = regex != null ? regex : (choice != null ? choice : "-");
        String errorMsg = rule.getErrorMessage() != null ? rule.getErrorMessage() : "-";

        // Berechne Zeilen für jede Zelle, die umgebrochen werden könnte
        int linesFeld = wrapText(rule.getFieldName(), COL_WIDTHS[0] - CELL_PADDING * 2, FONT_NORMAL, FONT_SIZE_TABLE_BODY).size();
        // ANGEPASST: Spaltenindizes und Logik
        int linesRule = wrapText(ruleContent, COL_WIDTHS[5] - CELL_PADDING * 2, FONT_NORMAL, FONT_SIZE_TABLE_BODY).size();
        int linesError = wrapText(errorMsg, COL_WIDTHS[7] - CELL_PADDING * 2, FONT_NORMAL, FONT_SIZE_TABLE_BODY).size();

        // Finde die maximale Anzahl an Zeilen
        int maxLines = Math.max(1, linesFeld); // Mindestens 1 Zeile
        maxLines = Math.max(maxLines, linesRule);
        maxLines = Math.max(maxLines, linesError);

        // Berechne Höhe: (Anzahl Zeilen * Zeilenhöhe) + etwas Padding oben/unten
        float height = (maxLines * TABLE_LINE_HEIGHT) + (CELL_PADDING / 2);
        return Math.max(TABLE_ROW_MIN_HEIGHT, height); // Mindesthöhe sicherstellen
    }

    /**
     * Zeichnet den Inhalt einer einzelnen Tabellenzeile (mit Textumbruch).
     */
    private void drawRowContent(PDPageContentStream cs, FormatRule rule, float x, float y, float rowHeight) throws IOException {
        // ANGEPASST: Logik für zusammengefasste Spalte
        String regex = rule.getRegex() != null && !rule.getRegex().isEmpty() ? rule.getRegex() : null;
        String choice = rule.getChoice() != null && !rule.getChoice().isEmpty() ? rule.getChoice() : null;
        String ruleContent = regex != null ? "Regex: " + regex : (choice != null ? "Auswahl: " + choice : "-");

        // Daten für die Zeile vorbereiten
        // ANGEPASST: 8 Spalten
        String[] rowData = {
                rule.getFieldName(),
                String.valueOf(rule.getColumn()),
                getExcelColumnName(rule.getColumn()),
                rule.isOptional() ? "Nein" : "Ja", // KORRIGIERT: Basiert auf mandatory/optional Liste
                rule.getDescription() != null ? rule.getDescription() : "tba",
                ruleContent, // Zusammengefasste Spalte
                rule.getErrorCode() != null ? rule.getErrorCode() : "-",
                rule.getErrorMessage() != null ? rule.getErrorMessage() : "-"
        };

        cs.setFont(FONT_NORMAL, FONT_SIZE_TABLE_BODY);

        float currentX = x;
        // Vertikale Position: Oben in der Zelle starten
        float textY = y - TABLE_LINE_HEIGHT;

        for (int i = 0; i < rowData.length; i++) {
            float cellWidth = COL_WIDTHS[i] - CELL_PADDING * 2;
            String text = rowData[i];

            if (text == null) text = "-";

            // Text umbrechen
            List<String> lines = wrapText(text, cellWidth, FONT_NORMAL, FONT_SIZE_TABLE_BODY);

            float currentTextY = textY;
            for (String line : lines) {
                cs.beginText();
                cs.newLineAtOffset(currentX + CELL_PADDING, currentTextY);
                cs.showText(line);
                cs.endText();
                currentTextY -= TABLE_LINE_HEIGHT; // Nächste Zeile nach unten
            }
            currentX += COL_WIDTHS[i];
        }
    }

    /**
     * Zeichnet den Tabellenkopf.
     */
    private void drawTableHeader(PDPageContentStream cs, float x, float y, float rowHeight) throws IOException {
        // Linien für Header zeichnen
        drawRowLines(cs, x, y, rowHeight, COL_WIDTHS);

        cs.setFont(FONT_BOLD, FONT_SIZE_TABLE_HEADER);
        float currentX = x;

        // ANGEPASST: Logik für Zeilenumbrüche (\n) im Header
        for (int i = 0; i < HEADERS.length; i++) {
            String header = HEADERS[i];
            float cellX = currentX + CELL_PADDING;

            if (header.contains("\n")) {
                // Header mit Zeilenumbruch
                String[] parts = header.split("\n");
                float textY1 = y - (rowHeight / 2) + (FONT_SIZE_TABLE_HEADER / 2) + 2; // Oben
                float textY2 = y - (rowHeight / 2) - (FONT_SIZE_TABLE_HEADER / 2) - 2; // Unten

                cs.beginText();
                cs.newLineAtOffset(cellX, textY1);
                cs.showText(parts[0]);
                cs.endText();

                cs.beginText();
                cs.newLineAtOffset(cellX, textY2);
                cs.showText(parts[1]);
                cs.endText();
            } else {
                // Standard-Header (vertikal zentriert)
                float textY = y - (rowHeight / 2) - (FONT_SIZE_TABLE_HEADER / 2);
                cs.beginText();
                cs.newLineAtOffset(cellX, textY);
                cs.showText(header);
                cs.endText();
            }
            currentX += COL_WIDTHS[i];
        }
    }

    // --- HELPER-METHODEN ---

    /**
     * Bricht einen langen Text in mehrere Zeilen um, damit er in eine Breite passt.
     */
    private List<String> wrapText(String text, float maxWidth, PDType1Font font, float fontSize) throws IOException {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            lines.add("");
            return lines;
        }

        // --- KORREKTUR ---
        // Ersetze alle Steuerzeichen (wie \n, \r) durch Leerzeichen,
        // damit showText() nicht fehlschlägt und der Umbruch korrekt funktioniert.
        String sanitizedText = text.replaceAll("\\r\\n|\\r|\\n", " ");
        // --- ENDE KORREKTUR ---

        String[] words = sanitizedText.split(" "); // Benutze den bereinigten Text
        StringBuilder line = new StringBuilder();

        for (String word : words) {
            if (word.isEmpty()) continue;

            float wordWidth = font.getStringWidth(word) / 1000 * fontSize;
            float lineWidth = font.getStringWidth(line.toString()) / 1000 * fontSize;

            // Prüfen, ob das Wort selbst zu lang ist
            if (wordWidth > maxWidth) {
                // Wort aufteilen (einfache Aufteilung nach Zeichen)
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
            }
            // Prüfen, ob das Wort auf die aktuelle Zeile passt
            else if (lineWidth + wordWidth < maxWidth) {
                if (line.length() > 0) line.append(" ");
                line.append(word);
            }
            // Passt nicht mehr, neue Zeile beginnen
            else {
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
     * Konvertiert einen 0-basierten Spaltenindex in einen Excel-Spaltennamen (A, B, ..., Z, AA, ...).
     */
    private String getExcelColumnName(int column) {
        if (column < 0) return "-";

        StringBuilder sb = new StringBuilder();
        while (column >= 0) {
            int remainder = column % 26;
            sb.append((char) (remainder + 'A'));
            column = (column / 26) - 1;
            if (column < -1) break; // Korrektur für 0-basiert
        }
        return sb.reverse().toString();
    }

}