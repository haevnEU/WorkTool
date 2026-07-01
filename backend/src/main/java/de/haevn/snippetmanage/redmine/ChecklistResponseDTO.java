package de.haevn.snippetmanage.redmine;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ChecklistResponseDTO {
    long id;
    @JsonProperty("issue_id")
    long issueId;
    String subject;

    @JsonProperty("is_done")
    boolean isDone;
    int position;

    @JsonProperty("is_section")
    boolean isSection;

    @JsonProperty("created_at")
    String createdAt;

    @JsonProperty("updated_at")
    String updatedAt;
}
