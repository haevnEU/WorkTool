package de.haevn.snippetmanage.xml;

import de.haevn.snippetmanage.common.utils.pdfv2.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.*;

@Service
public class ValidationSchemaPdfGenerator {

    public byte[] createDocumentationAsBytes(final ValidationSchema schema) throws IOException {
        // 1. Dokument erstellen
        PdfMeta meta = new PdfMeta(schema.getSchemaName(), "Auto-generated Documentation");
        CustomPdfDocument doc = new CustomPdfDocument(meta);

        // 2. Seite 1 erstellen
        PdfPage titlePage = createTitlePage(schema);
        doc.addPage(titlePage);

        createRules(schema, doc);

        return doc.toBytes();

    }

    public PdfPage createTitlePage(ValidationSchema schema) {
        PdfPage page = new PdfPage();

        float tableY = 450;
        float tableWidth = 400;
        float startX = (PDRectangle.A4.getWidth() - tableWidth) / 2;

        // Datum Formatieren
        SimpleDateFormat sdf = new SimpleDateFormat("EEEE, d. MMMM yyyy, HH:mm 'Uhr'", Locale.GERMANY);
        String currentDate = sdf.format(new Date());

        String titleText = "Dokumentation für " + schema.getReadableName();
        String subTitle = "Erstellt am: " + currentDate;
        // A. Titel (Mittig, Oberes 1/3 -> Y=700)
        page.addObject(new PdfText(
                titleText,
                700,
                18,
                Color.BLACK
        ));

        // B. Datum (Unter dem Titel)
        page.addObject(new PdfText(
                subTitle,
                670,
                10,
                Color.GRAY
        ));
        // C. Auflistung (Tabelle ohne Rahmen)
        String[][] tableData = {
                {"Schemaname:", schema.getReadableName()},
                {"XML Dateiname:", schema.getSchemaName()},
                {"ID Name (Schlüssel):", schema.getIdName()},
                {"ID-Spalte (Index):", schema.getIdColumn() + ""},
                {"Header-Erkennung:", schema.getHeaderIdentifier()},
                {"Anzahl Spalten:", schema.getTotalColumns() + ""}
        };

        // Konfiguration: Linke Spalte Links (40%), Rechte Spalte Rechts (60%)
        float[] colWeights = {4, 6};
        TextAlign[] alignments = {TextAlign.LEFT, TextAlign.LEFT};

        PdfTable infoTable = new PdfTable(
                startX,
                tableY,
                tableWidth,
                20,         // Zeilenhöhe
                tableData,
                colWeights,
                false,      // drawBorders = FALSE
                alignments
        );

        page.addObject(infoTable);

        return page;
    }

    public PdfPage createNotePage() {
        PdfPage page = new PdfPage();

        float pageWidth = PDRectangle.A4.getWidth();

        String noteTitle = "Hinweise zur Validierungsdokumentation";
        String noteContent = "Diese Dokumentation wurde automatisch generiert und dient als Referenz für die Validierungen des angegebenen Schemas. " +
                "Bitte beachten Sie, dass Änderungen am Schema die Validierungsregeln beeinflussen können. " +
                "Für detaillierte Informationen zu den einzelnen Validierungen konsultieren Sie bitte die zugehörige technische Dokumentation oder wenden Sie sich an den Systemadministrator.";

        return page;
    }

    private String getExcelColumnName(int columnIndex) {
        StringBuilder columnName = new StringBuilder();
        while (columnIndex >= 0) {
            int remainder = columnIndex % 26;
            columnName.insert(0, (char) (remainder + 'A'));
            columnIndex = (columnIndex / 26) - 1;
        }
        return columnName.toString();
    }

    String[][] ruleToTable(List<FormatRule> rules) {
        String[] headers = {"Feldname", "Spalte", "Excel", "Pflicht", "Regex / Auswahl", "Fehlercode", "Fehlermeldung"};
        String[][] data = new String[rules.size() + 1][headers.length];
        data[0] = headers;
        int rowIndex = 1;
        for (FormatRule rule : rules) {
            data[rowIndex][0] = rule.getFieldName();
            data[rowIndex][1] = String.valueOf(rule.getColumn());
            data[rowIndex][2] = getExcelColumnName(rule.getColumn());
            data[rowIndex][3] = rule.isOptional() ? "Nein" : "Ja";
            String ruleContent = "";
            if (rule.getRegex() != null && !rule.getRegex().isEmpty()) {
                ruleContent = rule.getRegex();
            } else if (rule.getChoice() != null && !rule.getChoice().isEmpty()) {
                ruleContent = String.join(";\n", rule.getChoice().split(";"));
            } else {
                ruleContent = "";
            }
            data[rowIndex][4] = ruleContent;
            data[rowIndex][5] = rule.getErrorCode() != null ? rule.getErrorCode() : "";
            data[rowIndex][6] = rule.getErrorMessage() != null ? rule.getErrorMessage() : "";
            rowIndex++;
        }
        return data;
    }

    public void createRules(ValidationSchema schema, CustomPdfDocument doc) {
        final List<FormatRule> rules = new ArrayList<>();
        rules.addAll(schema.getMandatory());
        rules.addAll(schema.getOptional());

        rules.sort(Comparator.comparingInt(FormatRule::getColumn));

        final String[][] tableData = ruleToTable(rules);
        MultiPageTable rulesTable = new MultiPageTable(
                tableData,
                20,
                750,
                PDRectangle.A4.getWidth() - 40,
                20,
                new float[]{2, 1, 1, 1, 4, 2, 3}, // Gewichte der Spalten
                true,
                new TextAlign[]{
                        TextAlign.LEFT,
                        TextAlign.CENTER,
                        TextAlign.CENTER,
                        TextAlign.CENTER,
                        TextAlign.LEFT,
                        TextAlign.LEFT,
                        TextAlign.LEFT
                }
        );


        PdfPage page = new PdfPage();
        doc.addPage(page);


        rulesTable.drawToDocument(doc, page);

    }
}
