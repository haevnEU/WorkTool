package de.haevn.snippetmanage.snippet;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;

@Service
class SnippetService {
    private final SnippetRepository repository;

    public SnippetService(final SnippetRepository repository) {
        this.repository = repository;
    }

    public boolean createSnippet(Snippet snippet) {
        snippet.setId(null);
        repository.save(snippet);
        return true;
    }

    public boolean updateSnippet(String id, Snippet snippet) {
        final Snippet target = repository.findAll().stream()
                .filter(s -> s.getId().equalsIgnoreCase(id))
                .findFirst()
                .orElseThrow();

        target.setCode(snippet.getCode());
        target.setLanguage(snippet.getLanguage());
        target.setTitle(snippet.getTitle());
        repository.save(target);
        return true;
    }

    public boolean deleteSnippet(String id) {
        if (id == null || !repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }

    public Optional<Snippet> getSnippet(String id) {
        if (id == null || !repository.existsById(id)) {
            return Optional.empty();
        }

        return repository.findById(id);
    }

    public List<Snippet> getAllSnippets() {
        return repository.findAll();
    }

    public List<Snippet> findBy(Predicate<Snippet> filter) {
        return repository.findAll().stream().filter(filter).toList();
    }
}
