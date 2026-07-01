package de.haevn.snippetmanage.common.utils.pdfv2;

import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.util.ArrayList;
import java.util.List;

import static de.haevn.snippetmanage.common.utils.pdfv2.PdfTable.wrapText;

public  class MultiPageTable {
    private String[][] data;
    private float[] colWeights;
    private float x, width, minRowHeight;
    private float startY;
    private float subsequentY;
    private float bottomMargin;

    private boolean drawBorders;
    private TextAlign[] alignments;
    private float[] calculatedColWidths;

    public MultiPageTable(String[][] data, float x, float startY, float width, float rowHeight, float[] colWeights, boolean drawBorders, TextAlign[] alignments) {
        this.data = data;
        this.colWeights = colWeights;
        this.x = x;
        this.startY = startY;
        this.width = width;
        this.minRowHeight = rowHeight;
        this.drawBorders = drawBorders;
        this.alignments = alignments;

        this.subsequentY = 800;
        this.bottomMargin = 50;

        // Spaltenbreiten vorab berechnen für die Höhenvorhersage
        int cols = (data != null && data.length > 0) ? data[0].length : 0;
        this.calculatedColWidths = new float[cols];
        if (cols > 0) {
            if (colWeights != null && colWeights.length == cols) {
                float totalWeight = 0;
                for (float w : colWeights) totalWeight += w;
                for (int i = 0; i < cols; i++) this.calculatedColWidths[i] = (colWeights[i] / totalWeight) * width;
            } else {
                float even = width / cols;
                for (int i = 0; i < cols; i++) this.calculatedColWidths[i] = even;
            }
        }
    }

    public PdfPage drawToDocument(CustomPdfDocument doc, PdfPage currentPage) {
        if (data == null || data.length == 0) return currentPage;

        PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        int fontSize = 10;

        String[] headerRow = data[0];
        List<String[]> buffer = new ArrayList<>();
        buffer.add(headerRow);

        PdfPage activePage = currentPage;
        float currentTableTopY = (activePage == currentPage) ? startY : subsequentY;

        // Initiale Cursor Position berechnen (Header Höhe abziehen)
        float headerHeight = calculateRealRowHeight(headerRow, font, fontSize);
        float cursorY = currentTableTopY - headerHeight;

        for (int i = 1; i < data.length; i++) {
            // 1. Berechnen, wie hoch DIESE Zeile sein wird
            float neededHeight = calculateRealRowHeight(data[i], font, fontSize);

            // 2. Passt sie noch drauf?
            if (cursorY - neededHeight < bottomMargin) {
                // NEIN -> Rendern und neue Seite
                renderBufferToPage(activePage, buffer, currentTableTopY);

                activePage = new PdfPage();
                doc.addPage(activePage);

                buffer.clear();
                buffer.add(headerRow); // Header auf neuer Seite

                currentTableTopY = subsequentY;
                // Header Höhe auf neuer Seite neu abziehen
                headerHeight = calculateRealRowHeight(headerRow, font, fontSize);
                cursorY = subsequentY - headerHeight;
            }

            buffer.add(data[i]);
            cursorY -= neededHeight;
        }

        if (!buffer.isEmpty()) {
            renderBufferToPage(activePage, buffer, currentTableTopY);
        }

        return activePage;
    }

    // Berechnet die tatsächliche Höhe einer Zeile basierend auf Textumbruch
    private float calculateRealRowHeight(String[] row, PDFont font, int fontSize) {
        int maxLines = 1;
        for (int c = 0; c < row.length; c++) {
            if (c >= calculatedColWidths.length) break;
            String text = (row[c] != null) ? row[c] : "";
            // Verwende die gleiche Wrapper-Logik wie PdfTable
            List<String> lines = wrapText(text, calculatedColWidths[c] - 10, font, fontSize);
            if (lines.size() > maxLines) maxLines = lines.size();
        }
        float required = (maxLines * (fontSize + 2)) + 8;
        return Math.max(minRowHeight, required);
    }

    private void renderBufferToPage(PdfPage page, List<String[]> rows, float topY) {
        String[][] tableData = rows.toArray(new String[0][]);
        PdfTable tablePart = new PdfTable(
                x, topY, width, minRowHeight, tableData, colWeights, drawBorders, alignments
        );
        page.addObject(tablePart);
    }
}