package de.haevn.snippetmanage.user;

import de.haevn.snippetmanage.common.exception.NotFoundException;

class UserNotFoundException extends NotFoundException {
    public UserNotFoundException(final String email) {
        super(String.format("User with email %s not found.", email));
    }
}
