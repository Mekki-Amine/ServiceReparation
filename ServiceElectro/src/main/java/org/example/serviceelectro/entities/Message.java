package org.example.serviceelectro.entities;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "message")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Message implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true, length = 2000)
    private String content;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private Utilisateur sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Utilisateur receiver;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(nullable = true)
    private String fileUrl; // URL du fichier attaché (image, document, etc.)

    @Column(nullable = true)
    private String fileName; // Nom du fichier

    @Column(nullable = true)
    private String fileType; // Type MIME du fichier

    @Column(nullable = true)
    private Double latitude; // Latitude pour la localisation

    @Column(nullable = true)
    private Double longitude; // Longitude pour la localisation

    @Column(nullable = true, length = 500)
    private String locationName; // Nom de la localisation (adresse, lieu, etc.)

    @CreatedDate
    @Column(nullable = true, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = true)
    private LocalDateTime updatedAt;
}

