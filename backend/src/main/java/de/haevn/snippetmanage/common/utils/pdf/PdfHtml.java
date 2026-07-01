package de.haevn.snippetmanage.common.utils.pdf;

import java.util.ArrayList;
import java.util.List;

/**
 * Eine Datenklasse, die HTML-Inhalt für den PDF-Export repräsentiert.
 * Sie verwenden diese Klasse, um den HTML-Inhalt zu übergeben,
 * und rufen dann PdfDocument.addHtmlPages() auf, um ihn zu rendern
 * und dem Dokument hinzuzufügen.
 *
 * Dies ist eine Builder-Klasse, um HTML-Strukturen flüssig zu erstellen.
 */
public class PdfHtml {

    // Liste für die einzelnen HTML-Element-Strings
    private final List<String> elements = new ArrayList<>();

    // Speicher für zusätzliches, benutzerdefiniertes CSS
    private String customCss = "";

    /**
     * Standard-Konstruktor.
     */
    public PdfHtml() {
        // Startet einen leeren HTML-Builder
    }

    // --- ÖFFENTLICHE BUILDER-METHODEN ---

    /**
     * Fügt einen rohen HTML-Element-String hinzu.
     * @param element Ein vollständiger HTML-String (z.B. "<div>Hallo</div>")
     * @return this (für flüssige Verkettung)
     */
    public PdfHtml addElement(String element) {
        elements.add(element);
        return this;
    }

    /**
     * Fügt eine Überschrift der Ebene 1 hinzu.
     * @param text Der Text für die Überschrift.
     * @return this
     */
    public PdfHtml addH1(String text) {
        elements.add(String.format("<h1>%s</h1>", escapeHtml(text)));
        return this;
    }

    /**
     * Fügt eine Überschrift der Ebene 2 hinzu.
     * @param text Der Text für die Überschrift.
     * @return this
     */
    public PdfHtml addH2(String text) {
        elements.add(String.format("<h2>%s</h2>", escapeHtml(text)));
        return this;
    }

    /**
     * Fügt eine Überschrift der Ebene 3 hinzu.
     * @param text Der Text für die Überschrift.
     * @return this
     */
    public PdfHtml addH3(String text) {
        elements.add(String.format("<h3>%s</h3>", escapeHtml(text)));
        return this;
    }

    /**
     * Fügt einen Standard-Absatz hinzu.
     * @param text Der Text für den Absatz (HTML-Tags wie <b> oder <i> sind erlaubt).
     * @return this
     */
    public PdfHtml addParagraph(String text) {
        elements.add(String.format("<p>%s</p>", escapeHtml(text)));
        return this;
    }

    /**
     * Fügt eine unsortierte Liste (Bullet-Points) hinzu.
     * @param items Eine Liste von Strings für die Listeneinträge.
     * @return this
     */
    public PdfHtml addList(List<String> items) {
        StringBuilder sb = new StringBuilder();
        sb.append("<ul>");
        for (String item : items) {
            sb.append(String.format("<li>%s</li>", escapeHtml(item))); // Erlaubt HTML im Item
        }
        sb.append("</ul>");
        elements.add(sb.toString());
        return this;
    }

    public PdfHtml addList(String title, List<String> items) {
        StringBuilder sb = new StringBuilder();
        sb.append("<ul>");
        sb.append(String.format("<strong>%s</strong>", escapeHtml(title)));
        for (String item : items) {
            sb.append(String.format("<li>%s</li>", escapeHtml(item))); // Erlaubt HTML im Item
        }
        sb.append("</ul>");
        elements.add(sb.toString());
        return this;
    }

    /**
     * Fügt eine sortierte (nummerierte) Liste hinzu.
     * @param items Eine Liste von Strings für die Listeneinträge.
     * @return this
     */
    public PdfHtml addOrderedList(List<String> items) {
        StringBuilder sb = new StringBuilder();
        sb.append("<ol>");
        for (String item : items) {
            sb.append(String.format("<li>%s</li>", escapeHtml(item))); // Erlaubt HTML im Item
        }
        sb.append("</ol>");
        elements.add(sb.toString());
        return this;
    }

    public PdfHtml addOrderedList(String title, List<String> items) {
        StringBuilder sb = new StringBuilder();
        sb.append("<ol>");
        sb.append(String.format("<strong>%s</strong>", escapeHtml(title)));
        for (String item : items) {
            sb.append(String.format("<li>%s</li>", escapeHtml(item))); // Erlaubt HTML im Item
        }
        sb.append("</ol>");
        elements.add(sb.toString());
        return this;
    }

