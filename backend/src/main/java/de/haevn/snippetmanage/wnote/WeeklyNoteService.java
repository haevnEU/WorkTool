package de.haevn.snippetmanage.wnote;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import de.haevn.snippetmanage.common.annotation.PDFService;
import de.haevn.snippetmanage.common.exception.BadRequestException;
import de.haevn.snippetmanage.common.exception.NotFoundException;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
class WeeklyNoteService {
    private final WeeklyNoteRepository repository;

    public WeeklyNoteService(WeeklyNoteRepository repository) {
        this.repository = repository;
    }

    public boolean createNote(WeeklyNote weeklyNote) {
        weeklyNote.setId(null);
        repository.save(weeklyNote);
        return true;
    }

    public boolean updateNote(WeeklyNote note, String id) {
        var existingNote = repository.findAll().stream().filter(n -> n.getId().equalsIgnoreCase(id)).findFirst()
            .orElseThrow(NotFoundException::new);

        existingNote.setMonday(note.getMonday());
        existingNote.setTuesday(note.getTuesday());
        existingNote.setWednesday(note.getWednesday());
        existingNote.setThursday(note.getThursday());
        existingNote.setFriday(note.getFriday());

        repository.save(existingNote);
        return true;
    }

    public boolean deleteNote(String id) {
        if (id == null || !repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public Optional<WeeklyNote> getNote(String id) {
        if (id == null || !repository.existsById(id)) {
            return Optional.empty();
        }

        return repository.findById(id);
    }

    public List<WeeklyNote> getAllNotes() {
        return repository.findAll();
    }

    public Integer getTextLimit() {
        return 4096;
    }

    private void addWeek(Document document, String name, String... items) {
        var overview = new com.lowagie.text.List(false, 10);
        Font headingFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        Font regularFontBold = new Font(Font.HELVETICA, 12, Font.BOLD);
        Font regularFont = new Font(Font.HELVETICA, 12, Font.NORMAL);
        Font regularFontItalic = new Font(Font.HELVETICA, 12, Font.ITALIC);
        document.add(new Paragraph(name, headingFont));
        for (String item : items) {
            if (item.startsWith("**")) {
                item = item.replace("**", "");
                document.add(new Paragraph(item, regularFontBold));
            } else if (item.startsWith("*")) {
                item = item.replace("*", "");
                document.add(new Paragraph(item, regularFontItalic));
            } else if (item.startsWith("-")) {
                item = item.replace("-", "•");
                document.add(new Paragraph(item, regularFont));
            } else {
                overview.add(new Paragraph(item, regularFont));
            }
        }

        document.add(overview);
    }

    private String mapDateToString(String date) {
        final String[] month =
            {"Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November",
                "Dezember"};

        String[] parts = date.split("T")[0].split("-");
        int year = Integer.parseInt(parts[0]);
        int monthIndex = Integer.parseInt(parts[1]) - 1;
        int day = Integer.parseInt(parts[2]);

        String dayStr = String.format("%02d", day);

        return dayStr + " " + month[monthIndex] + " " + year;

    }

    public Optional<byte[]> printNoteToPDF(final String id) {
        WeeklyNote weeklyNote = repository.findById(id).orElseThrow(NotFoundException::new);
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            new PDFService("Developer Meeting Export").addTitle("DeveloperNote " + id)
                .addKeywords("DeveloperNote", "DashboardManager").appendToDoc(document);
            // Abschnitt für Montag
            com.lowagie.text.Font headingFont =
                new Font(com.lowagie.text.Font.HELVETICA, 16, com.lowagie.text.Font.BOLD);

            document.add(createDateCell(weeklyNote, headingFont));
            document.add(new Paragraph(" "));
            addWeek(document, "Dienstag", weeklyNote.getTuesday().split("\n"));
            addWeek(document, "Mittwoch", weeklyNote.getWednesday().split("\n"));
            addWeek(document, "Donnerstag", weeklyNote.getThursday().split("\n"));
            addWeek(document, "Freitag", weeklyNote.getFriday().split("\n"));
            addWeek(document, "Montag", weeklyNote.getMonday().split("\n"));

            String other = weeklyNote.getOther();
            if (other == null || other.isBlank()) {
                other = "";
            }
            addWeek(document, "Sonstiges", other.split("\n"));
            document.close();

            return Optional.of(baos.toByteArray());
        } catch (DocumentException | java.io.IOException e) {
            throw new BadRequestException("PDF creation failed: " + e.getMessage());
        }
    }


    private PdfPTable createDateCell(WeeklyNote weeklyNote, Font headingFont) {
        PdfPTable dateTable = new PdfPTable(2);
        dateTable.setWidthPercentage(100);
        dateTable.setWidths(new float[] {1f, 3f}); // label column narrower, value column wider
        dateTable.setSpacingBefore(4f);

        PdfPCell labelCell = new PdfPCell(new Paragraph("Startdatum:", headingFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(0);
        dateTable.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Paragraph(mapDateToString(weeklyNote.getStartDate())));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(0);
        dateTable.addCell(valueCell);

        PdfPCell labelCell2 = new PdfPCell(new Paragraph("Enddatum:", headingFont));
        labelCell2.setBorder(Rectangle.NO_BORDER);
        labelCell2.setPadding(0);
        dateTable.addCell(labelCell2);

        PdfPCell valueCell2 = new PdfPCell(new Paragraph(mapDateToString(weeklyNote.getEndDate())));
        valueCell2.setBorder(Rectangle.NO_BORDER);
        valueCell2.setPadding(0);
        dateTable.addCell(valueCell2);


        PdfPCell labelCell3 = new PdfPCell(new Paragraph("Woche:", headingFont));
        labelCell3.setBorder(Rectangle.NO_BORDER);
        labelCell3.setPadding(0);
        dateTable.addCell(labelCell3);

        PdfPCell valueCell3 = new PdfPCell(new Paragraph(weeklyNote.getWeekNumber()));
        valueCell3.setBorder(Rectangle.NO_BORDER);
        valueCell3.setPadding(0);
        dateTable.addCell(valueCell3);

        return dateTable;
    }
}
