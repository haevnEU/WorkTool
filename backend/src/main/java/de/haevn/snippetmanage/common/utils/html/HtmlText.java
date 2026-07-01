package de.haevn.snippetmanage.common.utils.html;

public class HtmlText implements IHtmlElement{

    private String text = "";

    public HtmlText(String text){
        this.text = HtmlDoc.sanitize(text);
    }

    @Override
    public String toHtml() {
        return "<p>" + text + "</p>";
    }
}
