// java
package de.haevn.snippetmanage.common.utils.html;

public class HtmlHeading implements IHtmlElement {
    public static enum HeadingLevel {
        H1, H2, H3, H4, H5, H6
    }

    public static HtmlHeading h1(String text) { return new HtmlHeading(HeadingLevel.H1, text); }
    public static HtmlHeading h2(String text) { return new HtmlHeading(HeadingLevel.H2, text); }
    public static HtmlHeading h3(String text) { return new HtmlHeading(HeadingLevel.H3, text); }
    public static HtmlHeading h4(String text) { return new HtmlHeading(HeadingLevel.H4, text); }
    public static HtmlHeading h5(String text) { return new HtmlHeading(HeadingLevel.H5, text); }
    public static HtmlHeading h6(String text) { return new HtmlHeading(HeadingLevel.H6, text); }

    public static HtmlHeading h1(String text, boolean center) { return new HtmlHeading(HeadingLevel.H1, text, center); }
    public static HtmlHeading h2(String text, boolean center) { return new HtmlHeading(HeadingLevel.H2, text, center); }
    public static HtmlHeading h3(String text, boolean center) { return new HtmlHeading(HeadingLevel.H3, text, center); }
    public static HtmlHeading h4(String text, boolean center) { return new HtmlHeading(HeadingLevel.H4, text, center); }
    public static HtmlHeading h5(String text, boolean center) { return new HtmlHeading(HeadingLevel.H5, text, center); }
    public static HtmlHeading h6(String text, boolean center) { return new HtmlHeading(HeadingLevel.H6, text, center); }


    private final HeadingLevel level;
    private final String text;
    private final boolean center;

    public HtmlHeading(HeadingLevel level, String text) {
        this(level, text, false);
    }

    public HtmlHeading(HeadingLevel level, String text, boolean center) {
        this.level = level;
        this.text = HtmlDoc.sanitize(text);
        this.center = center;
    }

    public HtmlHeading(String text) {
        this(HeadingLevel.H1, text);
    }

    public HtmlHeading(String text, boolean center) {
        this(HeadingLevel.H1, text, center);
    }

    /**
     * Return a new instance with centering enabled.
     */
    public HtmlHeading withCenter(boolean center) {
        return new HtmlHeading(this.level, this.text, center);
    }

    /**
     * Convenience: enable centering.
     */
    public HtmlHeading center() {
        return withCenter(true);
    }

    @Override
    public String toHtml() {
        String tag = level.name().toLowerCase();
        String style = center ? " style=\"text-align:center;\"" : "";
        return "<" + tag + style + ">" + text + "</" + tag + ">";
    }
}