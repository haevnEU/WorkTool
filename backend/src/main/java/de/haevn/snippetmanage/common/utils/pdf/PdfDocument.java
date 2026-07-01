package de.haevn.snippetmanage.common.utils.pdf;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import de.haevn.snippetmanage.common.exception.InternalServerErrorException;
import de.haevn.snippetmanage.common.utils.html.HtmlDoc;
import org.apache.pdfbox.Loader; // NEUER Import
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;

/**
 * Repräsentiert ein komplettes PDF-Dokument.
 * Diese Klasse ist AutoCloseable, um sicherzustellen, dass das
 * zugrundeliegende PDDocument immer geschlossen wird.
 *
 * Beispiel-Nutzung:
 * try (PdfDocument doc = new PdfDocument()) {
 * doc.addTitlePage("Titel", infoMap);
 *
 * PageCanvas page1 = doc.addPage();
 * page1.drawText(50, 700, "Hallo Welt");
 * page1.close(); // WICHTIG: Jede Seite nach dem Zeichnen schließen
 *
 * doc.addHtmlPages(new PdfHtml("<h1>Titel</h1>")); // HTML-Seiten hinzufügen
 *
 * doc.save("pfad/zur/datei.pdf");
 * }
 */
public class PdfDocument implements AutoCloseable {

    private final PDDocument document;

    /**
     * Erstellt ein neues, leeres PDF-Dokument.
     */
    public PdfDocument() {
        this.document = new PDDocument();
    }

    /**
     * Fügt eine standardmäßige A4-Inhaltsseite hinzu.
     * Sie MÜSSEN .close() auf dem zurückgegebenen PageCanvas aufrufen,
     * wenn Sie mit dem Zeichnen fertig sind.
     *
     * @return Ein PageCanvas-Objekt zum Zeichnen auf der neuen Seite.
     * @throws IOException Wenn der Content-Stream nicht erstellt werden kann.
     */
    public PageCanvas addPage() throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        this.document.addPage(page);
        return new PageCanvas(this.document, page);
    }

    /**
     * Fügt eine Titelseite mit einem Haupttitel und einer zentrierten
     * Key-Value-Informationskarte hinzu.
     *
     * @param title Der Haupttitel der Seite.
     * @param info  Eine Map von Key-Value-Paaren (z.B. "Autor", "Max Mustermann").
     * @throws IOException Wenn beim Zeichnen ein Fehler auftritt.
     */
    public void addTitlePage(String title, Map<String, String> info) throws IOException {
        TitlePageRenderer.draw(this.document, title, info);
    }

    /**
     * Rendert den Inhalt eines PdfHtml-Objekts (mithilfe von openhtmltopdf)
     * und fügt alle resultierenden Seiten diesem Dokument hinzu.
     *
     * @param html Das PdfHtml-Builder-Objekt, das den HTML-Code enthält.
     * @throws IOException Wenn das Rendern oder Importieren fehlschlägt.
     */
    public void addHtmlPages(HtmlDoc html) throws IOException {
        // 1. Rendere das HTML in ein *temporäres*, separates In-Memory-PDDocument
        PDDocument tempDoc = null;
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(html.getHtmlContent(), "file:/"); // Basis-URI (wichtig für relative Pfade)
            builder.toStream(baos);
            builder.run();

                // KORREKTUR: Verwende Loader.loadPDF statt PDDocument.load
                tempDoc = Loader.loadPDF(baos.toByteArray()); // Lade das gerenderte PDF

        }catch (Exception ex) {
            throw new InternalServerErrorException(ex);
        }

        // 2. Importiere alle Seiten aus dem temporären Dokument in das Hauptdokument
        if (tempDoc != null) {
            for (PDPage page : tempDoc.getPages()) {
                // Importiere die Seite in den Kontext unseres Hauptdokuments
                this.document.importPage(page);

                // (Optional) Manchmal ist es nötig, die Boxen anzupassen,
                // aber openhtmltopdf sollte korrekte A4-Seiten erstellen.
                // this.document.getPage(this.document.getNumberOfPages() - 1).setMediaBox(PDRectangle.A4);
            }

            // 3. Schließe das temporäre Dokument, um Speicher freizugeben
            tempDoc.close();
        }
    }


    /**
     * Speichert das Dokument im Dateisystem.
     *
     * @param path Der vollständige Pfad, einschließlich Dateiname.
     * @throws IOException Wenn das Speichern fehlschlägt.
     */
    public void save(String path) throws IOException {
        this.document.save(path);
    }

    /**
     * Speichert das Dokument im Dateisystem.
     *
     * @param path Der Pfad als Path-Objekt.
     * @throws IOException Wenn das Speichern fehlschlägt.
     */
    public void save(Path path) throws IOException {
        this.document.save(path.toFile());
    }

    /**
     * Exportiert das Dokument als Byte-Array.
     *
     * @return Ein Byte-Array des PDF-Dokuments.
     * @throws IOException Wenn das Speichern in den Stream fehlschlägt.
     */
    public byte[] getAsBytes() throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            this.document.save(baos);
            return baos.toByteArray();
        }
    }

    /**
     * Schließt das zugrundeliegende PDDocument.
     * Erforderlich durch AutoCloseable.
     *
     * @throws IOException Wenn das Schließen fehlschlägt.
     */
    @Override
    public void close() throws IOException {
        if (this.document != null) {
            this.document.close();
        }
    }

    /**
     * Gibt das interne PDDocument zurück, falls erweiterte PDFBox-Operationen
     * erforderlich sind.
     * @return Das PDDocument.
     */
    public PDDocument getInternalDocument() {
        return this.document;
    }
}