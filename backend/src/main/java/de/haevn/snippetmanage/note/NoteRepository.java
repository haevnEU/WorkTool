package de.haevn.snippetmanage.note;


import org.springframework.data.mongodb.repository.MongoRepository;

interface NoteRepository extends MongoRepository<Note, String> {
}
