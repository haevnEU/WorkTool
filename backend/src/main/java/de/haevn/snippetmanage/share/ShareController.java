package de.haevn.snippetmanage.share;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import de.haevn.snippetmanage.common.exception.BadRequestException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestApiController("/api/share")
class ShareController {
    private final ShareService shareService;

    public ShareController(final ShareService shareService) {
        this.shareService = shareService;
    }

    @PostMapping("/create")
    public String createShare(@RequestBody ShareDTO shareDto) {
        return shareService.createShare(shareDto);
    }

    @GetMapping("/{id}")
    public ShareDTO getShare(@PathVariable String id, @RequestHeader("password") Optional<String> password) {
        final Share share = shareService.findShareById(id, password);
        if (share.getExpirationDate() < System.currentTimeMillis()) {
            shareService.deleteShareById(id);
            throw new BadRequestException("Share has expired");
        }
        return ShareDTO.fromShare(share);
    }

    @GetMapping("/{id}/hasPassword")
    public boolean hasPassword(@PathVariable String id) {
        return shareService.hasPassword(id);
    }

    @GetMapping("/all")
    public List<ShareMetaDTO> getAllSharedId() {
        return shareService.getAllSharedId();
    }

    @DeleteMapping("/{id}")
    public void deleteShareById(@PathVariable String id) {
        shareService.deleteShareById(id);
    }

    @DeleteMapping("/all")
    public void purgeAllShares() {
        shareService.deleteAllShares();
    }

    @DeleteMapping("/cleanup")
    public void cleanupShares() {
        shareService.cleanUpShares();
    }

}
