package de.haevn.snippetmanage.todo;

import de.haevn.snippetmanage.common.exception.NotFoundException;
import de.haevn.snippetmanage.common.utils.CryptoUtils;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
class TodoService {

    private final TodoRepository todoRepository;
    private final CryptoUtils cryptoUtils;

    public TodoService(final TodoRepository todoRepository, CryptoUtils cryptoUtils) {
        this.todoRepository = todoRepository;
        this.cryptoUtils = cryptoUtils;
    }

    void createTodo(String content, String priority) {
        TodoItem item = new TodoItem();
        item.setContent(content);
        item.setPriority(priority);
        item.setTimestamp(System.currentTimeMillis());
        todoRepository.save(item);
    }

    void updateTodo(TodoItem todo){
        TodoItem item = todoRepository.findById(todo.getId()).orElseThrow(NotFoundException::new);
        item.setContent(todo.getContent());
        item.setPriority(todo.getPriority());
        todoRepository.save(item);
    }


    void deleteFile(long id) {
        try {
            todoRepository.findById(id).orElseThrow(NotFoundException::new);
            todoRepository.deleteById(id);
        } catch (Exception ignored) {
            // Ignore exceptions during delete
        }
    }

    public List<TodoItem> getAllFileShares() {
        return todoRepository.findAll();
    }
}
