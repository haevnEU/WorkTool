package de.haevn.snippetmanage.redmine.repository;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import java.io.IOException;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@RestApiController("/api/issue-file")
public class IssueFileRepository {
    private final IssueFileService issueFileService;

    public IssueFileRepository(final IssueFileService issueFileService) {
        this.issueFileService = issueFileService;
    }

    @GetMapping("/get")
    public List<IssueFile> getIssue() {
        return issueFileService.getAllIssues();
    }

    @GetMapping("/get/{id}")
    public IssueFile getIssue(@PathVariable("id") String id) {
        return issueFileService.getIssueByTicketId(id);
    }

    @PostMapping("/set-note/{id}")
    public void setNote(@PathVariable("id") String id, @RequestBody String note) {
        issueFileService.setNote(id, note);
    }

    @PostMapping(path = "/add-image/{id}/{name}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void addImage(@PathVariable("id") String id, @PathVariable("name") String name, @RequestPart("files") MultipartFile[] files) throws Exception {
        for (final MultipartFile file : files) {
            issueFileService.addImage(id, file.getOriginalFilename(), file.getBytes());
        }
    }

    @DeleteMapping("/image/delete/{id}/{name}")
    public void deleteImage(@PathVariable("id") String id, @PathVariable("name") String name) throws IOException {
        issueFileService.delete(id, name);
    }
    @DeleteMapping("/delete/{id}")
    public void deleteIssue(@PathVariable("id") String id) {

    }

}
