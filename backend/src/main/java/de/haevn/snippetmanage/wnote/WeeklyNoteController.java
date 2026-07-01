package de.haevn.snippetmanage.wnote;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestApiController(value = "/api/meetings", tagName = "Note Controller", description = "Controller for managing notes")
class WeeklyNoteController {

    private final WeeklyNoteService weeklyNoteService;

    public WeeklyNoteController(WeeklyNoteService weeklyNoteService) {
        this.weeklyNoteService = weeklyNoteService;
    }

    @GetMapping("/limit")
    @Operation(summary = "Get text limit", description = "Retrieve the maximum allowed text limit for notes")
    public ResponseEntity<Integer> getTextLimit() {
        return ResponseEntity.ok(weeklyNoteService.getTextLimit());
    }

    @GetMapping("")
    @Operation(summary = "Get all notes", description = "Retrieve a list of all notes")
    public ResponseEntity<Iterable<WeeklyNote>> getAllNotes() {
        return ResponseEntity.ok(weeklyNoteService.getAllNotes());
    }

    @PostMapping("")
    @Operation(summary = "Create a new note", description = "Add a new note to the system")
    @ApiResponse(responseCode = "200", description = "Note created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, note is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to create note")
    public ResponseEntity<String> createNote(@RequestBody Optional<WeeklyNote> snippetOpt) {
        if (snippetOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Note is empty");
        }

        WeeklyNote weeklyNote = snippetOpt.get();

        boolean created = weeklyNoteService.createNote(weeklyNote);
        if (created) {
            return ResponseEntity.ok("Note created with ID: " + weeklyNote.getId());
        } else {
            return ResponseEntity.status(500).body("Failed to create note");
        }
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an existing note", description = "Modify the details of an existing note")
    @ApiResponse(responseCode = "200", description = "Note updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, note is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to update note")
    public ResponseEntity<String> updateNote(@RequestBody Optional<WeeklyNote> codeOpt, @PathVariable("id") String id) {
        if (codeOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Note is empty");
        }

        WeeklyNote code = codeOpt.get();

        boolean updated = weeklyNoteService.updateNote(code, id);
        if (updated) {
            return ResponseEntity.ok("Note updated with ID: " + id);
        } else {
            return ResponseEntity.status(500).body("Failed to update note");
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a note", description = "Remove a note from the system by its ID")
    @ApiResponse(responseCode = "200", description = "Note deleted successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, ID is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to delete note")
    public ResponseEntity<String> deleteNote(@PathVariable String id) {
        boolean deleted = weeklyNoteService.deleteNote(id);
        if (deleted) {
            return ResponseEntity.ok("Note deleted with ID: " + id);
        } else {
            return ResponseEntity.status(500).body("Failed to delete note");
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> printNoteToPDF(@PathVariable String id) {
        Optional<byte[]> pdfOpt = weeklyNoteService.printNoteToPDF(id);

        return pdfOpt.map(ResponseEntity::ok) //
                .orElseGet(() -> ResponseEntity.status(500).body("Failed to generate PDF".getBytes()));
    }
}
