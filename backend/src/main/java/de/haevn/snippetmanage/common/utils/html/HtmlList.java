package de.haevn.snippetmanage.common.utils.html;

public class HtmlList implements IHtmlElement {
    private final java.util.List<IHtmlElement> items = new java.util.ArrayList<>();
    private final boolean ordered;
    private final String title;

    public HtmlList(boolean ordered) {
        this(ordered, null);
    }

    public HtmlList(boolean ordered, String title) {
        this.ordered = ordered;
        this.title = HtmlDoc.sanitize(title);
    }

    public HtmlList addItem(IHtmlElement item) {
        items.add(item);
        return this;
    }

    public HtmlList addItem(String item) {
        items.add(new HtmlText(item));
        return this;
    }


    @Override
    public String toHtml() {
        StringBuilder sb = new StringBuilder();
        sb.append(ordered ? "<ol>" : "<ul>");
        if(title != null && !title.isEmpty()) {
            sb.append("<strong>").append(title).append("</strong>");
        }
        for (IHtmlElement item : items) {
            sb.append("<li>").append(item.toHtml()).append("</li>");
        }
        sb.append(ordered ? "</ol>" : "</ul>");
        return sb.toString();
    }
}
