package de.haevn.snippetmanage.redmine;

import java.util.List;
import lombok.Data;

@Data
public class ChecklistResponse {
    List<ChecklistResponseDTO> checklists;
    int total_count;
}
