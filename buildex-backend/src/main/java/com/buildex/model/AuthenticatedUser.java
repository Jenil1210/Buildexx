package com.buildex.model;

/**
 * Represents the authenticated user extracted from the JWT token.
 * Used as the Spring Security principal so controllers can call
 * {@code @AuthenticationPrincipal AuthenticatedUser user}.
 */
public class AuthenticatedUser {

    private final Long id;
    private final String email;
    private final String role;

    public AuthenticatedUser(Long id, String email, String role) {
        this.id = id;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    /** Spring Security role string, e.g. "ROLE_BUILDER" */
    public String getSpringRole() {
        return "ROLE_" + role.toUpperCase();
    }

    @Override
    public String toString() {
        return "AuthenticatedUser{id=" + id + ", email='" + email + "', role='" + role + "'}";
    }
}
