package de.haevn.snippetmanage.gitlab;

public record Pipeline(long id, long iid, long project_id, String sha, String ref, String status, String source, String created_at,
                       String updated_at, String web_url) { }
