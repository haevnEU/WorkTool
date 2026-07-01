package de.haevn.snippetmanage.info.sup;

import de.haevn.snippetmanage.common.exception.NotFoundException;

public class TableNotFoundException extends NotFoundException {
    public TableNotFoundException(final String tableName) {
        super(String.format("Table %s not found.", tableName));
    }
}