    /**
     * Fügt einen Code-Block hinzu, ideal für Quellcode.
     * Der Inhalt wird automatisch HTML-escaped.
     * @param code Der rohe Quellcode.
     * @return this
     */
    public PdfHtml addCodeBlock(String code) {
        String escapedCode = escapeHtml(code);
        elements.add(String.format("<pre><code>%s</code></pre>", escapedCode));
        return this;
    }

    public PdfHtml addCodeBlock(String subTitle, String code) {
        String escapedCode = escapeHtml(code);
        elements.add(String.format("<strong>%s</strong><br><pre><code>%s</code></pre>", escapeHtml(subTitle), escapedCode));
        return this;
    }

    /**
     * Fügt ein Zitat (Blockquote) hinzu.
     * @param text Der Text des Zitats.
     * @return this
     */
    public PdfHtml addBlockquote(String text) {
        elements.add(String.format("<blockquote>%s</blockquote>", text)); // Erlaubt HTML
        return this;
    }

    /**
     * Fügt eine horizontale Trennlinie hinzu.
     * @return this
     */
    public PdfHtml addHorizontalRule() {
        elements.add("<hr>");
        return this;
    }

    /**
     * Fügt eine HTML-Tabelle hinzu.
     * @param headers Spaltenüberschriften (kann null oder leer sein).
     * @param data Eine Liste von Listen für die Zeilendaten.
     * @return this
     */
    public PdfHtml addTable(List<String> headers, List<List<String>> data) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table>");

        // 1. Header
        if (headers != null && !headers.isEmpty()) {
            sb.append("<thead><tr>");
            for (String header : headers) {
                sb.append(String.format("<th>%s</th>", escapeHtml(header)));
            }
            sb.append("</tr></thead>");
        }

        // 2. Body
        sb.append("<tbody>");
        if (data != null) {
            for (List<String> row : data) {
                sb.append("<tr>");
                for (String cell : row) {
                    // Zelleninhalt nicht escapen, um HTML (z.B. <b>) zu erlauben
                    sb.append(String.format("<td>%s</td>", cell));
                }
                sb.append("</tr>");
            }
        }
        sb.append("</tbody></table>");
        elements.add(sb.toString());
        return this;
    }

    /**
     * Fügt eine benutzerdefinierte CSS-Regel zum <style>-Block im <head> hinzu.
     * @param cssRule z.B. ".meineKlasse { color: red; }"
     * @return this
     */
    public PdfHtml addCustomCss(String cssRule) {
        this.customCss += cssRule + "\n";
        return this;
    }


    // --- INTERNE METHODEN ---

    /**
     * Interner Getter für den HTML-Inhalt.
     * Baut das gesamte HTML-Dokument zusammen.
     * @return Den vollständigen HTML-String.
     */
    String getHtmlContent() {
        // **WICHTIGE KORREKTUR:**
        // Elemente mit "\n" (oder "") statt "<br>" verbinden.
        // Block-Elemente wie <p> oder <h1> erzeugen ihren eigenen Zeilenumbruch (Margin).
        // Ein zusätzliches <br> würde zu doppelten Abständen führen.
        String content = String.join("\n", elements);

        String defaultCss = """
            body { font-family: sans-serif; font-size: 10px; }
            h1 { color: #333; font-size: 20px; border-bottom: 2px solid #ccc; padding-bottom: 5px;}
            h2 { color: #444; font-size: 16px; }
            h3 { color: #555; font-size: 14px; }
            p { font-size: 12px; line-height: 1.5; }
            .highlight { background-color: yellow; }
            ul, ol { padding-left: 20px; }
            li { margin-bottom: 5px; }
            pre { background-color: #f5f5f5; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace; white-space: pre-wrap; }
            code { font-family: monospace; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            blockquote { border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0; font-style: italic; color: #555; }
            hr { border: 0; border-top: 1px solid #ddd; margin-top: 15px; margin-bottom: 15px; }
            """;

        String finalCss = defaultCss + customCss;

        return "<html><head><meta charset=\"UTF-8\"></meta><style>" + finalCss + "</style></head><body>" + content + "</body></html>";
    }

    /**
     * Einfache Hilfsmethode, um HTML-Sonderzeichen zu escapen.
     * Verhindert, dass z.B. "<" als Tag-Anfang interpretiert wird.
     */
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}