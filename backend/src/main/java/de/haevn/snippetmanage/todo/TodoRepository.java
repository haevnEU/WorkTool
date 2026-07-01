package de.haevn.snippetmanage.todo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

interface TodoRepository extends JpaRepository<TodoItem, Long> {

    @Override
    List<TodoItem> findAll();

    @Override
    Optional<TodoItem> findById(Long s);
}
