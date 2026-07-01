package de.haevn.snippetmanage.common.config;

import de.haevn.snippetmanage.common.utils.CryptoUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.Set;

/**
 * <h1>SecurityHeadersFilter</h1>
 * This filter adds security headers to the response.
 */
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {
    private static final Set<String> ALLOWED_ORIGINS = Set.of(
            "http://localhost:3000",
            "http://localhost",
            "http://127.0.0.1:3000",
            "http://127.0.0.1"
    );
    private final RequestContextUtil requestContextUtils;
    private final CryptoUtils cryptoUtils;

    public SecurityHeadersFilter(final RequestContextUtil requestContextUtils, CryptoUtils cryptoUtils) {
        this.requestContextUtils = requestContextUtils;
        this.cryptoUtils = cryptoUtils;
    }

    @Override
    protected void doFilterInternal(final HttpServletRequest request, final HttpServletResponse response,
                                    final FilterChain filterChain) throws ServletException, IOException {
        ContentCachingResponseWrapper wrapper = new ContentCachingResponseWrapper(response);
        filterChain.doFilter(request, wrapper);

        wrapper.setHeader("Content-Security-Policy", "default-src 'self'");
        wrapper.setHeader("X-Content-Type-Options", "nosniff");
        wrapper.setHeader("X-Frame-Options", "DENY");
        wrapper.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        final byte[] body = wrapper.getContentAsByteArray();
        final String algorithm = "SHA-256";
        wrapper.setHeader("X-API-Version", requestContextUtils.getRequestedApiVersion());
        wrapper.setHeader("X-Processing-Time", String.valueOf(System.currentTimeMillis()));
        wrapper.setHeader("X-Checksum", cryptoUtils.calculateCheckSum(body, algorithm));
        wrapper.setHeader("X-Checksum-Algorithm", algorithm);
        wrapper.setHeader("X-Application", requestContextUtils.getApplication());
        wrapper.setHeader("X-Client-IP", requestContextUtils.getIpAddress());

        wrapper.copyBodyToResponse();
    }
}
