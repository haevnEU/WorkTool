package de.haevn.snippetmanage.share;

import lombok.Data;

@Data
class ShareMetaDTO {
    private String shortId;
    private long creationDate;
    private long expirationDate;
    private String shareType;
}
