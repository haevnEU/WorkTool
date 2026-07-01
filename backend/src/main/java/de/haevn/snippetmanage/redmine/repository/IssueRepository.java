package de.haevn.snippetmanage.redmine.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IssueRepository  extends JpaRepository<IssueFile, Long> {

    Optional<IssueFile> findByTicketId(String ticketId);

}
