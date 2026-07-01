package de.haevn.snippetmanage.common.utils.html;


public class HtmlCode implements IHtmlElement {
    private final String code;
    private final boolean preserveWhitespace;

    public HtmlCode(String code) {
        this(code, false);
    }

    /**
     * @param code the code text
     * @param preserveWhitespace when true uses <pre><code> to preserve exact whitespace/newlines (no wrapping).
     *                           when false uses inline <code> with CSS enabling wrapping.
     */
    public HtmlCode(String code, boolean preserveWhitespace) {
        this.code = code == null ? "" : code;
        this.preserveWhitespace = preserveWhitespace;
    }

    private String escapeHtml(String s) {
        return s
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    @Override
    public String toHtml() {
        String escaped = escapeHtml(code);
        if (preserveWhitespace) {
            // preserve exact formatting, don't enable wrapping
            return "<pre><code>" + escaped + "</code></pre>";
        } else {
            // allow wrapping inside table cells while keeping line breaks
            return "<code class=\"codeBlock\" >"
                    + escaped
                    + "</code>";
        }
    }
}