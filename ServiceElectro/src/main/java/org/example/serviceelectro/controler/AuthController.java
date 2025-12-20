package org.example.serviceelectro.controler;

import jakarta.validation.Valid;
import org.example.serviceelectro.dto.LoginRequest;
import org.example.serviceelectro.dto.LoginResponse;
import org.example.serviceelectro.servicees.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private org.example.serviceelectro.servicees.UserImpl userService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("🔐 AuthController.login called");
            System.out.println("📧 Email: " + loginRequest.getEmail());
            
            LoginResponse response = authService.login(loginRequest);
            
            System.out.println("✅ LoginResponse created in controller:");
            System.out.println("   - Token: " + (response.getToken() != null ? "Present (" + response.getToken().length() + " chars)" : "NULL"));
            System.out.println("   - Email: " + response.getEmail());
            System.out.println("   - Role: " + response.getRole());
            System.out.println("   - UserId: " + response.getUserId());
            
            if (response == null) {
                System.err.println("❌ CRITICAL: LoginResponse is null!");
                return ResponseEntity.status(500).body("Erreur: Réponse de connexion invalide");
            }
            
            if (response.getToken() == null || response.getToken().isEmpty()) {
                System.err.println("❌ CRITICAL: Token is null or empty in controller!");
                return ResponseEntity.status(500).body("Erreur: Token non généré");
            }
            
            System.out.println("✅ Sending LoginResponse to client");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.err.println("❌ IllegalArgumentException in login: " + e.getMessage());
            e.printStackTrace();
            throw e; // Will be handled by GlobalExceptionHandler
        } catch (RuntimeException e) {
            System.err.println("❌ RuntimeException in login: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Unexpected error in login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur interne du serveur: " + e.getMessage());
        }
    }
    
    @PostMapping("/logout/{userId}")
    public ResponseEntity<?> logout(@PathVariable Long userId) {
        try {
            userService.setUserOnline(userId, false);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la déconnexion");
        }
    }
}

