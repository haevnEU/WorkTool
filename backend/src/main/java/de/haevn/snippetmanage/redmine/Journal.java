package de.haevn.snippetmanage.redmine;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Journal {
    private int id;
    private String notes;

    @JsonProperty("created_on")
    private String createdOn;

    private User user;
}