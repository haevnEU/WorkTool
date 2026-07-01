package de.haevn.snippetmanage.timetable;

import de.haevn.snippetmanage.common.annotation.DoNotPatch;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;
@Data
@Entity
@Table(name = "timetable")
class Timetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @DoNotPatch
    private long id;
    @DoNotPatch
    private long startTime;
    @DoNotPatch
    private Long endTime;
    private String comment;
    private String type;
    private String ticket;

}
