package de.haevn.snippetmanage.redmine;

import java.util.List;

public final class TicketMapper {
    private TicketMapper(){
        // Private constructor to prevent instantiation
    }

    public static TicketResponse mapToTicketResponse(Issue issue, String url) {
        TicketResponse response = new TicketResponse();
        response.setTicketId(issue.getId());
        response.setTitle(issue.getSubject());
        response.setDescription(issue.getDescription());
        response.setEstimatedHours(issue.getEstimatedHours());
        response.setSpentHours(issue.getSpentHours());
        response.setCreatedOn(issue.getCreatedOn() + " TEST");
        response.setLastUpdatedOn(issue.getUpdatedOn());
        response.setTracker(issue.getTracker().getName());
        response.setProject(issue.getProject().getName());
        response.setStatus(issue.getStatus());

        // Extract Merge Request URL from custom fields
        if (issue.getCustomFields() != null) {
            for (CustomField field : issue.getCustomFields()) {
                if ("Merge Request URL".equalsIgnoreCase(field.getName())) {
                    response.setMergeRequestUrl(field.getValue());
                    break;
                }
            }
        }

        // Construct repository URL and ticket URL
        if (issue.getProject() != null) {
            response.setTicketUrl(url + "/issues/" + issue.getId());
        }

        response.setJournals(issue.getJournals());
        response.setChecklist(issue.getChecklist());
        return response;
    }

    public static List<TicketResponse> mapToTicketResponse(List<Issue> issues, String url) {
        return issues.stream()
                .map(issue -> mapToTicketResponse(issue, url))
                .toList();
    }
}
