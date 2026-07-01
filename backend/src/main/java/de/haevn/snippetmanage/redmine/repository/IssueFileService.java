package de.haevn.snippetmanage.redmine.repository;

import de.haevn.snippetmanage.common.exception.NotFoundException;
import de.haevn.snippetmanage.common.utils.FileService;
import de.haevn.snippetmanage.redmine.Issue;
import java.io.IOException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class IssueFileService {
    private final FileService fileService;
    private final IssueRepository issueRepository;

    public IssueFileService(final IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
        fileService = new FileService("tickets");
    }

    public void storeIssue(Issue issue) {
        boolean ex = issueRepository.findByTicketId(String.valueOf(issue.getId())).isEmpty();
        if(!ex)return;
        final IssueFile issueFile = new IssueFile();
        issueFile.setNotes("");
        issueFile.setTitle(issue.getSubject());
        issueFile.setTicketId(String.valueOf(issue.getId()));
        issueRepository.save(issueFile);
    }

    public void setNote(String issueId, String note) {
        final IssueFile issueFile = issueRepository.findByTicketId(issueId).orElseThrow(NotFoundException::new);
        issueFile.setNotes(note);
        issueRepository.save(issueFile);
    }

    public void addImage(String issueId, String name, byte[] content) throws IOException {
        issueRepository.findByTicketId(issueId).orElseThrow(NotFoundException::new);
        fileService.storeFile(issueId, name, content);
    }

    public IssueFile getIssueByTicketId(String ticketId) {
        final IssueFile issueFile = issueRepository.findByTicketId(ticketId).orElseThrow(NotFoundException::new);
        try {
            issueFile.setImageList(fileService.listFiles(ticketId));
        } catch (IOException ignored) {
        }
        return issueFile;
    }

    public List<IssueFile> getAllIssues() {
        final List<IssueFile> issueFiles = issueRepository.findAll();
        for (IssueFile issueFile : issueFiles) {
            try {
                issueFile.setImageList(fileService.listFiles(String.valueOf(issueFile.getTicketId())));
            } catch (IOException ignored) {
            }
        }
        return issueFiles;
    }

    public void delete(final String id, final String name) throws IOException {
        fileService.deleteFile(id, name);
    }
}