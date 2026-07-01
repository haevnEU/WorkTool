package de.haevn.snippetmanage.wnote;

import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "weekly_meeting_notes")
class WeeklyNote {
    @Id
    private String id;
    private String title = "";
    private String monday = "";
    private String tuesday = "";
    private String wednesday = "";
    private String thursday = "";
    private String friday = "";
    private String other = "";
    private String startDate = "";
    private String endDate = "";
    private String weekNumber = "";
}
