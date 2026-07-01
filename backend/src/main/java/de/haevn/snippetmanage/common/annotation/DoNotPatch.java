package de.haevn.snippetmanage.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * <h1>DoNotPatch</h1>
 * This annotation is used to mark fields that should not be patched by the
 * patching mechanism.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface DoNotPatch {

}

