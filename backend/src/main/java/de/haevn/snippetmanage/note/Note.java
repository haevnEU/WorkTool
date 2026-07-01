package de.haevn.snippetmanage.note;

import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "notes")
class Note {
    @Id
    private String id;
    @Field("code")
    private String content;
    private String title;
    private String createdAt;
    private String updatedAt;
}
