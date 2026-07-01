// java
package de.haevn.snippetmanage.todo;

import de.haevn.snippetmanage.common.annotation.DoNotPatch;
import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
class TodoItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @DoNotPatch
    private long id; // can store UUID.toString() or Mongo ObjectId
    private String content;
    private long timestamp;
    @Nullable
    private String priority;
}