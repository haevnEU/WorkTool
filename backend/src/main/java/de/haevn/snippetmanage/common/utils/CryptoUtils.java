package de.haevn.snippetmanage.common.utils;

import jakarta.xml.bind.DatatypeConverter;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Component
public class CryptoUtils {

    public boolean isChecksumCorrect(byte[] data, String checksum, String algorithm) {
        String calculatedChecksum = calculateCheckSum(data, algorithm);
        return calculatedChecksum.equalsIgnoreCase(checksum);
    }

    public String calculateCheckSum(final byte[] body, final String algorithm) {
        try {
            final MessageDigest digest = MessageDigest.getInstance(algorithm);
            final byte[] hashedBytes = digest.digest(body);
            return DatatypeConverter.printHexBinary(hashedBytes);
        } catch (NoSuchAlgorithmException e) {
            return "Could not calculate checksum: " + e.getMessage();
        }

    }
}
