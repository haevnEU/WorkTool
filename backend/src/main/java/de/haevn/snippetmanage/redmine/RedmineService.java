package de.haevn.snippetmanage.redmine;

import de.haevn.snippetmanage.common.exception.BadRequestException;
import de.haevn.snippetmanage.common.exception.NotFoundException;
import de.haevn.snippetmanage.redmine.repository.IssueFileService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class RedmineService {

    @Value("${haevn.application.redmine.tmp_file}")
    private String tmpFile;

    @Value("${secure.redmine.key}")
    private String apiKey;

    @Value("${secure.redmine.url}")
    private String url;

    @Value("${haevn.application.redmine.debug:false}")
    private boolean isDebug;

    private long updateTime = 0;
    private RedmineResponse response;
    private List<Integer> redmineIgnore;
    private final IssueFileService issueFileService;

    public RedmineService(final IssueFileService issueFileService) {
        this.issueFileService = issueFileService;
        try {
            redmineIgnore = Files.readAllLines(Path.of("/data/redmine/.redmineignore")).stream() //
                .filter(line -> !line.isBlank() && !line.startsWith("#")) //
                .map(Integer::parseInt) //
                .toList();
        } catch (IOException e) {
            redmineIgnore = List.of();
        }
    }

    public List<TicketResponse> getIssues(final Optional<String> type) {
        if (apiKey.isBlank()) {
            return List.of();
        }
        if (response == null) {
            refresh();
        }

        Predicate<Issue> filter = issue -> true;
        if (type.isPresent()) {
            switch (type.get().toLowerCase()) {
                case "bug" -> filter = issue -> issue.getTracker().getName().equalsIgnoreCase("bug");
                case "feature" -> filter = issue -> issue.getTracker().getName().equalsIgnoreCase("feature");
                case "support" -> filter = issue -> issue.getTracker().getName().equalsIgnoreCase("support");
                default -> throw new IllegalArgumentException("Unknown type: " + type.get());
            }
        }

        return response.getIssues() //
            .stream().filter(filter) //
            .map(issue -> TicketMapper.mapToTicketResponse(issue, url)) //
            .filter(ticket -> !redmineIgnore.contains(ticket.getTicketId()))
            .filter(ticket -> !ticket.getStatus().is_closed).filter(ticket -> ticket.getStatus().getId() != 1).toList();
    }

    public TicketResponse getIssues(final int id, final Optional<String> type) {
        if (apiKey.isBlank()) {
            return null;
        }
        List<TicketResponse> tickets = getIssues(type).stream().filter(ticket -> ticket.getTicketId() == id).toList();
        if (tickets.size() > 1) {
            throw new IllegalStateException("Multiple tickets found for id " + id);
        } else if (tickets.isEmpty()) {
            throw new IllegalStateException("No ticket found for id " + id);
        }
        return tickets.getFirst();

    }

    public void refresh() {
        final File f = new File(tmpFile);

        if (isDebug && f.exists()) {
            this.response = RedmineResponse.fromFile(f);
            return;
        }
        final RestTemplate restTemplate = restTemplateWithApiKey();
        final String endpoint = url + "/issues.json?assigned_to_id=me&include=journals";
        this.response = restTemplate.getForObject(endpoint, RedmineResponse.class);
        updateTime = System.currentTimeMillis();
        updateComments();
        updateChecklist();
        if (isDebug) {
            this.response.toFile(f);
        }
        updateMongo();
    }


    @SneakyThrows
    private void updateMongo(){
        for(Issue issue : response.getIssues()){
            issueFileService.storeIssue(issue);
        }
    }

    @SneakyThrows
    private void updateComments() {
        if (apiKey.isBlank()) {
            return;
        }

        RestTemplate restTemplate = restTemplateWithApiKey();
        for (Issue issue : response.getIssues()) {
            int id = issue.getId();
            String issueEndpoint = url + "issues/" + id + ".json?include=journals";
            Issue.IssueWrapper detailedIssue = restTemplate.getForObject(issueEndpoint, Issue.IssueWrapper.class);

            if (detailedIssue != null) {
                issue.setJournals(detailedIssue.issue().getJournals());
            }
        }

        createDirectoryStructureIfNotExists(response.getIssues());


        for (Issue issue : response.getIssues()) {
            var journals =
                issue.getJournals().stream().filter(j -> j.getNotes() != null && !j.getNotes().isBlank()).toList();
            issue.setJournals(new ArrayList<>(journals));
        }
    }

    private void updateChecklist() {
        if (apiKey.isBlank()) {
            return;
        }
        RestTemplate restTemplate = restTemplateWithApiKey();
        for (Issue issue : response.getIssues()) {
            int id = issue.getId();

            final String endpoint = url + "/issues/" + id + "/checklists.json";
            ChecklistResponse response = restTemplate.getForObject(endpoint, ChecklistResponse.class);


            if (response != null) {
                issue.setChecklist(response.getChecklists());
            }
        }

        for (Issue issue : response.getIssues()) {
            var journals =
                issue.getJournals().stream().filter(j -> j.getNotes() != null && !j.getNotes().isBlank()).toList();
            issue.setJournals(new ArrayList<>(journals));
        }
    }

    public long getLastUpdateTimestamp() {
        return updateTime;
    }

    private RestTemplate restTemplateWithApiKey() {
        RestTemplate rt = new RestTemplate();
        rt.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("X-Redmine-API-Key", apiKey);
            request.getHeaders().setAccept(List.of(org.springframework.http.MediaType.APPLICATION_JSON));
            return execution.execute(request, body);
        });
        return rt;
    }


    private ChecklistResponse hasAlreadyChecklist(final int ticketId) {
        if (apiKey.isBlank()) {
            return null;
        }

        final RestTemplate restTemplate = restTemplateWithApiKey();
        final String endpoint = url + "/issues/" + ticketId + "/checklists.json";
        ChecklistResponse response = restTemplate.getForObject(endpoint, ChecklistResponse.class);
        return response;
    }


    private void addCheckboxToTicket(final int ticketId, final String subject) {
        if (apiKey.isBlank()) {
            return;
        }

        final RestTemplate restTemplate = restTemplateWithApiKey();
        String endpoint = url + "issues/" + ticketId + "/checklists.json";
        Map<String, Object> checklist = Map.of("issue_id", ticketId, "subject", subject, "is_done", 0);
        Map<String, Object> body = Map.of("checklist", checklist);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(org.springframework.http.MediaType.APPLICATION_JSON));

        org.springframework.http.HttpEntity<Map<String, Object>> request =
            new org.springframework.http.HttpEntity<>(body, headers);

        String resp = restTemplate.postForObject(endpoint, request, String.class);
        System.out.println(resp);

    }


    public void addCheckboxToTicket(final int ticketId) {
        if (apiKey.isBlank()) {
            return;
        }

        final Issue issue = this.response.getIssues().stream().filter(issues -> issues.getId() == ticketId).findFirst()
            .orElseThrow(NotFoundException::new);

        if (issue.getTracker().getName() == null) {
            throw new BadRequestException("Ticket with id " + ticketId + " has no tracker");
        }

        final boolean isTask = issue.getTracker().getName().equalsIgnoreCase("task");
        ChecklistResponse existing = hasAlreadyChecklist(ticketId);
        if (existing == null || existing.getChecklists() == null || existing.getChecklists().isEmpty()) {
            addCheckboxToTicket(ticketId, "Dokumentation erstellt");
            if(isTask) {
                addCheckboxToTicket(ticketId, "AK geprüft");
            }
            addCheckboxToTicket(ticketId, "MR erstellt");
            addCheckboxToTicket(ticketId, "MR approved");
            addCheckboxToTicket(ticketId, "MR gemerged");
            return;
        }

        if (existing.getChecklists().stream().noneMatch(c -> c.getSubject().equals("Dokumentation erstellt"))) {
            addCheckboxToTicket(ticketId, "Dokumentation erstellt");
        }
        if (isTask && existing.getChecklists().stream().noneMatch(c -> c.getSubject().equals("AK geprüft"))) {
            addCheckboxToTicket(ticketId, "AK geprüft");
        }
        if (existing.getChecklists().stream().noneMatch(c -> c.getSubject().equals("MR erstellt"))) {
            addCheckboxToTicket(ticketId, "MR erstellt");
        }
        if (existing.getChecklists().stream().noneMatch(c -> c.getSubject().equals("MR approved"))) {
            addCheckboxToTicket(ticketId, "MR approved");
        }
        if (existing.getChecklists().stream().noneMatch(c -> c.getSubject().equals("MR gemerged"))) {
            addCheckboxToTicket(ticketId, "MR gemerged");
        }
    }

    public List<Integer> getIgnored() {
        return redmineIgnore;
    }

    public void addToIgnore(int ticketId) {
        if (!redmineIgnore.contains(ticketId)) {
            redmineIgnore.add(ticketId);
            flush();
        }
    }

    public void removeFromIgnore(int ticketId) {
        redmineIgnore.removeIf(id -> id == ticketId);

        flush();
    }

    void flush() {
        try {
            Files.write(Path.of("/data/redmine/.redmineignore"), redmineIgnore.stream().map(String::valueOf).toList());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public TicketResponse getGlobalIssue(final int ticketId) {
        if (apiKey.isBlank()) {
            return null;
        }
        try {
            final RestTemplate restTemplate = restTemplateWithApiKey();
            final String endpoint = url + "issues/" + ticketId + ".json?include=journals";
            Issue.IssueWrapper detailedIssue = restTemplate.getForObject(endpoint, Issue.IssueWrapper.class);

            if (detailedIssue == null) {
                throw new NotFoundException("Ticket with id " + ticketId + " not found");
            }

            return TicketMapper.mapToTicketResponse(detailedIssue.issue(), url);
        } catch (RuntimeException e) {
            return null;
        }
    }

    private void createDirectoryStructureIfNotExists(List<Issue> ticketNumber) throws IOException {
        List<String> ids = ticketNumber.stream().map(issue -> issue.getId() + ";:;" + issue.getSubject()).toList();
        String data = String.join("\n", ids);
        Path ticketPath = Path.of("/data/tickets.txt");
        if(!Files.exists(ticketPath)){
            Files.createFile(ticketPath);
        }

        Files.write(ticketPath, data.getBytes());
    }
}
