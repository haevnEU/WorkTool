package de.haevn.snippetmanage.common.utils;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.function.Predicate;

@Component
public final class ShortIdGenerator {
    private static final String ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private ShortIdGenerator() {
    }

    public static String generate(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    /**
     * Generate a unique id by checking existence with the provided predicate.
     *
     * @param length      desired id length (use 8)
     * @param exists      predicate that returns true if id already exists (e.g. repo::existsByShortId)
     * @param maxAttempts number of retries before failing
     * @return unique id
     * @throws IllegalStateException if uniqueness cannot be achieved within maxAttempts
     */
    public static String generateUnique(int length, Predicate<String> exists, int maxAttempts) {
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            String id = generate(length);
            if (!exists.test(id)) {
                return id;
            }
        }
        throw new IllegalStateException("Unable to generate unique id after " + maxAttempts + " attempts");
    }
}
