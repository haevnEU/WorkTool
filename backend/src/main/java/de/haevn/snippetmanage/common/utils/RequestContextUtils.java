package de.haevn.snippetmanage.common.utils;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

/**
 * <h1>RequestContextUtil</h1>
 * This utility class provides methods to get information about the current
 * request.
 */
@Component
public class RequestContextUtils {

    /**
     * <h2>getApplication()</h2>
     * This method retrieves the application name from the current HTTP
     * request.
     *
     * @return The application name.
     */
    public String getApplication() {
        return getCurrentHttpRequest().getHeader("X-API-KEY");
    }

    /**
     * <h2>getCurrentHttpRequest()</h2>
     * This method retrieves the current HTTP request and returns it.
     *
     * @return The current HTTP request.
     * @throws IllegalStateException If no request is found.
     */
    public HttpServletRequest getCurrentHttpRequest() {
        return getCurrentHttpRequestOpt().orElseThrow(() -> new IllegalStateException("No request found"));
    }

    /**
     * <h2>getCurrentHttpRequestOpt()</h2>
     * This method retrieves the current HTTP request and returns it as an
     * {@link Optional}.
     *
     * @return An {@link Optional} containing the current HTTP request or an
     * empty {@link Optional} if no request is found.
     */
    public Optional<HttpServletRequest> getCurrentHttpRequestOpt() {
        final RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof final ServletRequestAttributes servletRequestAttributes) {
            return Optional.of(servletRequestAttributes.getRequest());
        }
        return Optional.empty();
    }

    /**
     * <h2>getIpAddress()</h2>
     * This method retrieves the IP address of the current HTTP request. It
     * first tries to get the IP address from the "X-FORWARDED-FOR" header.<br>
     * If that fails, it tries to get the IP address from the remote
     * address.<br> If that fails, it returns "unknown".
     *
     * @return The IP address of the current HTTP request.
     */
    public String getIpAddress() {
        final String forWardedFor = getCurrentHttpRequest().getHeader("X-FORWARDED-FOR");
        if (forWardedFor != null && !forWardedFor.isEmpty()) {
            return forWardedFor;
        }
        final String remoteAddr = getCurrentHttpRequest().getRemoteAddr();
        if (remoteAddr != null && !remoteAddr.isEmpty()) {
            return remoteAddr;
        }
        return "unknown";
    }

    /**
     * <h2>getRemoteHost()</h2>
     * This method retrieves the remote host of the current HTTP request. It
     * first tries to get the remote host from the current HTTP request.<br> If
     * that fails, it returns "unknown".
     *
     * @return The remote host of the current HTTP request.
     */
    public String getRemoteHost() {
        final String remoteHost = getCurrentHttpRequest().getRemoteHost();
        if (remoteHost != null && !remoteHost.isEmpty()) {
            return remoteHost;
        }
        return "unknown";
    }

    public Optional<String> getHeader(String name) {
        final HttpServletRequest request = getCurrentHttpRequest();
        final String value = request.getHeader(name);
        if (value != null && !value.isEmpty()) {
            return Optional.of(value);
        }

        return Optional.empty();
    }

    public Optional<String> getApiKey() {
        final HttpServletRequest request = getCurrentHttpRequest();
        final String apiKey = request.getHeader("X-API-KEY");
        if (apiKey != null && !apiKey.isEmpty()) {
            return Optional.of(apiKey);
        }

        return Optional.empty();
    }

    public String getRequestedApiVersion() {
        final HttpServletRequest request = getCurrentHttpRequest();
        final String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/api/")) {
            final String[] parts = requestURI.split("/");
            if (parts.length > 2) {
                return parts[2]; // The version is the third part of the path
            }
        }

        return "unknown"; // Default or unknown version
    }

}

