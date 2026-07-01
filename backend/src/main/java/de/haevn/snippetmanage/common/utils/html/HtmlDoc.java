package de.haevn.snippetmanage.common.utils.html;

import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

public final class HtmlDoc {

    private List<IHtmlElement> elements = new ArrayList<>();
    private List<String> css = new ArrayList<>();

    public HtmlDoc(){

        String baseCss = """
                  * {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                    };
                    body {
                        margin: 20px;
                    };
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    .codeBlock {
                       
                        font-family: "Courier New", Courier, monospace;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        overflow-wrap: anywhere;
                    }
                """;

        this.css.add(baseCss);
    }

    public static String sanitize(String input){
        if(input == null) return null;
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    public HtmlDoc addElement(IHtmlElement element){
        this.elements.add(element);
        return this;
    }

    public HtmlDoc setCss(String css){
        this.css.add(css);
        return this;
    }

    public String getCss(){
        StringBuilder sb = new StringBuilder();
        for(String cssPart : css){
            sb.append(cssPart).append("\n");
        }
        return sb.toString();
    }

    public String getHtmlContent(){
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n")
//          .append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></meta>\n")
          .append("<style>\n").append(getCss()).append("\n</style>\n")
          .append("<title>Document</title>\n</head>\n<body>\n");

        for(IHtmlElement element : elements){
            sb.append(element.toHtml()).append("\n");
        }

        sb.append("</body>\n</html>");
        return sb.toString();
    }

    public void exportAsHtmlFile(String filePath) throws IOException {
        Files.writeString(java.nio.file.Paths.get(filePath), getHtmlContent());
    }
}
