package de.haevn.snippetmanage.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SameSiteCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        chain.doFilter(req, res);
        if (res instanceof HttpServletResponse) {
            HttpServletResponse response = res;
            // append SameSite=None; Secure to all Set-Cookie headers (dev only - adjust for production)
            for (String header : response.getHeaders("Set-Cookie")) {
                if (!header.toLowerCase().contains("samesite")) {
                    response.setHeader("Set-Cookie", header + "; SameSite=None; Secure");
                }
            }
        }
    }
}