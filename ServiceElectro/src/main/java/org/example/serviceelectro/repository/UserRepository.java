package org.example.serviceelectro.repository;

import org.example.serviceelectro.entities.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmailIgnoreCase(String email);
    Optional<Utilisateur> findByUsername(String username);
}





