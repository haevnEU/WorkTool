package de.haevn.snippetmanage.xml;


import de.haevn.snippetmanage.common.utils.html.*;
import de.haevn.snippetmanage.common.utils.pdf.PdfDocument;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Component
public class ValidationSchemaPdfGeneratorV2 {

    private static final float[] COL_WIDTHS = {90, 35, 35, 40, 175, 45, 75};

    private static final float MARGIN = 50;

    public byte[] createDocumentationAsBytes(final ValidationSchema schema) throws IOException {
        try (final PdfDocument doc = createDocumentation(schema)) {
            return doc.getAsBytes();
        }
    }

    public PdfDocument createDocumentation(final ValidationSchema schema) throws IOException {
        final PdfDocument doc = new PdfDocument();
        boolean success = false;
        try {



            doc.addTitlePage(schema.getReadableName(), createTitlePageInfoMap(schema));

            String fontCss = """
//   
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    """;

            HtmlDoc titlePage = new HtmlDoc();
            titlePage.addElement(HtmlHeading.h1("Dokumentation für die Validierungen des Schemas", true));
            titlePage.addElement(HtmlHeading.h2("'" + schema.getReadableName() + "'", true));
            titlePage.addElement(new HtmlBR());
            titlePage.addElement(new HtmlBR());
            titlePage.addElement(new HtmlBR());
            titlePage.setCss(fontCss);

            HtmlTable introTable = new HtmlTable(2);
            introTable.setDimensions(1,1);
            introTable.addRow(new HtmlText("Erstellt am:"), new HtmlText(new Date().toString()));
            introTable.addRow(new HtmlBR());
            introTable.addRow(new HtmlText("Schema-Name:"), new HtmlText(schema.getSchemaName() != null ? schema.getSchemaName() : "N/A"));
            introTable.addRow(new HtmlText("ID-Name (Schlüssel):"), new HtmlText(schema.getIdName() != null ? schema.getIdName() : "N/A"));
            final String idColumnStr = schema.getIdColumn() +
                    " (Excel: " + getExcelColumnName(schema.getIdColumn()) + ")";
            introTable.addRow(new HtmlText("ID-Spalte (Index):"), new HtmlText(idColumnStr));
            introTable.addRow(new HtmlText("Header-Erkennung:"), new HtmlText(schema.getHeaderIdentifier() != null ? schema.getHeaderIdentifier() : "N/A"));
            String totalCols = String.valueOf(schema.getTotalColumns());
            if (totalCols.equals("-1")) totalCols = "N/A";
            introTable.addRow(new HtmlText("Gesamtspalten (erwartet):"), new HtmlText(totalCols));
            titlePage.addElement(introTable);


            doc.addHtmlPages(titlePage);






            HtmlDoc notePage = new HtmlDoc();

            final HtmlList list1 = new HtmlList(false, "Hinweise Zur Validierung");
            list1.addItem("Wird keine Fehlermeldung angegeben werden diese basierend auf den Angaben dynamisch generiert dabei wird eines der folgende Muster verwendet:");
            list1.addItem("Das Feld '<Feldname>' ist <optional/erforderlich> und muss dem Muster '<regex>' entsprechend.");
            list1.addItem("Das Feld '<Feldname>' ist <optional/erforderlich> und muss einen der folgenden enthalten: <erlaubte Werte>.");
            notePage.addElement(list1);

            final HtmlText paragraph1 = new HtmlText("Es wird entweder auf Regex oder Auswahl geprüft, nicht jedoch auf beide gleichzeitig. " +
                    "Hierbei ist zu beachten, dass Auswahl-Prüfungen priorisiert werden und eine Regex-Prüfung nicht durchgeführt wird.");
            notePage.addElement(paragraph1);

            final HtmlList list2 = new HtmlList(false, "Das Validierungssystem arbeitet wie folgt:");
            list2.addItem("Prüfen ob der Wert in der Zelle vorhanden ist, wenn nein wird der status optional zurück gegeben.");
            list2.addItem("Wenn eine Auswahl angegeben ist, wird geprüft ob der Wert in der Auswahl enthalten ist und der entsprechende Status zurückgegeben.");
            list2.addItem("Wenn eine Regex angegeben ist, wird geprüft ob der Wert dem Regex entspricht und der entsprechende Status zurückgegeben.");
            list2.addItem("Wenn weder eine Auswahl noch ein Regex angegeben ist, wird der Status erfolgreich zurückgegeben.");
            notePage.addElement(list2);

            final HtmlList list3 = new HtmlList(false, "Hinweis zu Auswahl-Werten:");
            list3.addItem("Mehrere erlaubte Werte sind durch Semikolons zu trennen.");
            list3.addItem("Leerzeichen um die Werte werden ignoriert.");
            list3.addItem("Die Groß-/Kleinschreibung wird berücksichtigt.");
            notePage.addElement(list3);

            String css = """
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        vertical-align: top;
                    }
                    
                    th {
                        background-color: #f2f2f2;
                        text-align: left;
                    }
                    
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    
                    ul, ol {
                        margin-top: 10px;
                        margin-bottom: 10px;
                    }
                    """;

            notePage.setCss(css);
            doc.addHtmlPages(notePage);

            HtmlDoc rulePage = new HtmlDoc();

            rulePage.setCss(fontCss);
            HtmlTable htmlTable = createRuleTableNew(schema);
            rulePage.setCss(css);
            rulePage.addElement(htmlTable);
            doc.addHtmlPages(rulePage);

            success = true;
            return doc;
        } finally {
            if (!success) {
                doc.close();
            }
        }
    }

