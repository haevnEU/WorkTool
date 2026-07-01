package de.haevn.snippetmanage.fileshare;

import de.haevn.snippetmanage.common.exception.InternalServerErrorException;
import de.haevn.snippetmanage.common.exception.NotFoundException;
import de.haevn.snippetmanage.common.exception.UnprocessableEntityException;
import de.haevn.snippetmanage.common.utils.CryptoUtils;
import de.haevn.snippetmanage.common.utils.ShortIdGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
class FileShareService {

    @Value("${haevn.application.file_share.path}")
    private String dataDirectory;

    private final FileShareRepository shareRepository;
    private final CryptoUtils cryptoUtils;

    public FileShareService(final FileShareRepository shareRepository, CryptoUtils cryptoUtils) {
        this.shareRepository = shareRepository;
        this.cryptoUtils = cryptoUtils;
    }

    String storeFile(String filename, byte[] data) {
        FileShare fs = new FileShare();
        String hash = cryptoUtils.calculateCheckSum(data, "SHA-256");

        String sid = ShortIdGenerator.generateUnique(8, shareRepository::existsByShortId, 10);
        fs.setShortId(sid);


        fs.setFilename(filename);
        fs.setCreationDate(System.currentTimeMillis());
        fs.setHash(hash);

        try {

            Files.write(Path.of(dataDirectory, fs.getFilename()), data);
            shareRepository.save(fs);
        } catch (IOException e) {
            throw new InternalServerErrorException("Could not store file", e);
        }

        return sid;
    }

    FileShare getFile(String sid) throws IOException {
        final FileShare fs = shareRepository.findByShortId(sid).orElseThrow(NotFoundException::new);
        File f = new File(dataDirectory, fs.getFilename());
        if (!f.exists()) {
            shareRepository.deleteByShortId(sid);
            throw new NotFoundException("File not found");

        }
        byte[] data = Files.readAllBytes(f.toPath());
        boolean checksumEquals = cryptoUtils.isChecksumCorrect(data, fs.getHash(), "SHA-256");
        if (!checksumEquals) {
            throw new UnprocessableEntityException("File checksum does not match, file may be corrupted");
        }

        fs.setData(data);

        return fs;
    }

    void deleteFile(String sid) {
        try {
            final FileShare fs = shareRepository.findByShortId(sid).orElseThrow(NotFoundException::new);
            final File f = new File(dataDirectory, fs.getFilename());
            if (f.exists()) {
                Files.delete(f.toPath());
            }

            shareRepository.deleteByShortId(sid);
        } catch (Exception ignored) {
            // Ignore exceptions during delete
        }
    }

    @Scheduled(cron = "0 0 * * * *")
    void deleteOrphanedFiles() {
        List<FileShare> allShares = shareRepository.findAll();
        for (FileShare fs : allShares) {
            File f = new File(dataDirectory, fs.getFilename());
            if (!f.exists()) {
                shareRepository.deleteByShortId(fs.getShortId());
            }
        }
    }

    public List<FileShare> getAllFileShares() {
        return shareRepository.findAll();
    }
}
