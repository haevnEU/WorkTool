package de.haevn.snippetmanage.fileshare;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

interface FileShareRepository extends MongoRepository<FileShare, String> {
    boolean existsByShortId(String shortId);

    List<FileShare> findAllByShortId(String shortId);

    Optional<FileShare> findByShortId(String shortId);

    void deleteByShortId(String shortId);

    // return count of documents where password exists and is not empty
    @Query(value = "{ 'shortId': ?0, 'password': { $exists: true, $ne: '' } }", count = true)
    long countWithPassword(String shortId);
}
