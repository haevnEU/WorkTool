package de.haevn.snippetmanage.gitlab;

import java.util.List;
import java.util.Objects;
import lombok.Data;

@Data
public class MergeRequest {
    private  long id;
    private  long iid;
    private  long project_id;
    private  String title;
    private  String description;
    private  String state;
    private  String created_at;
    private  String updated_at;
    private  String target_branch;
    private  String source_branch;
    private  User author;
    private  User assignee;
    private  List<User> reviewers;
    private  String merge_status;
    private  String detailed_merge_status;
    private  String web_url;
    private  boolean has_conflicts;
    private  boolean blocking_discussions_resolved;
    private  Pipeline pipeline;
    private  Pipeline head_pipeline;

}
