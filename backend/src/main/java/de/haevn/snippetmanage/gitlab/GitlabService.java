package de.haevn.snippetmanage.gitlab;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import de.haevn.snippetmanage.redmine.RedmineResponse;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GitlabService {

    @Value("${secure.gitlab.token}")
    private String token;
    @Value("${secure.gitlab.url}")
    private String gitlabUrl;

    private String projectId = "250";

    private List<MergeRequest> mergeRequests =  new ArrayList<>();

    private final File file = new File("/data/pipeline.json");

    public GitlabService() {
        mergeRequests = readDebug();
    }

    public Pipeline getPipeline(long pipelineId) {
        final RestTemplate restTemplate = restTemplateWithApiKey();
        final String endpoint = gitlabUrl + "/" + projectId + "/pipelines/" + pipelineId;
        return restTemplate.getForObject(endpoint, Pipeline.class);
    }

    public List<MergeRequest> listMergeRequests(final String state) {
        if(!mergeRequests.isEmpty()){
            return  mergeRequests;
        }
        final RestTemplate restTemplate = restTemplateWithApiKey();
        final String endpoint = gitlabUrl + "/" + projectId + "/merge_requests?scope=assigned_to_me&status=" + state;
        var response = restTemplate.getForObject(endpoint, MergeRequest[].class);
        if(null == response) {
            return List.of();
        }

        mergeRequests = Arrays.stream(response).toList();
        refreshPipelines();
        debugSave();
        return mergeRequests;
    }


    List<Pipeline> refreshPipelines(){
        final RestTemplate restTemplate = restTemplateWithApiKey();
        for(MergeRequest mr : mergeRequests) {
                var endpoint = gitlabUrl + "/" + projectId + "/merge_requests/" + mr.getIid() + "/pipelines?per_page=1";
                var response = restTemplate.getForObject(endpoint, Pipeline[].class);
                if(response != null && response.length > 0) {
                    mr.setPipeline(response[0]);
                }

        }
        return List.of();
    }

    private RestTemplate restTemplateWithApiKey() {
        RestTemplate rt = new RestTemplate();
        rt.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("PRIVATE-TOKEN", token);
            request.getHeaders().setAccept(List.of(org.springframework.http.MediaType.APPLICATION_JSON));
            return execution.execute(request, body);
        });
        return rt;
    }


    List<MergeRequest> readDebug(){
        List<MergeRequest> result = new ArrayList<>();

        try{
            ObjectMapper mapper = new JsonMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            result = Arrays.asList(mapper.readValue(file, MergeRequest[].class));
        }catch (Exception ex){
            ex.printStackTrace();
        }
        return result;
    }

    void debugSave(){
        ObjectMapper mapper = new JsonMapper();
        try {
            mapper.writeValue(file, mergeRequests);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

}
