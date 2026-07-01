package de.haevn.snippetmanage.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByEmail(String email);
}
