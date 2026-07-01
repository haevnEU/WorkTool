package de.haevn.snippetmanage.user;

import de.haevn.snippetmanage.common.annotation.DoNotPatch;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @DoNotPatch
    private Long id;
    private String firstName;
    private String lastName;
    @DoNotPatch
    private String email;
    private String password;
    private String motto;
    private String imgId;
    private boolean darkMode;
    private String username;
    private String theme;
}
