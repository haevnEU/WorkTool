package de.haevn.snippetmanage.todo;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import io.swagger.v3.oas.annotations.Operation;
import java.io.IOException;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestApiController("/api/todo")
class TodoController {
    private final TodoService fileShareService;

    public TodoController(final TodoService fileShareService) {
        this.fileShareService = fileShareService;
    }

    @GetMapping
    @Operation(summary = "Gets all file shares' metadata")
    public List<TodoItem> getAllFileShares() {
        return fileShareService.getAllFileShares();
    }

    @PostMapping(path = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Uploads a file via multipart/form-data (field name: `file`)")
    public void uploadFileMultipart(@RequestBody TodoItem item) throws IOException {
        fileShareService.createTodo(item.getContent(), item.getPriority());
    }


    @PostMapping(path = "/update", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Uploads a file via multipart/form-data (field name: `file`)")
    public void updateTodo(@RequestBody TodoItem item) throws IOException {
        fileShareService.updateTodo(item);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Deletes a file from the file share service")
    public void deleteFile(@PathVariable long id) {
        fileShareService.deleteFile(id);
    }
}
