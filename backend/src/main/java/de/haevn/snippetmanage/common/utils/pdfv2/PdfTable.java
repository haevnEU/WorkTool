package de.haevn.snippetmanage.common.utils.pdfv2;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.awt.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class  PdfTable implements IPdfObject {
    private float x, y, width, height;
    private String[][] data;
    private float baseRowHeight; // Mindesthöhe
    private float[] colWidths;
    private float[] rowHeights;  // Tatsächliche Höhe pro Zeile (dynamisch)
    private boolean drawBorders;
    private TextAlign[] alignments;

    // Cache für berechnete Zeilenumbrüche: List<Zeilen>[Spalte] pro Datenzeile
    private List<List<String>[]> wrappedData;

    public PdfTable(float x, float y, float width, float rowHeight, String[][] data) {
        this(x, y, width, rowHeight, data, null, true, null);
    }

    public PdfTable(float x, float y, float width, float rowHeight, String[][] data, float[] colWeights) {
        this(x, y, width, rowHeight, data, colWeights, true, null);
    }

    public PdfTable(float x, float y, float width, float rowHeight, String[][] data, float[] colWeights, boolean drawBorders, TextAlign[] alignments) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.baseRowHeight = rowHeight;
        this.data = data;
        this.drawBorders = drawBorders;
        this.alignments = alignments;
        this.wrappedData = new ArrayList<>();

        PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        int fontSize = 10;

        if (data.length > 0) {
            int cols = data[0].length;
            this.colWidths = new float[cols];
            this.rowHeights = new float[data.length];

            // 1. Spaltenbreiten berechnen
            if (colWeights != null && colWeights.length == cols) {
                float totalWeight = 0;
                for (float w : colWeights) totalWeight += w;
                for (int i = 0; i < cols; i++) {
                    this.colWidths[i] = (colWeights[i] / totalWeight) * width;
                }
            } else {
                float evenWidth = width / cols;
                for (int i = 0; i < cols; i++) {
                    this.colWidths[i] = evenWidth;
                }
            }

            // 2. Zeilenhöhen vor-berechnen (Pre-Processing)
            if (this.alignments == null) {
                this.alignments = new TextAlign[cols];
                for(int i=0; i<cols; i++) this.alignments[i] = TextAlign.LEFT;
            }

            float totalTableHeight = 0;

            for (int r = 0; r < data.length; r++) {
                String[] row = data[r];
                List<String>[] rowWrappedContent = new List[cols];
                int maxLinesInRow = 1;

                for (int c = 0; c < cols; c++) {
                    String rawText = (c < row.length && row[c] != null) ? row[c] : "";
                    // Umbruch berechnen (Padding abziehen: 5 links + 5 rechts = 10)
                    List<String> lines = wrapText(rawText, colWidths[c] - 10, font, fontSize);
                    rowWrappedContent[c] = lines;
                    if (lines.size() > maxLinesInRow) {
                        maxLinesInRow = lines.size();
                    }
                }
                this.wrappedData.add(rowWrappedContent);

                // Höhe dieser Zeile: (Anzahl Zeilen * FontHöhe) + Padding
                // Wir nehmen baseRowHeight als Minimum, falls nur 1 Zeile da ist
                float requiredHeight = (maxLinesInRow * (fontSize + 2)) + 8; // +2 Leading, +8 Padding
                this.rowHeights[r] = Math.max(this.baseRowHeight, requiredHeight);
                totalTableHeight += this.rowHeights[r];
            }
            this.height = totalTableHeight;
        }
    }

    @Override
    public void render(PDDocument document, PDPageContentStream contentStream) throws IOException {
        contentStream.setStrokingColor(Color.BLACK);
        contentStream.setLineWidth(0.5f);

        PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        int fontSize = 10;
        float leading = fontSize + 2; // Zeilenabstand

        float currentY = y;

        for (int r = 0; r < data.length; r++) {
            float currentRowHeight = rowHeights[r];
            float currentX = x;
            List<String>[] rowContent = wrappedData.get(r);

            for (int c = 0; c < rowContent.length; c++) {
                List<String> lines = rowContent[c];
                float currentCellWidth = (colWidths != null && c < colWidths.length) ? colWidths[c] : 0;
                TextAlign align = (alignments != null && c < alignments.length) ? alignments[c] : TextAlign.LEFT;

                // 1. Rahmen zeichnen
                if (drawBorders) {
                    contentStream.addRect(currentX, currentY - currentRowHeight, currentCellWidth, currentRowHeight);
                    contentStream.stroke();
                }

                // 2. Text rendern (Zeile für Zeile)
                contentStream.setNonStrokingColor(Color.BLACK);
                contentStream.setFont(font, fontSize);

                // Start Y für Text (oben in der Zelle mit etwas Padding)
                float textStartY = currentY - fontSize - 4;

                for (String line : lines) {
                    float textWidth = 0;
                    try {
                        textWidth = font.getStringWidth(line) / 1000 * fontSize;
                    } catch (Exception e) {} // Ignore font errors

                    float textX = currentX + 5;

                    if (align == TextAlign.RIGHT) {
                        textX = currentX + currentCellWidth - textWidth - 5;
                    } else if (align == TextAlign.CENTER) {
                        textX = currentX + (currentCellWidth - textWidth) / 2;
                    }

                    contentStream.beginText();
                    contentStream.newLineAtOffset(textX, textStartY);
                    contentStream.showText(line);
                    contentStream.endText();

                    textStartY -= leading; // Nächste Zeile
                }

                currentX += currentCellWidth;
            }
            currentY -= currentRowHeight;
        }
    }

    @Override public float getX() { return x; }
    @Override public float getY() { return y; }
    @Override public float getWidth() { return width; }
    @Override public float getHeight() { return height; }



    public static List<String> wrapText(String text, float maxWidth, PDFont font, int fontSize) {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            return lines;
        }

        // Sicherheitscheck falls Spalte extrem klein
        if (maxWidth < 5) maxWidth = 5;

        // 1. Sanitize
        String cleanText = text.replace("\n", " ").replace("\r", " ").replace("\t", " ");

        String[] words = cleanText.split(" ");
        StringBuilder currentLine = new StringBuilder();
        float currentLineWidth = 0;

        for (String word : words) {
            float wordWidth = 0;
            try {
                wordWidth = font.getStringWidth(word) / 1000 * fontSize;
            } catch (Exception e) { continue; }

            float spaceWidth = 0;
            if (currentLine.length() > 0) {
                try { spaceWidth = font.getStringWidth(" ") / 1000 * fontSize; } catch (Exception e) {}
            }

            // Fall 1: Wort passt auf die aktuelle Zeile
            if (currentLineWidth + spaceWidth + wordWidth <= maxWidth) {
                if (currentLine.length() > 0) {
                    currentLine.append(" ");
                    currentLineWidth += spaceWidth;
                }
                currentLine.append(word);
                currentLineWidth += wordWidth;
            } else {
                // Zeile voll -> aktuelle Zeile abschließen
                if (currentLine.length() > 0) {
                    lines.add(currentLine.toString());
                    currentLine = new StringBuilder();
                    currentLineWidth = 0;
                    spaceWidth = 0;
                }

                // Fall 2: Wort passt alleine auf eine neue Zeile
                if (wordWidth <= maxWidth) {
                    currentLine.append(word);
                    currentLineWidth = wordWidth;
                } else {
                    // Fall 3: Wort ist SELBST zu lang für eine Zeile -> Hart trennen
                    String remaining = word;
                    while (!remaining.isEmpty()) {
                        int splitIndex = 0;
                        // Zeichenweise prüfen wie viel passt
                        for (int i = 1; i <= remaining.length(); i++) {
                            String sub = remaining.substring(0, i);
                            float subWidth = 0;
                            try { subWidth = font.getStringWidth(sub) / 1000 * fontSize; } catch(Exception e){}

                            if (subWidth > maxWidth) {
                                break;
                            }
                            splitIndex = i;
                        }

                        // Mindestens 1 Zeichen nehmen, um Endlosschleifen zu vermeiden
                        if (splitIndex == 0) splitIndex = 1;

                        String chunk = remaining.substring(0, splitIndex);

                        // Wenn noch Rest übrig ist, Chunk direkt als Zeile adden
                        if (splitIndex < remaining.length()) {
                            lines.add(chunk);
                        } else {
                            // Letztes Stück in den Buffer für evtl. folgende Wörter
                            currentLine.append(chunk);
                            try { currentLineWidth = font.getStringWidth(chunk) / 1000 * fontSize; } catch(Exception e){}
                        }
                        remaining = remaining.substring(splitIndex);
                    }
                }
            }
        }
        // Letzte Zeile hinzufügen
        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }

        return lines;
    }
}
