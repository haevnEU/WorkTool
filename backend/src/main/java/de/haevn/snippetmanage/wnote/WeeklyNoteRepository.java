package de.haevn.snippetmanage.wnote;

import org.springframework.data.mongodb.repository.MongoRepository;

interface WeeklyNoteRepository extends MongoRepository<WeeklyNote, String> {
}
