package com.buildex.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Arrays;

/**
 * Spring Security configuration with JWT-based stateless authentication.
 *
 * Role hierarchy:
 *   PUBLIC  → no token required  (browse, register, login, OTP)
 *   USER    → any verified user  (pay, enquire, view own data)
 *   BUILDER → builders only      (create/edit/delete own properties)
 *   ADMIN   → platform admins    (verify properties, manage all data)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS handled by WebConfig / CorsConfigurationSource bean below
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Stateless REST API — no CSRF needed, no sessions
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(auth -> auth

                // ── Preflight ──────────────────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Fully Public ───────────────────────────────────────────
                .requestMatchers("/", "/health", "/api/health").permitAll()
                .requestMatchers("/api/auth/register",
                                 "/api/auth/verify-otp",
                                 "/api/auth/login",
                                 "/api/auth/resend-otp",
                                 "/api/auth/forgot-password",
                                 "/api/auth/reset-password").permitAll()

                // Browse properties & cities — anyone can see listings
                .requestMatchers(HttpMethod.GET, "/api/properties").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/properties/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/properties/cities").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/properties/{propertyId}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/properties/{propertyId}/brochure").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/properties/images/proxy-360").permitAll()
                .requestMatchers("/api/images/**").permitAll()

                // Share page (social-media preview)
                .requestMatchers("/share/**").permitAll()

                // Public builder list (shown on landing page)
                .requestMatchers(HttpMethod.GET, "/api/users/builders").permitAll()

                // Submit enquiry — guests can enquire without logging in
                .requestMatchers(HttpMethod.POST, "/api/enquiries").permitAll()
                // Submit complaint / report — guests can report
                .requestMatchers(HttpMethod.POST, "/api/complaints").permitAll()
                // Submit rent request — guests can apply
                .requestMatchers(HttpMethod.POST, "/api/rent-requests").permitAll()

                // ── USER role ──────────────────────────────────────────────
                // Own profile & payments
                .requestMatchers(HttpMethod.GET,  "/api/users/{id}").hasAnyRole("USER", "BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/payments/user/**").hasAnyRole("USER", "BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/payments/check-booking").hasAnyRole("USER", "BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/payments/create-order").hasAnyRole("USER", "BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/payments/verify-payment").hasAnyRole("USER", "BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/enquiries/user/**").hasAnyRole("USER", "BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/rent-requests/user/**").hasAnyRole("USER", "BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/rent-subscriptions/user/**").hasAnyRole("USER", "BUILDER", "ADMIN")

                // ── BUILDER role ───────────────────────────────────────────
                // Create / manage own properties
                .requestMatchers(HttpMethod.POST,  "/api/properties/builder/**").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.PUT,   "/api/properties/**").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/properties/{propertyId}").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/properties/{propertyId}/availability").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/properties/{propertyId}/boost").hasAnyRole("BUILDER", "ADMIN")
                // Image / doc uploads
                .requestMatchers(HttpMethod.POST, "/api/properties/upload-images").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/properties/upload-legal-doc").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/properties/upload-brochure").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/properties/upload-panorama").hasAnyRole("BUILDER", "ADMIN")
                // Own enquiries & rent requests
                .requestMatchers(HttpMethod.GET,   "/api/enquiries/builder/**").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/enquiries/property/**").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/enquiries/{id}/status").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/rent-requests/builder/**").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/rent-requests/{id}/approve").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/rent-requests/{id}/reject").hasAnyRole("BUILDER", "ADMIN")
                // Payments & withdrawals
                .requestMatchers(HttpMethod.GET,  "/api/payments/builder/**").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/withdrawals").hasAnyRole("BUILDER", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/withdrawals/builder/**").hasAnyRole("BUILDER", "ADMIN")
                // Subscription
                .requestMatchers(HttpMethod.POST, "/api/users/{builderId}/subscribe").hasAnyRole("BUILDER", "ADMIN")

                // ── ADMIN role ─────────────────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/properties/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/properties/{propertyId}/verify").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/properties/{propertyId}/legal-doc").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/payments/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/payments/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/payments/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/withdrawals/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/withdrawals/{id}/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/users/{id}/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/enquiries/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/enquiries/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/rent-requests/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/rent-requests/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/complaints").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,   "/api/complaints/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/complaints/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,  "/api/test-email").hasRole("ADMIN")

                // Everything else requires at least a valid token
                .anyRequest().authenticated()
            );

        // Insert our JWT filter before Spring's default username/password filter
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration =
                new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "https://www.buildexx.app",
                "https://buildexx.app",
                "https://buildexx.onrender.com"));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source =
                new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
