package de.haevn.snippetmanage.common.utils;

import de.haevn.snippetmanage.common.annotation.DoNotPatch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.Arrays;

/**
 * <h1>Patcher</h1>
 * This class is used to patch an existing object with values from another
 * object.<br> It utilizes reflection to iterate over the fields of the objects
 * and sets the values of the fields of the existing object
 */
@Component
public class Patcher {

    private static final Logger LOGGER = LoggerFactory.getLogger(Patcher.class);

    /**
     * <h2>patch(T, T)</h2>
     * This method patches the existing object with the values of the incomplete
     * object.<br> It iterates over the fields of the objects and sets the
     * values of the fields of the existing object.
     *
     * @param originalObject The existing object
     * @param newObject      The incomplete object
     * @param <T>            The type of the objects
     * @return The number of fields patched
     */
    public <T> long patch(final T originalObject, final T newObject) {
        if (originalObject == null || newObject == null) {
            throw new IllegalArgumentException("Input parameters cannot be null");
        }
        if (originalObject.getClass() != newObject.getClass()) {
            throw new IllegalArgumentException("Input parameters must be of the same class");
        }

        final Class<?> internClass = originalObject.getClass();
        final Field[] internFields = internClass.getDeclaredFields();
        return Arrays.stream(internFields)
                .filter(field -> !field.isAnnotationPresent(DoNotPatch.class))
                .filter(field -> !Modifier.isStatic(field.getModifiers()))
                .filter(field -> !Modifier.isFinal(field.getModifiers()))
                .map(field -> patchField(field, originalObject, newObject))
                .filter(patched -> patched)
                .count();
    }

    /**
     * <h2>patchField(Field, Object, Object)</h2>
     * This is the actual patching method that sets the value of the field of
     * the existing object with the value of the field of the incomplete
     * object.
     *
     * @param field          The field to patch
     * @param originalObject The existing object
     * @param newObject      The incomplete object
     */
    private boolean patchField(final Field field, final Object originalObject, final Object newObject) {
        try {
            field.setAccessible(true);
            final Object value = field.get(newObject);
            if (value != null && !value.equals(field.get(originalObject))) {
                LOGGER.debug("Patching field: {} with value: {}", field.getName(), value);
                field.set(originalObject, value);
                return !field.getName().contains("accessTokenRevoked");
            }
            return false;
        } catch (final Exception e) {
            final String errorMessage = String.format("Error while patching field: %s in class: %s. Cause: %s",
                    field.getName(), originalObject.getClass().getName(), e.getMessage());
            LOGGER.error(errorMessage);
            throw new RuntimeException(e);
        }
    }

}

