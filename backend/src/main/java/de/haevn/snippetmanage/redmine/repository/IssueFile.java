package de.haevn.snippetmanage.redmine.repository;

import de.haevn.snippetmanage.common.utils.FileService;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@Entity(name = "issue_file")
public class IssueFile {

    @Transient
    private List<FileService.FileObject> imageList = new ArrayList<>();

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String ticketId;
    private String url;
    private String title;
    private String notes;
}