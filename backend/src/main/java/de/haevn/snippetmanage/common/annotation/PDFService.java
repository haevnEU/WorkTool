package de.haevn.snippetmanage.common.annotation;


import com.lowagie.text.Document;

import java.util.ArrayList;
import java.util.List;

public class PDFService {
    private final String author;
    private final String subject;
    private final String creator;
    private final List<String> keywords = new ArrayList<>();
    private String title;

    public PDFService(String subject) {
        this.author = "DashboardManager";
        this.subject = subject;
        this.creator = "DashboardManager";
    }

    public PDFService addTitle(String title) {
        this.title = title;
        return this;
    }

    public PDFService addKeywords(String... kws) {
        keywords.addAll(List.of(kws));
        return this;
    }

    public void appendToDoc(Document document) {
        document.addAuthor(author);
        document.addSubject(subject);
        document.addCreator(creator);
        if (!keywords.isEmpty()) {
            document.addKeywords(String.join(", ", keywords));
        }

        if (title != null && !title.isBlank()) {
            document.addTitle(title);
        }
    }


}
