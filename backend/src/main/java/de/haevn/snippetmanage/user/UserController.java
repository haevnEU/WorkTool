package de.haevn.snippetmanage.user;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import org.springframework.web.bind.annotation.*;

@RestApiController("/api/user")
class UserController {
    private final UserService userService;

    public UserController(final UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public void createUser(@RequestBody User user) {
        userService.createUser(user);
    }

    @PutMapping("/{email}")
    public void updateUser(@PathVariable("email") final String email, @RequestBody final User user) {
        userService.updateUser(user, email);
    }

    @PatchMapping("/{email}/theme")
    public void updateUserTheme(@PathVariable("email") final String email, @RequestHeader("theme") final String theme) {
        userService.updateTheme(email, theme);
    }

    @DeleteMapping("/{email}")
    public void deleteUser(@PathVariable("email") final String email) {
        userService.deleteUser(email);
    }

    @GetMapping("/{email}")
    public User getUserByEmail(@PathVariable("email") final String email) {
        return userService.getUserByEmail(email);
    }

    @GetMapping("/{email}/picture")
    public byte[] getUserPicture(@PathVariable("email") final String email) {
        return userService.getUserPicture(email);
    }
}
