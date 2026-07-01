package de.haevn.snippetmanage.redmine;

import lombok.Data;

@Data
public class Status {
    int id;
    String name;
    boolean is_closed;
}
