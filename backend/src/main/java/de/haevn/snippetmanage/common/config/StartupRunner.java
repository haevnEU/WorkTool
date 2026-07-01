package de.haevn.snippetmanage.common.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class StartupRunner {
    private static final Logger log = LoggerFactory.getLogger(StartupRunner.class);

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Application ready — running post-startup tasks");

        try {
            final Path base = Paths.get("/data");
            Files.createDirectories(base.resolve("els"));
            Files.createDirectories(base.resolve("els/input"));
            Files.createDirectories(base.resolve("els/output"));
            Files.createDirectories(base.resolve("els/xsd"));
            Files.createDirectories(base.resolve("user-images"));
            Files.createDirectories(base.resolve("file_share"));
            log.info("Default data directories created/verified");

        } catch (IOException e) {
            log.error("Failed to create data directories", e);
        }
        log.info("Post-startup tasks finished");
    }
}