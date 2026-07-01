package de.haevn.snippetmanage.common.utils.html;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class HtmlTable implements IHtmlElement {
    public List<List<IHtmlElement>> rows = new ArrayList<>();
    private int[] dimensionRatios = null;
    private final int maxColumns;
    private boolean dimensionsTotalValues = false;

    // wrapping controls
    private Boolean[] columnWrapping = null; // null = use table-level default
    private boolean tableCellWrapping = false; // default: no wrap (preserve previous truncation)

    public HtmlTable(int maxColumns) {
        this.maxColumns = maxColumns;
    }

    public HtmlTable(List<String> headers) {
        this(headers.size());
        List<IHtmlElement> headerRow = new ArrayList<>();
        for (String header : headers) {
            headerRow.add(new HtmlText(header));
        }
        addRow(headerRow);
    }

    public HtmlTable(String ... headers){
        this(Arrays.asList(headers));
    }

    public HtmlTable addRow(List<IHtmlElement> row) {
        if (row.size() > maxColumns) {
            throw new IllegalArgumentException("Row exceeds maximum number of columns: " + maxColumns);
        }
        rows.add(row);
        return this;
    }

    public HtmlTable addRow(IHtmlElement... elements) {
        List<IHtmlElement> row = new ArrayList<>();
        for (IHtmlElement element : elements) {
            row.add(element);
        }
        return addRow(row);
    }

    public HtmlTable addRow(String... texts) {
        List<IHtmlElement> row = new ArrayList<>();
        for (String text : texts) {
            row.add(new HtmlText(text));
        }
        return addRow(row);
    }

    public HtmlTable addEmptyRow() {
        List<IHtmlElement> row = new ArrayList<>();
        for (int i = 0; i < maxColumns; i++) {
            row.add(new HtmlText(""));
        }
        return addRow(row);
    }

    /**
     * Set column width ratios. Example: setDimensions(1, 1, 2) -> 25% / 25% / 50%.
     * Length must match the table's maxColumns and all values must be positive.
     */
    public HtmlTable setDimensions(int... dimensions) {
        return setDimensions(false, dimensions);
    }

    public HtmlTable setDimensions(boolean totalValues, int... dimensions) {
        if (dimensions == null || dimensions.length != maxColumns) {
            throw new IllegalArgumentException("Dimensions length must match number of columns: " + maxColumns);
        }
        for (int d : dimensions) {
            if (d <= 0) {
                throw new IllegalArgumentException("Dimension ratios must be positive values");
            }
        }
        this.dimensionRatios = Arrays.copyOf(dimensions, dimensions.length);
        this.dimensionsTotalValues = totalValues;
        return this;
    }

    /**
     * Enable or disable wrapping for all cells (table-level default).
     * If per-column wrapping is set via setColumnWrapping, that overrides the table-level setting.
     */
    public HtmlTable setCellWrapping(boolean wrap) {
        this.tableCellWrapping = wrap;
        return this;
    }

    /**
     * Set per-column wrapping. Length must match maxColumns. Values:
     *  - true: wrap this column
     *  - false: do not wrap this column (use ellipsis)
     */
    public HtmlTable setColumnWrapping(boolean... wraps) {
        if (wraps == null || wraps.length != maxColumns) {
            throw new IllegalArgumentException("Wrapping length must match number of columns: " + maxColumns);
        }
        this.columnWrapping = new Boolean[maxColumns];
        for (int i = 0; i < wraps.length; i++) {
            this.columnWrapping[i] = wraps[i];
        }
        return this;
    }

    /**
     * Convenience: set wrapping for all columns at once.
     * Example: setAllColumnsWrapping(true) -> all columns will wrap.
     */
    public HtmlTable setAllColumnsWrapping(boolean wrap) {
        this.columnWrapping = new Boolean[maxColumns];
        Arrays.fill(this.columnWrapping, wrap);
        return this;
    }

    private String tdStyleForColumn(int colIndex) {
        boolean wrap;
        if (columnWrapping != null && columnWrapping[colIndex] != null) {
            wrap = columnWrapping[colIndex];
        } else {
            wrap = tableCellWrapping;
        }

        if (wrap) {
            // allow wrapping and breaking long words
            return "style=\"white-space:normal;word-wrap:break-word;word-break:break-word;\"";
        } else {
            // prevent wrap and show ellipsis when overflow
            return "style=\"white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\"";
        }
    }

    @Override
    public String toHtml() {
        StringBuilder sb = new StringBuilder();

        if (dimensionRatios != null) {
            int sum = 0;
            for (int r : dimensionRatios) sum += r;

            if (dimensionsTotalValues && sum > 0) {
                // Treat provided values as absolute pixel widths
                sb.append("<table style=\"table-layout:fixed; width:").append(sum).append("px;\">\n");
                sb.append("  <colgroup>\n");
                for (int r : dimensionRatios) {
                    sb.append("    <col style=\"width:").append(r).append("px\"/>\n");
                }
                sb.append("  </colgroup>\n");
            } else {
                // Treat provided values as ratios and emit percentages
                sb.append("<table style=\"width:100%; table-layout:fixed;\">\n");
                sb.append("  <colgroup>\n");
                for (int r : dimensionRatios) {
                    double pct = (sum == 0) ? 0.0 : (r * 100.0) / sum;
                    sb.append("    <col style=\"width:").append(String.format(Locale.ROOT, "%.2f%%", pct)).append("\"/>\n");
                }
                sb.append("  </colgroup>\n");
            }
        } else {
            sb.append("<table style=\"width:100%; table-layout:fixed;\">\n");
        }

        for (List<IHtmlElement> row : rows) {
            sb.append("  <tr>\n");
            int i = 0;
            for (IHtmlElement cell : row) {
                sb.append("    <td ").append(tdStyleForColumn(i)).append(">").append(cell.toHtml()).append("</td>\n");
                i++;
            }
            // pad missing cells to reach maxColumns
            for (; i < maxColumns; i++) {
                sb.append("    <td ").append(tdStyleForColumn(i)).append("></td>\n");
            }
            sb.append("  </tr>\n");
        }
        sb.append("</table>");
        return sb.toString();
    }
}