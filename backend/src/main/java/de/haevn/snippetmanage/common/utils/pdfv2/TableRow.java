package de.haevn.snippetmanage.common.utils.pdfv2;

import java.util.ArrayList;
import java.util.List;

public class TableRow {
    List<TableCell> cells = new ArrayList<>();
    public void addCell(TableCell cell) {
        cells.add(cell);
    }

    public List<TableCell> getCells() {
        return cells;
    }
}
