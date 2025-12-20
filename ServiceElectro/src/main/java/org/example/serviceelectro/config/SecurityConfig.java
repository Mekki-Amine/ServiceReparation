package org.example.serviceelectro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource)
            throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/utilis").permitAll() // Allow signup
                        .requestMatchers("/api/utilis/profile/**").permitAll() // Allow public profile access (includes photos)
                        .requestMatchers("/api/utilis/{id}").permitAll() // Allow public user info access
                        .requestMatchers("/api/pub/files/**").permitAll()
                        .requestMatchers("/api/messages/files/**").permitAll()
                        .requestMatchers("/api/pub").permitAll()
                        .requestMatchers("/api/pub/{id}").permitAll()
                        .requestMatchers("/api/pub/create").permitAll()
                        .requestMatchers("/api/comments/publication/**").permitAll()
                        .requestMatchers("/api/recommendations/stats").permitAll() // Stats publiques
                        .requestMatchers(HttpMethod.GET, "/api/recommendations").permitAll() // GET /api/recommendations - Liste publique
                        .requestMatchers(HttpMethod.GET, "/api/recommendations/user/**").permitAll() // GET /api/recommendations/user/{userId} - Lecture publique
                        
                        // Messages endpoints - require authentication
                        .requestMatchers("/api/messages/**").authenticated()
                        
                        // Notifications endpoints - require authentication
                        .requestMatchers("/api/notifications/**").authenticated()
                        
                        // Cart endpoints - require authentication
                        .requestMatchers("/api/cart/**").authenticated()
                        
                        // Recommendations endpoints spécifiques - require authentication pour POST (doit être après le GET public)
                        .requestMatchers("/api/recommendations/user/**").authenticated() // POST /api/recommendations/user/{userId}
                        .requestMatchers(HttpMethod.DELETE, "/api/recommendations/**").hasRole("ADMIN") // DELETE /api/recommendations/{id} - Admin only
                        
                        // Admin endpoints - require ADMIN role
                        .requestMatchers("/api/pub/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        
                        // All other requests need authentication
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
