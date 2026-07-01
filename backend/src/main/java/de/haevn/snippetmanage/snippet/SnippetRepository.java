package de.haevn.snippetmanage.snippet;

import org.springframework.data.mongodb.repository.MongoRepository;

interface SnippetRepository extends MongoRepository<Snippet, String> {
}
