package de.haevn.snippetmanage.note;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import de.haevn.snippetmanage.common.exception.InternalServerErrorException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestApiController(value = "/api/notes", tagName = "Note Controller", description = "Controller for managing notes")
class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping("/limit")
    @Operation(summary = "Get text limit", description = "Retrieve the maximum allowed text limit for notes")
    public ResponseEntity<Integer> getTextLimit() {
        return ResponseEntity.ok(noteService.getTextLimit());
    }

    @GetMapping("")
    @Operation(summary = "Get all notes", description = "Retrieve a list of all notes")
    public ResponseEntity<Iterable<Note>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    @PostMapping("")
    @Operation(summary = "Create a new note", description = "Add a new note to the system")
    @ApiResponse(responseCode = "200", description = "Note created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, note is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to create note")
    public ResponseEntity<String> createNote(@RequestBody Optional<Note> snippetOpt) {
        if (snippetOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Note is empty");
        }

        Note note = snippetOpt.get();

        boolean created = noteService.createNote(note);
        if (created) {
            return ResponseEntity.ok("Note created with ID: " + note.getId());
        } else {
            return ResponseEntity.status(500).body("Failed to create note");
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing note", description = "Modify the details of an existing note")
    @ApiResponse(responseCode = "200", description = "Note updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, note is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to update note")
    public ResponseEntity<String> updateNote(@RequestBody Optional<Note> noteOpt, @PathVariable("id") String id) {
        if (noteOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Note is empty");
        }

        Note note = noteOpt.get();

        boolean updated = noteService.updateNote(note, id);
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
        boolean deleted = noteService.deleteNote(id);
        if (deleted) {
            return ResponseEntity.ok("Note deleted with ID: " + id);
        } else {
            return ResponseEntity.status(500).body("Failed to delete note");
        }
    }


    @GetMapping("/{id}/pdf")
    @Operation(summary = "Print note to PDF", description = "Generate a PDF document for the specified note")
    @ApiResponse(responseCode = "200", description = "PDF generated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, ID is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to generate PDF")
    public ResponseEntity<byte[]> printNoteToPDF(@PathVariable String id) {
        final byte[] data = noteService.printNoteToPDF(id) //
                .orElseThrow(() -> new InternalServerErrorException("Failed to generate PDF"));
        return ResponseEntity.ok(data);
    }

}
