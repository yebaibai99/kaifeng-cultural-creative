package com.kaifeng.wenchuang.web;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/uploads")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUploadController {

  private static final long MAX_BYTES = 5 * 1024 * 1024;

  @Value("${app.upload.dir:./data/uploads}")
  private String uploadDir;

  @PostMapping(value = "/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> uploadCover(@RequestParam("file") MultipartFile file) {
    if (file == null || file.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "FILE_REQUIRED"));
    }
    if (file.getSize() > MAX_BYTES) {
      return ResponseEntity.badRequest().body(Map.of("error", "FILE_TOO_LARGE"));
    }
    String ct = file.getContentType();
    if (ct == null || !ct.toLowerCase(Locale.ROOT).startsWith("image/")) {
      return ResponseEntity.badRequest().body(Map.of("error", "NOT_IMAGE"));
    }
    if (!isAllowedImageType(ct)) {
      return ResponseEntity.badRequest().body(Map.of("error", "UNSUPPORTED_IMAGE_TYPE"));
    }

    String ext = extensionForContentType(ct);
    String name = UUID.randomUUID() + ext;
    Path root = Path.of(uploadDir).toAbsolutePath().normalize();
    Path covers = root.resolve("covers");
    try {
      Files.createDirectories(covers);
      Path target = covers.resolve(name);
      file.transferTo(target.toFile());
    } catch (IOException e) {
      return ResponseEntity.internalServerError().body(Map.of("error", "UPLOAD_FAILED"));
    }

    String url = "/uploads/covers/" + name;
    return ResponseEntity.ok(Map.of("url", url));
  }

  private static boolean isAllowedImageType(String contentType) {
    return contentType.equalsIgnoreCase(MediaType.IMAGE_JPEG_VALUE)
        || contentType.equalsIgnoreCase(MediaType.IMAGE_PNG_VALUE)
        || contentType.equalsIgnoreCase("image/gif")
        || contentType.equalsIgnoreCase("image/webp");
  }

  private static String extensionForContentType(String contentType) {
    if (contentType.equalsIgnoreCase(MediaType.IMAGE_JPEG_VALUE)) return ".jpg";
    if (contentType.equalsIgnoreCase(MediaType.IMAGE_PNG_VALUE)) return ".png";
    if (contentType.equalsIgnoreCase("image/gif")) return ".gif";
    if (contentType.equalsIgnoreCase("image/webp")) return ".webp";
    return ".bin";
  }
}
