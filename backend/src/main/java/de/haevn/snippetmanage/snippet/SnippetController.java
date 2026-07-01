package de.haevn.snippetmanage.snippet;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import de.haevn.snippetmanage.common.exception.BadRequestException;
import de.haevn.snippetmanage.common.exception.InternalServerErrorException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.function.Predicate;

@RestApiController(value = "/api/snippets", tagName = "Snippet Controller", description = "Controller for managing code snippets")
class SnippetController {

    private final SnippetService snippetService;

    public SnippetController(SnippetService snippetService) {
        this.snippetService = snippetService;
    }

    @GetMapping("")
    @Operation(summary = "Get all snippets", description = "Retrieve a list of all code snippets with optional filtering by language, title, and tag")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of snippets")
    public ResponseEntity<Iterable<Snippet>> getAllSnippets(@RequestParam("lang") final Optional<String> lang,
                                                            @RequestParam("title") final Optional<String> title) {
        Predicate<Snippet> titleFilter = null;
        Predicate<Snippet> langFilter = null;

        Predicate<Snippet> filter = snippet -> true;

        if (title.isPresent() && !title.get().isEmpty()) {
            titleFilter = snippet -> snippet.getTitle() != null && snippet.getTitle().toLowerCase().contains(title.get().toLowerCase());
            filter = filter.and(titleFilter);
        }
        if (lang.isPresent() && !lang.get().isEmpty()) {
            langFilter = snippet -> snippet.getLanguage() != null && snippet.getLanguage().equalsIgnoreCase(lang.get());
            filter = filter.and(langFilter);
        }
        return ResponseEntity.ok(snippetService.findBy(filter));
    }

    @PostMapping("")
    @Operation(summary = "Create a new snippet", description = "Add a new code snippet to the system")
    @ApiResponse(responseCode = "201", description = "Snippet created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, snippet is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to create snippet")
    public ResponseEntity<String> createSnippet(@RequestBody final Optional<Snippet> snippetOpt) {
        final Snippet snippet = snippetOpt.orElseThrow(() -> new BadRequestException("Snippet is empty"));
        final boolean created = snippetService.createSnippet(snippet);
        if (!created) {
            throw new InternalServerErrorException("Failed to create snippet");
        }
        return ResponseEntity.status(201).body("Snippet created with ID: " + snippet.getId());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing snippet", description = "Update the details of a snippet")
    @ApiResponse(responseCode = "200", description = "Snippet updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, snippet is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to update snippet")
    public ResponseEntity<String> updateSnippet(@PathVariable("id") final String id, @RequestBody final Optional<Snippet> snippetOpt) {
        final Snippet snippet = snippetOpt.orElseThrow(() -> new BadRequestException("Snippet is empty"));
        final boolean updated = snippetService.updateSnippet(id, snippet);
        if (!updated) {
            throw new InternalServerErrorException("Failed to update snippet");
        }
        return ResponseEntity.ok("Snippet updated with ID: " + snippet.getId());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a snippet", description = "Remove a code snippet from the system by its ID")
    @ApiResponse(responseCode = "200", description = "Snippet deleted successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input, ID is empty")
    @ApiResponse(responseCode = "500", description = "Internal server error, failed to delete snippet")
    public ResponseEntity<String> deleteSnippet(@PathVariable("id") final Optional<String> idOpt) {
        final String id = idOpt.orElseThrow(() -> new BadRequestException("ID is empty"));
        boolean deleted = snippetService.deleteSnippet(id);
        if (!deleted) {
            throw new InternalServerErrorException("Failed to delete snippet");
        }
        return ResponseEntity.ok("Snippet deleted with ID: " + id);
    }
}
