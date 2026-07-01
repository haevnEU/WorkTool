package de.haevn.snippetmanage.xml;

import jakarta.validation.constraints.NotNull;
import jakarta.xml.bind.annotation.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * <h1>ValidationSchema</h1>
 * This class represents a validation schema.
 */
@XmlRootElement(name = "validation")
@XmlAccessorType(value = XmlAccessType.FIELD)
@Data
public class ValidationSchema {

    @NotNull
    @XmlAttribute(name = "readableName")
    private String readableName = "N/A";

    @NotNull
    @XmlAttribute(name = "schemaName")
    private String schemaName = "N/A";

    @NotNull
    @XmlAttribute(name = "headerIdentifier")
    private String headerIdentifier = "N/A";

    @XmlAttribute(name = "idColumn")
    private int idColumn = 0;

    @NotNull
    @XmlAttribute(name = "idName")
    private String idName = "N/A";

    @XmlAttribute(name = "totalColumns")
    private int totalColumns = -1;

    @NotNull
    @XmlElementWrapper(name = "mandatory")
    @XmlElement(name = "rule")
    private List<FormatRule> mandatory = new ArrayList<>();

    @NotNull
    @XmlElementWrapper(name = "optional")
    @XmlElement(name = "rule")
    private List<FormatRule> optional = new ArrayList<>();
}

