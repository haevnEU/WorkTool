package de.haevn.snippetmanage.common.utils;

public class RandomUtils {
    private RandomUtils() {
    }

    public static String generateRandomString(int length, String alphabet) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = (int) (alphabet.length() * Math.random());
            sb.append(alphabet.charAt(index));
        }
        return sb.toString();
    }

    public static String generateRandomString(int length) {
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return generateRandomString(length, alphabet);
    }

    public static String generateRandomString() {
        return generateRandomString(12);
    }

    public static String randomNumberString(int length) {
        String numbers = "0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = (int) (numbers.length() * Math.random());
            sb.append(numbers.charAt(index));
        }

        return sb.toString();
    }

    public static long generateRandomLong(int digits) {
        String numberString = randomNumberString(digits);
        return Long.parseLong(numberString);
    }

    public static double generateRandomDouble(int integerDigits, int fractionalDigits) {
        String integerPart = randomNumberString(integerDigits);
        String fractionalPart = randomNumberString(fractionalDigits);
        String numberString = integerPart + "." + fractionalPart;
        return Double.parseDouble(numberString);
    }

}
