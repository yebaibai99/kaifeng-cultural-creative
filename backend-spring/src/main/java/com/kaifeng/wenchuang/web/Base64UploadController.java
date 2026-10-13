package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.security.JwtUser;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * Base64 图片上传控制器
 * 将图片以 Base64 格式存储，避免依赖本地文件系统
 */
@RestController
@RequestMapping("/api/uploads")
public class Base64UploadController {

    private static final long MAX_BASE64_SIZE = 500 * 1024; // 500KB

    /**
     * 接收 Base64 编码的图片，直接返回 Data URL
     * @param payload {"base64": "data:image/png;base64,iVBOR..."}
     * @param jwtUser 当前用户
     * @return {"url": "data:image/png;base64,iVBOR..."}
     */
    @PostMapping(value = "/base64", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> uploadBase64(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal JwtUser jwtUser) {

        String base64Data = payload.get("base64");
        if (base64Data == null || base64Data.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "BASE64_REQUIRED"));
        }

        // 验证大小
        if (base64Data.length() > MAX_BASE64_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "FILE_TOO_LARGE"));
        }

        // 验证格式（必须是 data:image/ 开头）
        if (!base64Data.startsWith("data:image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_FORMAT"));
        }

        // 直接返回 Base64 URL（data URL 格式）
        // 前端可以直接使用这个字符串作为图片源
        String dataUrl = base64Data;
        return ResponseEntity.ok(Map.of("url", dataUrl));
    }
}