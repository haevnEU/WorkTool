package de.haevn.snippetmanage.info;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.Instant;

@Service
public class InfoService {
    private final Environment env;

    public InfoService(final Environment env) {
        this.env = env;
    }

    public long getUptime() {
        return ManagementFactory.getRuntimeMXBean().getUptime();
    }

    public long getServerTime() {
        return System.currentTimeMillis();
    }

    public String getTimeStamp() {
        return Instant.now().toString();
    }

    public String getServiceName() {
        return env.getProperty("spring.application.name", "N/A");
    }

    public String getVersion() {
        return env.getProperty("spring.application.version", "N/A");
    }

    public String getHostName() {
        try {
            return java.net.InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            return "unknown";
        }
    }

    public String checkDatabase() {
        return "UP";
    }

    public String checkServices() {
        return "UP";
    }
}
