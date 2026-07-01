package de.haevn.snippetmanage.user;

import de.haevn.snippetmanage.common.exception.AlreadyReportedException;

class UserAlreadyExistsException extends AlreadyReportedException {
    public UserAlreadyExistsException(final String email) {
        super(String.format("User with email %s already exists.", email));
    }
}
