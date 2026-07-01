package de.haevn.snippetmanage.share;

import de.haevn.snippetmanage.common.exception.BadRequestException;
import de.haevn.snippetmanage.common.utils.ShortIdGenerator;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
class ShareService {
    private final ShareRepository shareRepository;

    public ShareService(final ShareRepository shareRepository) {
        this.shareRepository = shareRepository;

    }

    public String createShare(final ShareDTO share) {
        final long now = System.currentTimeMillis();
        share.setCreationDate(now);
        share.setExpirationDate(now + 7 * 24 * 60 * 60 * 1000); // Default expiration: 7 days
        final String sid = ShortIdGenerator.generateUnique(8, shareRepository::existsByShortId, 1000);
        share.setShortId(sid);
        final Share savedShare = shareRepository.save(Share.fromDTO(share));
        return savedShare.getShortId();

    }

    public Share findShareById(final String id, Optional<String> password) {
        final Share share = shareRepository.findByShortId(id)
                .orElseThrow(() -> new RuntimeException("Share not found"));
        validatePassword(share, password);

        return share;
    }

    private void validatePassword(Share share, Optional<String> password) {
        if (share.getPassword() != null && !share.getPassword().isEmpty() //
                && (password.isEmpty() || !share.getPassword().equals(password.get()))) {
            throw new BadRequestException("Invalid password");
        }

    }

    public boolean hasPassword(final String id) {
        return shareRepository.countWithPassword(id) > 0;
    }

    public List<ShareMetaDTO> getAllSharedId() {

        return shareRepository.findAll().stream()
                .map(Share::toMetaDTO)
                .toList();
    }

    public void deleteShareById(String id) {
        shareRepository.deleteByShortId(id);
    }

    public void deleteAllShares() {
        shareRepository.deleteAll();
    }

    public void cleanUpShares() {
        shareRepository.findAll().stream().filter(e -> e.getExpirationDate() < System.currentTimeMillis())
                .forEach(shareRepository::delete);
    }
}
