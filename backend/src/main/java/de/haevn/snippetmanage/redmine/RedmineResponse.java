package de.haevn.snippetmanage.redmine;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import de.haevn.snippetmanage.common.exception.InternalServerErrorException;
import lombok.Data;

import java.io.File;
import java.util.List;

@Data
public class RedmineResponse {
    private List<Issue> issues;

    @JsonProperty("total_count")
    private int totalCount;
    private int offset;
    private int limit;

    public static RedmineResponse fromFile(File f) {
        ObjectMapper objectMapper = new JsonMapper();
        try {
            return objectMapper.readValue(f, RedmineResponse.class);
        } catch (Exception e) {
            throw new InternalServerErrorException("Failed to read RedmineResponse from file", e);

        }
    }

    public void toFile(File f) {
        ObjectMapper objectMapper = new JsonMapper();
        try {
            objectMapper.writeValue(f, this);
        } catch (Exception e) {
            throw new InternalServerErrorException("Failed to write RedmineResponse to file", e);
        }
    }
}
