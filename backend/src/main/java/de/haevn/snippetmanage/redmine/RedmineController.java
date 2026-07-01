package de.haevn.snippetmanage.redmine;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;

@RestApiController(value = "/api/tickets", tagName = "Redmine Controller",
        description = "Controller for Redmine service details")
public class RedmineController {

    private final RedmineService infoService;

    public RedmineController(RedmineService infoService) {
        this.infoService = infoService;
    }

    @GetMapping("/refresh")
    @Operation(summary = "Refresh Redmine details", description = "Force refresh of redmine ticket details")
    @ApiResponse(responseCode = "200", description = "Details refreshed successfully")
    public ResponseEntity<Void> refresh() {
        infoService.refresh();
        return ResponseEntity.ok().build();
    }

    @GetMapping("")
    @Operation(summary = "Get Redmine details", description = "Retrieve detailed information about a redmine ticket")
    @ApiResponse(responseCode = "200", description = "Details retrieved successfully")
    public ResponseEntity<List<TicketResponse>> tickets(@RequestParam("type") Optional<String> type) {
        List<TicketResponse> tickets = infoService.getIssues(type);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Redmine details", description = "Retrieve detailed information about a redmine ticket")
    @ApiResponse(responseCode = "200", description = "Details retrieved successfully")
    public ResponseEntity<TicketResponse> ticketsById(@PathVariable("id") int id, @RequestParam("type") Optional<String> type) {
        TicketResponse ticket = infoService.getIssues(id, type);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/last-update")
    @Operation(summary = "Get last update time", description = "Retrieve the last update time of redmine tickets")
    @ApiResponse(responseCode = "200", description = "Last update time retrieved successfully")
    public long getLastUpdateTime() {
        return infoService.getLastUpdateTimestamp();
    }

    @GetMapping("/{id}/add_checkbox")
    @Operation(summary = "Add checkbox to ticket", description = "Add a checkbox custom field to a redmine ticket")
    @ApiResponse(responseCode = "200", description = "Checkbox added successfully")
    public ResponseEntity<Void> addCheckboxToTicket(@PathVariable("id") int ticketId) {
        infoService.addCheckboxToTicket(ticketId);
        return ResponseEntity.ok().build();
    }



    @GetMapping("/ignore")
    @Operation(summary = "Get ignored tickets", description = "Retrieve the list of ignored redmine tickets")
    @ApiResponse(responseCode = "200", description = "Ignored tickets retrieved successfully")
    public ResponseEntity<List<Integer>> getIgnoredTickets() {
        List<Integer> ignoredTickets = infoService.getIgnored();
        return ResponseEntity.ok(ignoredTickets);
    }

    @PutMapping("/ignore/{id}")
    public ResponseEntity<Void> ignoreTicket(@PathVariable("id") int ticketId) {
        infoService.addToIgnore(ticketId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/ignore/{id}")
    public ResponseEntity<Void> unignoreTicket(@PathVariable("id") int ticketId) {
        infoService.removeFromIgnore(ticketId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/global/{id}")
    public ResponseEntity<TicketResponse> getGlobalTicket(@PathVariable("id") int ticketId) {
        TicketResponse ticket = infoService.getGlobalIssue(ticketId);
        return ResponseEntity.ok(ticket);
    }
}
