package de.haevn.snippetmanage.xml;

import jakarta.validation.constraints.NotNull;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlAttribute;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import lombok.Data;

@XmlAccessorType(XmlAccessType.FIELD)
@Data
public class FormatRule {

    @XmlAttribute(name = "identifierColumn")
    private int identifierColumn = 0;

    @NotNull
    @XmlElement(name = "fieldName")
    private String fieldName = "";

    @NotNull
    @XmlJavaTypeAdapter(EmptyStringAdapter.class)
    @XmlElement(name = "description")
    private String description = "";

    @XmlJavaTypeAdapter(EmptyStringAdapter.class)
    @XmlElement(name = "regex")
    private String regex = "";

    @XmlJavaTypeAdapter(EmptyStringAdapter.class)
    @XmlElement(name = "choice")
    private String choice = "";

    @XmlJavaTypeAdapter(EmptyStringAdapter.class)
    @XmlElement(name = "errorCode")
    private String errorCode;

    @XmlJavaTypeAdapter(EmptyStringAdapter.class)
    @XmlElement(name = "errorMessage")
    private String errorMessage;

    @XmlElement(name = "column")
    private int column = -1;

    @XmlElement(name = "optional")
    private boolean optional = false;
}