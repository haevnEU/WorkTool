package de.haevn.snippetmanage.redmine;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class Issue {
    private int id;
    private Tracker tracker;
    private Project project;
    private String subject;
    private String description;
    private Status status;

    @JsonProperty("start_data")
    private String startData;

    @JsonProperty("estimated_hours")
    private long estimatedHours;

    @JsonProperty("spent_hours")
    private long spentHours;

    @JsonProperty("total_spent_hours")
    private long totalSpentHours;

    @JsonProperty("custom_fields")
    private List<CustomField> customFields;

    @JsonProperty("created_on")
    private String createdOn;

    @JsonProperty("updated_on")
    private String updatedOn;

    @JsonProperty("journals")
    private List<Journal> journals;

    @JsonIgnore
    @JsonProperty("checklist")
    private List<ChecklistResponseDTO> checklist;

    public static record IssueWrapper(Issue issue) {
    }
}
