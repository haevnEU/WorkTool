package de.haevn.snippetmanage.common.utils.pdfv2;

public class TableCell {
    private String content;
    private float width;

    public TableCell(String content, float width) {

        this.content = content;
        this.width = width;
    }

    public TableCell(String content) {
        this(content, -1); // Default width
    }

    public String getContent() {
        return content;
    }

    public float getWidth() {
        return width;
    }
}
