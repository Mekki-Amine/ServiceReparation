package org.example.serviceelectro.config;

import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin user already exists (using case-insensitive lookup)
        if (userRepository.findByEmailIgnoreCase("admin@fixer.com").isEmpty()) {
            Utilisateur admin = Utilisateur.builder()
                    .username("admin")
                    .email("admin@fixer.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .build();
            
            userRepository.save(admin);
            System.out.println("=========================================");
            System.out.println("Admin user created successfully!");
            System.out.println("Email: admin@fixer.com");
            System.out.println("Password: admin123");
            System.out.println("=========================================");
        } else {
            System.out.println("Admin user already exists!");
        }
    }
}

