package org.example.serviceelectro.servicees;

import org.example.serviceelectro.config.JwtUtil;
import org.example.serviceelectro.dto.LoginRequest;
import org.example.serviceelectro.dto.LoginResponse;
import org.example.serviceelectro.entities.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserImpl userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest loginRequest) {
        // Normalize email to lowercase for case-insensitive lookup
        String email = loginRequest.getEmail().toLowerCase().trim();
        
        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Email: " + email);
        
        Optional<Utilisateur> utilisateurOpt = userService.findByEmail(email);
        
        if (utilisateurOpt.isEmpty()) {
            System.out.println("❌ User not found with email: " + email);
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        Utilisateur utilisateur = utilisateurOpt.get();
        System.out.println("✅ User found - ID: " + utilisateur.getId() + ", Email: " + utilisateur.getEmail());
        System.out.println("Password hash exists: " + (utilisateur.getPassword() != null));
        
        // Check if password matches
        boolean passwordMatches = utilisateur.getPassword() != null && 
            passwordEncoder.matches(loginRequest.getPassword(), utilisateur.getPassword());
        
        System.out.println("Password matches: " + passwordMatches);
        
        if (!passwordMatches) {
            System.out.println("❌ Password mismatch for user: " + email);
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }
        
        System.out.println("✅ Login successful for: " + email);
        
        // Mettre à jour le statut de connexion
        userService.setUserOnline(utilisateur.getId(), true);

        String role = utilisateur.getRole() != null ? utilisateur.getRole() : "USER";
        System.out.println("🔑 Generating token for email: " + utilisateur.getEmail() + ", role: " + role);
        
        String token;
        try {
            token = jwtUtil.generateToken(utilisateur.getEmail(), role);
            System.out.println("✅ Token generated. Length: " + (token != null ? token.length() : 0));
        } catch (Exception e) {
            System.err.println("❌ ERROR generating token: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la génération du token: " + e.getMessage(), e);
        }
        
        if (token == null || token.isEmpty()) {
            System.err.println("❌ ERROR: Token is null or empty after generation!");
            throw new RuntimeException("Erreur: Token non généré");
        }
        
        System.out.println("✅ Token generated successfully. Length: " + token.length());
        System.out.println("✅ Token preview: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));

        // Get the actual username field value (since getUsername() is overridden to return email)
        // We'll use reflection to access the private username field
        String actualUsername = email; // Default to email
        try {
            java.lang.reflect.Field usernameField = Utilisateur.class.getDeclaredField("username");
            usernameField.setAccessible(true);
            Object usernameValue = usernameField.get(utilisateur);
            if (usernameValue != null && !usernameValue.toString().trim().isEmpty()) {
                actualUsername = usernameValue.toString();
            }
        } catch (Exception e) {
            // If reflection fails, use email as username
            actualUsername = email;
        }

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .email(utilisateur.getEmail())
                .role(role)
                .userId(utilisateur.getId())
                .username(actualUsername)
                .build();
        
        System.out.println("📦 LoginResponse created:");
        System.out.println("   - Token: " + (response.getToken() != null ? "Present (" + response.getToken().length() + " chars)" : "NULL"));
        System.out.println("   - Email: " + response.getEmail());
        System.out.println("   - Role: " + response.getRole());
        System.out.println("   - UserId: " + response.getUserId());
        System.out.println("   - Username: " + response.getUsername());
        
        return response;
    }
}