    HtmlTable createRuleTableNew(final ValidationSchema schema) {
        HtmlTable htmlTable = new HtmlTable(Arrays.asList(
                "Feldname", "Spalte", "Excel", "Pflicht",
                "Regex / Erlaubte Werte", "Fehler-Code", "Fehler-Meldung"
        ));
        htmlTable.setDimensions( 2, 1, 1, 1, 3, 1, 3);
        final List<FormatRule> allRules = new ArrayList<>();
        schema.getMandatory().forEach(rule -> {
            rule.setOptional(false); // Sicherstellen, dass der Status korrekt ist
            allRules.add(rule);
        });
        schema.getOptional().forEach(rule -> {
            rule.setOptional(true); // Sicherstellen, dass der Status korrekt ist
            allRules.add(rule);
        });
        allRules.sort(Comparator.comparing(FormatRule::getColumn));

        for (FormatRule rule : allRules) {
            String regex = rule.getRegex() != null && !rule.getRegex().isEmpty() ? rule.getRegex() : null;
            String choice = rule.getChoice() != null && !rule.getChoice().isEmpty() ? rule.getChoice() : null;
            String ruleContent = "";
            if (regex != null) {
                ruleContent = regex;
            } else if (choice != null) {
                ruleContent = String.join(";\n", choice.split(";"));
            }

            htmlTable.addRow(
                    new HtmlText(rule.getFieldName()),
                    new HtmlText(String.valueOf(rule.getColumn())),
                    new HtmlText(getExcelColumnName(rule.getColumn())),
                    new HtmlText(rule.isOptional() ? "Nein" : "Ja"),
                    new HtmlCode(ruleContent),
                    new HtmlCode(rule.getErrorCode() != null ? rule.getErrorCode() : ""),
                    new HtmlText(rule.getErrorMessage() != null ? rule.getErrorMessage() : "")
            );
        }


        htmlTable.setAllColumnsWrapping(true);
        return htmlTable;
    }

    /**
     * Erstellt die Daten-Map für die Titelseite.
     */
    private Map<String, String> createTitlePageInfoMap(final ValidationSchema schema) {
        final Map<String, String> info = new LinkedHashMap<>();
        info.put("Schema-Name:", schema.getSchemaName() != null ? schema.getSchemaName() : "N/A");
        info.put("ID-Name (Schlüssel):", schema.getIdName() != null ? schema.getIdName() : "N/A");

        final String idColumnStr = schema.getIdColumn() +
                " (Excel: " + getExcelColumnName(schema.getIdColumn()) + ")";
        info.put("ID-Spalte (Index):", idColumnStr);

        info.put("Header-Erkennung:", schema.getHeaderIdentifier() != null ? schema.getHeaderIdentifier() : "N/A");

        String totalCols = String.valueOf(schema.getTotalColumns());
        if (totalCols.equals("-1")) totalCols = "N/A";
        info.put("Gesamtspalten (erwartet):", totalCols);

        return info;
    }


    /**
     * Konvertiert einen 0-basierten Spaltenindex in einen Excel-Spaltennamen (A, B, ..., Z, AA, ...).
     */
    private String getExcelColumnName(int column) {
        if (column < 0) return "";

        final StringBuilder sb = new StringBuilder();
        while (column >= 0) {
            int remainder = column % 26;
            sb.append((char) (remainder + 'A'));
            column = (column / 26) - 1;
            if (column < -1) break; // Korrektur für 0-basiert
        }
        return sb.reverse().toString();
    }
}