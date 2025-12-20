package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserImpl implements Iuserr{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Utilisateur creatCompte (Utilisateur utilisateur) {
        // Normalize email to lowercase
        String email = utilisateur.getEmail().toLowerCase().trim();
        utilisateur.setEmail(email);
        
        // Vérifier si l'email existe déjà (case-insensitive lookup)
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new IllegalArgumentException("Un utilisateur avec cet email existe déjà");
        }

        // Hasher le mot de passe
        if (utilisateur.getPassword() != null && !utilisateur.getPassword().isEmpty()) {
            utilisateur.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
        } else {
            throw new IllegalArgumentException("Le mot de passe est requis");
        }

        // Définir le rôle par défaut si non spécifié
        if (utilisateur.getRole() == null || utilisateur.getRole().isEmpty()) {
            utilisateur.setRole("USER");
        }

        return userRepository.save(utilisateur);
    }

    @Override
    public List<Utilisateur> getAllUtilisateurs() {
        return userRepository.findAll();
    }

    public Optional<Utilisateur> findByEmail(String email) {
        // Normalize email to lowercase for case-insensitive lookup
        return userRepository.findByEmailIgnoreCase(email.toLowerCase().trim());
    }

    public Optional<Utilisateur> findById(Long id) {
        return userRepository.findById(id);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Utilisateur non trouvé");
        }
        userRepository.deleteById(id);
    }

    public Utilisateur updateUser(Utilisateur utilisateur) {
        if (!userRepository.existsById(utilisateur.getId())) {
            throw new IllegalArgumentException("Utilisateur non trouvé");
        }
        return userRepository.save(utilisateur);
    }
    
    public Utilisateur updateProfile(Long userId, String phone, String address) {
        Optional<Utilisateur> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé");
        }
        Utilisateur user = userOpt.get();
        if (phone != null) user.setPhone(phone);
        if (address != null) user.setAddress(address);
        return userRepository.save(user);
    }
    
    public Utilisateur updateProfilePhoto(Long userId, String photoUrl) {
        Optional<Utilisateur> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé");
        }
        Utilisateur user = userOpt.get();
        user.setProfilePhoto(photoUrl);
        return userRepository.save(user);
    }
    
    public void setUserOnline(Long userId, boolean isOnline) {
        Optional<Utilisateur> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            Utilisateur user = userOpt.get();
            user.setIsOnline(isOnline);
            if (isOnline) {
                user.setLastLogin(java.time.LocalDateTime.now());
            }
            userRepository.save(user);
        }
    }
}
