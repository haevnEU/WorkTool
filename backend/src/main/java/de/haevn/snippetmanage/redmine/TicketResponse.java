package de.haevn.snippetmanage.redmine;

import lombok.Data;

import java.util.List;

@Data
public class TicketResponse {
    private int ticketId;
    private String title;
    private String project;
    private String tracker;
    private String description;
    private long estimatedHours;
    private long spentHours;
    private String mergeRequestUrl;
    private String createdOn;
    private String lastUpdatedOn;
    private String repoUrl;
    private String ticketUrl;
    private List<Journal> journals;
    private List<ChecklistResponseDTO> checklist;
    private Status status;
}
