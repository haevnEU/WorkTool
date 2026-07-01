// java
package de.haevn.snippetmanage.share;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "shares")
class Share {
    @Id
    private String id; // can store UUID.toString() or Mongo ObjectId

    private String shortId;
    private String password;

    private long creationDate;
    private long expirationDate;
    private String language;
    private String shareType;

    @Field("data")
    private byte[] data;

    public static Share fromDTO(ShareDTO share) {
        Share s = new Share();
        s.setShortId(share.getShortId());
        s.setPassword(share.getPassword());
        s.setCreationDate(share.getCreationDate());
        s.setExpirationDate(share.getExpirationDate());
        s.setData(share.getContent().getBytes()); // assuming data is stored as byte[]
        s.setLanguage(share.getLanguage());
        s.setShareType(share.getShareType());
        return s;
    }

    public ShareMetaDTO toMetaDTO() {
        ShareMetaDTO dto = new ShareMetaDTO();
        dto.setShortId(this.shortId);
        dto.setCreationDate(this.creationDate);
        dto.setExpirationDate(this.expirationDate);
        dto.setShareType(this.shareType);
        return dto;
    }
}