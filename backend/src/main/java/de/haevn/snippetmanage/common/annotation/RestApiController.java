package de.haevn.snippetmanage.common.annotation;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.annotation.AliasFor;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Component
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@RestController
@RequestMapping
@Tag(name = "API Controller", description = "Controller for REST API endpoints")
public @interface RestApiController {
    @AliasFor(annotation = RequestMapping.class, attribute = "value")
    String[] value();

    @AliasFor(annotation = Tag.class, attribute = "name")
    String tagName() default "API Controller";

    @AliasFor(annotation = Tag.class, attribute = "description")
    String description() default "";
}
