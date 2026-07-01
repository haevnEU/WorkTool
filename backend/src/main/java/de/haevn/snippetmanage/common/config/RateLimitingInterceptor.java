package de.haevn.snippetmanage.common.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private static final int MAX_REQUESTS = 20;
    private static final long WINDOW_SIZE_MS = 60 * 1000;

    private final ConcurrentHashMap<String, RateLimitData> requestCounts = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        long now = System.currentTimeMillis();
        String ip = getClientIp(request);
        RateLimitData rateLimitData = requestCounts.computeIfAbsent(ip, k -> new RateLimitData(now));

        synchronized (rateLimitData) {

            if (now - rateLimitData.getWindowStartTime() > WINDOW_SIZE_MS) {
                rateLimitData.setWindowStartTime(now);
                rateLimitData.getCount().set(1);
                return true;
            }

            int currentCount = rateLimitData.getCount().incrementAndGet();
            if (currentCount > MAX_REQUESTS) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests");
                return false;
            }
        }

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private static class RateLimitData {
        private final AtomicInteger count;
        private long windowStartTime;

        public RateLimitData(long windowStartTime) {
            this.windowStartTime = windowStartTime;
            this.count = new AtomicInteger(0);
        }

        public long getWindowStartTime() {
            return windowStartTime;
        }

        public void setWindowStartTime(long windowStartTime) {
            this.windowStartTime = windowStartTime;
        }

        public AtomicInteger getCount() {
            return count;
        }
    }
}