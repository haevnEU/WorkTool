// java
package de.haevn.snippetmanage.share;

import lombok.Data;

@Data
class ShareDTO {
    private String shortId;
    private String password;
    private long creationDate;
    private long expirationDate;
    private String content;
    private String language;
    private String shareType;


    public static ShareDTO fromShare(Share share) {
        ShareDTO dto = new ShareDTO();
        dto.setShortId(share.getShortId());
        dto.setPassword(share.getPassword());
        dto.setCreationDate(share.getCreationDate());
        dto.setExpirationDate(share.getExpirationDate());
        dto.setContent(new String(share.getData())); // assuming data is stored as byte[]
        dto.setLanguage(share.getLanguage());
        dto.setShareType(share.getShareType());
        return dto;
    }
}