package com.buildex.config;

import com.buildex.model.AuthenticatedUser;
import com.buildex.service.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Intercepts every HTTP request exactly once.
 *
 * If a valid "Authorization: Bearer <token>" header is present the filter:
 *   1. Validates the JWT using {@link JwtUtil}.
 *   2. Builds an {@link AuthenticatedUser} principal.
 *   3. Sets it as the current authentication in the SecurityContext.
 *
 * Requests without a token (or with an invalid one) pass through unauthenticated,
 * and Spring Security's authorization rules then decide whether to allow or reject them.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtUtil.isTokenValid(token)) {
            try {
                AuthenticatedUser principal = jwtUtil.toAuthenticatedUser(token);

                // Spring Security authority string must be "ROLE_XXXX"
                String springRole = "ROLE_" + principal.getRole().toUpperCase();
                var authorities = List.of(new SimpleGrantedAuthority(springRole));

                var authentication = new UsernamePasswordAuthenticationToken(
                        principal, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                // Invalid token — clear context and let the request proceed unauthenticated
                SecurityContextHolder.clearContext();
                System.err.println("[JWT] Token parsing failed: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    /** Extracts the raw JWT from the Authorization header. */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
