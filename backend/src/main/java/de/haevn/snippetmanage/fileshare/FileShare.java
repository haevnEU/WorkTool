// java
package de.haevn.snippetmanage.fileshare;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "file_shares")
class FileShare {
    @Transient
    byte[] data;
    @Id
    private String id; // can store UUID.toString() or Mongo ObjectId
    private String shortId;
    private String password;
    private long creationDate;
    private long expirationDate;
    private String filename;
    private String hash;
}