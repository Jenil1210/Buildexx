package com.buildex.service;

import com.buildex.entity.User;
import com.buildex.model.AuthenticatedUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility service for generating and validating JWT tokens.
 *
 * Token payload contains:
 *   sub   → user email
 *   userId → user database id
 *   role  → user role (user | builder | admin)
 *   iat   → issued-at
 *   exp   → expiry (default 24 h)
 */
@Service
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** Generate a signed JWT for the given user entity. */
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /** Parse and validate the token; throws JwtException on failure. */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Extract an {@link AuthenticatedUser} principal from a valid token. */
    public AuthenticatedUser toAuthenticatedUser(String token) {
        Claims claims = extractAllClaims(token);
        Long userId = ((Number) claims.get("userId")).longValue();
        String email = claims.getSubject();
        String role  = (String) claims.get("role");
        return new AuthenticatedUser(userId, email, role);
    }

    /** Returns true if the token parses without error and is not expired. */
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
