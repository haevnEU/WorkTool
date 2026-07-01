package de.haevn.snippetmanage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SnippetManageApplication {
    public static void main(String[] args) {
        SpringApplication.run(SnippetManageApplication.class, args);
    }

}
