package de.haevn.snippetmanage.common.utils.pdf;

import java.util.ArrayList;
import java.util.List;

/**
 * Eine Datenklasse, die eine Tabelle für den PDF-Export repräsentiert.
 * Sie verwenden diese Klasse, um die Tabelle zu "bauen" (Header, Zeilen)
 * und übergeben sie dann an PageCanvas.drawTable() zum Zeichnen.
 */
public class PdfTable {

    private final float[] colWidths;
    private final List<List<String>> rows;
    private List<String> header;

    /**
     * Erstellt eine neue Tabelle mit definierten Spaltenbreiten.
     *
     * @param colWidths Ein Array von float-Werten, das die Breite jeder Spalte angibt.
     */
    public PdfTable(float[] colWidths) {
        if (colWidths == null || colWidths.length == 0) {
            throw new IllegalArgumentException("Column widths cannot be null or empty.");
        }
        this.colWidths = colWidths;
        this.rows = new ArrayList<>();
    }

    /**
     * Fügt die Kopfzeile zur Tabelle hinzu.
     *
     * @param headerRow Eine Liste von Strings für die Header-Zellen.
     */
    public void addHeaderRow(List<String> headerRow) {
        if (headerRow.size() != colWidths.length) {
            throw new IllegalArgumentException("Header row cell count (" + headerRow.size() +
                    ") does not match column widths count (" + colWidths.length + ").");
        }
        this.header = new ArrayList<>(headerRow);
    }

    /**
     * Fügt eine Inhaltszeile zur Tabelle hinzu.
     *
     * @param dataRow Eine Liste von Strings für die Daten-Zellen.
     */
    public void addRow(List<String> dataRow) {
        if (dataRow.size() != colWidths.length) {
            throw new IllegalArgumentException("Data row cell count (" + dataRow.size() +
                    ") does not match column widths count (" + colWidths.length + ").");
        }
        this.rows.add(new ArrayList<>(dataRow));
    }

    // --- Getter, die von PageCanvas verwendet werden ---

    float[] getColWidths() {
        return colWidths;
    }

    List<String> getHeader() {
        return header;
    }

    public List<List<String>> getRows() {
        return rows;
    }

    public boolean isEmpty() {
        return header == null && rows.isEmpty();
    }

    public List<List<String>> getAsList() {
        List<List<String>> table = new ArrayList<>();
        if (header != null) {
            table.add(header);
        }
        table.addAll(rows);
        return table;

    }
}

/*


 */