package de.haevn.snippetmanage.user;

import de.haevn.snippetmanage.common.exception.BadRequestException;
import de.haevn.snippetmanage.common.exception.InternalServerErrorException;
import de.haevn.snippetmanage.common.exception.NotFoundException;
import de.haevn.snippetmanage.common.utils.Patcher;
import de.haevn.snippetmanage.common.utils.RequestContextUtils;
import java.io.File;
import java.nio.file.Files;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
class UserService {
    private final UserRepository userRepository;
    private final RequestContextUtils requestContextUtils;
    private final Patcher patcher;

    @Value("${haevn.user.image.path}")
    private String defaultImagePath;

    public UserService(final UserRepository userRepository, final RequestContextUtils requestContextUtils,
        final Patcher patcher) {
        this.userRepository = userRepository;
        this.requestContextUtils = requestContextUtils;
        this.patcher = patcher;
    }

    public void createUser(final User user) {
        boolean userExists = userRepository.findByEmail(user.getEmail()).isEmpty();
        if (userExists) {
            userRepository.save(user);
        } else {
            throw new UserAlreadyExistsException(user.getEmail());
        }

    }

    public void updateUser(final User user, final String email) {
        if (email.isEmpty() || !email.equalsIgnoreCase(user.getEmail())) {
            throw new NotFoundException("Email cannot be changed or be empty.");
        }
        final User dbUser = userRepository.findByEmail(email).stream().findFirst().orElseThrow(NotFoundException::new);

        patcher.patch(dbUser, user);
        userRepository.save(user);
    }

    public void deleteUser(final String email) {
        verifyPassword();
        final User user = userRepository.findByEmail(email).stream() //
            .findFirst() //
            .orElseThrow(() -> new UserNotFoundException(email));
        userRepository.delete(user);
    }


    public User getUserByEmail(final String email) {
        verifyPassword();
        return userRepository.findByEmail(email).stream() //
            .findFirst() //
            .orElseThrow(() -> new UserNotFoundException(email));
    }

    private void verifyPassword() {
        final String mail = requestContextUtils.getHeader("email") //
            .orElseThrow(() -> new BadRequestException("Email header is missing"));
        final String password = requestContextUtils.getHeader("password")//
            .orElseThrow(() -> new BadRequestException("Password header is missing"));
        final User user = userRepository.findByEmail(mail).stream() //
            .findFirst() //
            .orElseThrow(() -> new UserNotFoundException(mail));
        if (!user.getPassword().equals(password)) {
            throw new BadRequestException("Invalid password for user " + mail);
        }
    }

    public byte[] getUserPicture(final String email) {
        final User user = userRepository.findByEmail(email).stream() //
            .findFirst() //
            .orElseThrow(() -> new UserNotFoundException(email));

        String imageId = user.getImgId();
        if (imageId == null || imageId.isEmpty()) {
            imageId = "default";
        }
        try {

            final File imgFile;
            if (imageId.equalsIgnoreCase("default")) {
                imgFile = new File(getClass().getClassLoader().getResource("img/default.png").getFile());
            } else {
                imgFile = new File(defaultImagePath, imageId + ".png");
            }

            if (!imgFile.exists()) {
                throw new NotFoundException("Default image file does not exist.");
            }
            return Files.readAllBytes(imgFile.toPath());
        } catch (Exception e) {
            throw new InternalServerErrorException("Failed to read image file " + imageId, e);
        }
    }

    public void updateTheme(final String email, final String theme) {
        final User user = userRepository.findByEmail(email).stream() //
            .findFirst() //
            .orElseThrow(() -> new UserNotFoundException(email));
        user.setTheme(theme);
        userRepository.save(user);
    }
}
