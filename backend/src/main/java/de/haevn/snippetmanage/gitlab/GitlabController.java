package de.haevn.snippetmanage.gitlab;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestApiController(value = "/api/git", tagName = "GitLab Info", description = "Controller for GitLab information and metadata")
public class GitlabController {

    private final GitlabService gitlabService;

    public GitlabController(GitlabService gitlabService) {
        this.gitlabService = gitlabService;
    }

    @GetMapping("/merge-request/{state}")
    List<MergeRequest> listMergeRequests(@PathVariable("state") String state) {
        return gitlabService.listMergeRequests(state);
    }

    @GetMapping("/pipeline/{id}")
    Pipeline listPipeline(@PathVariable("id") long id) {
        return gitlabService.getPipeline(id);
    }
}
