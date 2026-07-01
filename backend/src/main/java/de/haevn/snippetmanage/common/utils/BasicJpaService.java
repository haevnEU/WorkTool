package de.haevn.snippetmanage.common.utils;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public class BasicJpaService<T> {
    private final JpaRepository<T, Integer> repository;

    public BasicJpaService(JpaRepository<T, Integer> repository) {
        this.repository = repository;
    }


    @GetMapping("/{id}")
    public T getById(String id) {
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteById(String id) {

    }

    @PatchMapping("/{id}")
    public T updateById(String id, T entity) {
        return null;
    }

    @PostMapping("")
    public T create(T entity) {
        return null;
    }

    @GetMapping("")
    public List<T> getAll() {
        return null;
    }
}
