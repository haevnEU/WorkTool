package de.haevn.snippetmanage.gitlab;

public record User(long id, String username, String name, String state, boolean locked, String avatar_url, String web_url) {
}
