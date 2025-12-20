package org.example.serviceelectro.entities;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Utilisateur implements Serializable, UserDetails {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        private String username;
        private String password;
        private String email;
        private String role;
        
        @Column(nullable = false)
        @Builder.Default
        private Boolean emailVerified = false;
        
        // Champs de profil
        @Column(nullable = true)
        private String profilePhoto; // URL de la photo de profil
        
        @Column(nullable = true)
        private String phone; // Téléphone
        
        @Column(nullable = true, length = 500)
        private String address; // Adresse
        
        @Column(nullable = false)
        @Builder.Default
        private Boolean isOnline = false; // Statut de connexion
        
        @Column(nullable = true)
        private LocalDateTime lastLogin; // Dernière connexion

        @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<Publication> publications = new ArrayList<>();

        @CreatedDate
        @Column(nullable = true, updatable = false)  // Changed to nullable = true
        private LocalDateTime createdAt;

        @LastModifiedDate
        @Column(nullable = true)  // Changed to nullable = true
        private LocalDateTime updatedAt;

        @Override
        public String getUsername() {
                return email;
        }
        
        // Getter pour le champ username réel (pas l'email)
        public String getRealUsername() {
                return username;
        }

        @Override
        public boolean isAccountNonExpired() {
                return true;
        }

        @Override
        public boolean isAccountNonLocked() {
                return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
                return true;
        }

        @Override
        public boolean isEnabled() {
                return true;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
                return List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role : "USER")));
        }
}