package de.haevn.snippetmanage.timetable;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface TimetableRepository extends JpaRepository<Timetable, Long> {
}
