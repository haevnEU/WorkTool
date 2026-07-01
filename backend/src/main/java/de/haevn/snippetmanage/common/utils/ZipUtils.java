package de.haevn.snippetmanage.common.utils;

import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Component
public class ZipUtils {
    public byte[] zipFiles(List<Path> files) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (Path file : files) {
                zos.putNextEntry(new ZipEntry(file.getFileName().toString()));
                java.nio.file.Files.copy(file, zos);
                zos.closeEntry();
            }
            zos.finish();
            return baos.toByteArray();
        }
    }

    public byte[] zipZipFiles(List<ZipFile> files) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (ZipFile file : files) {
                zos.putNextEntry(new ZipEntry(file.filename()));
                zos.write(file.data());
                zos.closeEntry();
            }
            zos.finish();
            return baos.toByteArray();
        }
    }

    public static record ZipFile(byte[] data, String filename) { }
}
