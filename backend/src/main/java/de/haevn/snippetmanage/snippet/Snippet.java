package de.haevn.snippetmanage.snippet;

import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "snippets")
class Snippet {

    @Id
    private String id;

    private String title;
    private String code;
    private String language;

}
