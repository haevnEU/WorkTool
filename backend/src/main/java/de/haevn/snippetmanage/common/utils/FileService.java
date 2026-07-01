package de.haevn.snippetmanage.common.utils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Component;

public class FileService {
    private final String rootPath;
    private final Path rootDir;
    public FileService(final String rootPath) {
        this.rootPath = rootPath;
        rootDir = Path.of("/data/files", rootPath);
        if(!rootDir.toFile().exists() && !rootDir.toFile().mkdirs()){
            throw new RuntimeException("Could not create root directory for file storage");
        }
    }

    public final void storeFile(final String name, final byte[] content) throws IOException {
        storeFile(null, name, content, false);
    }

    public final void storeFile(final String dir, final String name, final byte[] content) throws IOException {
        storeFile(dir, name, content, false);
    }


    public final void storeFile(final String dir, final String name, final byte[] content, final boolean override) throws IOException {
        final Path path;

        if(null == dir || dir.isBlank()){
            path = rootDir.resolve(name);
        }else {
            final Path dirPath = rootDir.resolve(dir);
            if (!dirPath.toFile().exists() && !dirPath.toFile().mkdirs()) {
                throw new IOException("Could not create directory " + dir);
            }
            path = dirPath.resolve(name);
        }

        if(path.toFile().exists() && !override){
            throw new IOException("File with name " + name + " already exists");
        }

        Files.write(path, content);
    }

    public FileObject getFile(final String name) throws IOException {
        final Path path = rootDir.resolve(name);
        if(!path.toFile().exists()){
            throw new IOException("File with name " + name + " does not exist");
        }

        return new FileObject(name, Files.readAllBytes(path), path.toFile().length());

    }

    public List<FileObject> listFiles(String ticketId) throws IOException{
        final Path path = rootDir.resolve(ticketId);
        return Files.list(path).map(FileObject::fromPath).toList();
    }

    public final void deleteFile(final String name) throws IOException {
        final Path path = rootDir.resolve(name);
        if(path.toFile().exists() && !Files.deleteIfExists(path)){
            throw new IOException("Could not delete file with name " + name);
        }
    }

    public boolean fileExists(final String name){
        final Path path = rootDir.resolve(name);
        return path.toFile().exists();
    }

    public String getRootPath() {
        return rootPath;
    }

    public Path getRootDir() {
        return rootDir;
    }

    public void deleteFile(final String id, final String name) throws IOException {
        deleteFile(id+"/"+name);
    }

    public List<String> getAllLines(final String s) {
        final Path path = rootDir.resolve(s);
        if(!path.toFile().exists()){
            throw new RuntimeException("File with name " + s + " does not exist");
        }
        try {
            return Files.readAllLines(path);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file with name " + s, e);
        }
    }

    public record FileObject(String name, byte[] content, long size){

        public static FileObject fromPath(Path path){
            try{
                return new FileObject(path.getFileName().toString(), Files.readAllBytes(path), path.toFile().length());
            }catch (IOException ex){
                throw new RuntimeException("Could not read file " + path.getFileName(), ex);
            }
        }
    }
}
