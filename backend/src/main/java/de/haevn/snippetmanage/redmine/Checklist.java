package de.haevn.snippetmanage.redmine;

import lombok.Data;

@Data
public class Checklist {
    long issue_id;
    String subject;
    int is_done;
}
