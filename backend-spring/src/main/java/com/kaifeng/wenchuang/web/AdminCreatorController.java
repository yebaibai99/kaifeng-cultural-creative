package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.CreatorApplicationEntity;
import com.kaifeng.wenchuang.domain.CreatorStatus;
import com.kaifeng.wenchuang.domain.UserEntity;
import com.kaifeng.wenchuang.repo.CreatorApplicationRepo;
import com.kaifeng.wenchuang.repo.UserRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/creators")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCreatorController {

    private final UserRepo userRepo;
    private final CreatorApplicationRepo creatorApplicationRepo;

    public AdminCreatorController(UserRepo userRepo, CreatorApplicationRepo creatorApplicationRepo) {
        this.userRepo = userRepo;
        this.creatorApplicationRepo = creatorApplicationRepo;
    }

    public record CreatorDTO(
            Long id,
            String email,
            String phone,
            String nickname,
            String avatarUrl,
            String realName,
            String idNumber,
            String portfolioUrl,
            String note,
            String creatorStatus,
            String applicationStatus,
            String createdAt,
            Long applicationId) {}

    /**
     * 获取创作者列表（分页）
     */
    @GetMapping
    public ResponseEntity<?> getCreators(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<UserEntity> usersPage;

        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.trim() + "%";
            usersPage = userRepo.findByNicknameContainingOrEmailContaining(kw, kw, pageRequest);
        } else {
            usersPage = userRepo.findAll(pageRequest);
        }

        // Get all applications to map to users
        List<CreatorApplicationEntity> allApplications = creatorApplicationRepo.findAll();
        Map<Long, CreatorApplicationEntity> userAppMap = allApplications.stream()
                .collect(Collectors.toMap(
                        app -> app.userId,
                        app -> app,
                        (existing, replacement) -> existing
                ));

        List<CreatorDTO> creators = usersPage.getContent().stream()
                .filter(u -> u.creatorStatus != CreatorStatus.NONE)
                .filter(u -> {
                    if (status == null || status.isBlank()) return true;
                    return u.creatorStatus == CreatorStatus.valueOf(status);
                })
                .map(u -> {
                    CreatorApplicationEntity app = userAppMap.get(u.id);
                    return new CreatorDTO(
                            u.id,
                            u.email,
                            u.phone,
                            u.nickname,
                            u.avatarUrl,
                            app != null ? app.realName : null,
                            app != null ? app.idNumber : null,
                            app != null ? app.portfolioUrl : null,
                            app != null ? app.note : null,
                            u.creatorStatus.name(),
                            app != null ? app.status.name() : null,
                            u.createdAt.toString(),
                            app != null ? app.id : null);
                })
                .toList();

        return ResponseEntity.ok(Map.of(
                "creators", creators,
                "total", creators.size(),
                "page", page,
                "size", size));
    }

    /**
     * 获取创作者详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCreator(@PathVariable Long id) {
        return userRepo.findById(id)
                .filter(u -> u.creatorStatus != CreatorStatus.NONE)
                .map(u -> {
                    CreatorApplicationEntity app = creatorApplicationRepo.findByUserId(u.id).orElse(null);
                    return ResponseEntity.ok(new CreatorDTO(
                            u.id,
                            u.email,
                            u.phone,
                            u.nickname,
                            u.avatarUrl,
                            app != null ? app.realName : null,
                            app != null ? app.idNumber : null,
                            app != null ? app.portfolioUrl : null,
                            app != null ? app.note : null,
                            u.creatorStatus.name(),
                            app != null ? app.status.name() : null,
                            u.createdAt.toString(),
                            app != null ? app.id : null));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 修改创作者状态
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCreatorStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newStatus = body.get("creatorStatus");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "STATUS_REQUIRED"));
        }

        return userRepo.findById(id)
                .map(u -> {
                    u.creatorStatus = CreatorStatus.valueOf(newStatus);
                    userRepo.save(u);
                    return ResponseEntity.ok(Map.of("message", "创作者状态已更新"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 禁用/启用创作者
     */
    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggleCreator(@PathVariable Long id) {
        return userRepo.findById(id)
                .map(u -> {
                    if (u.creatorStatus == CreatorStatus.APPROVED) {
                        u.creatorStatus = CreatorStatus.REJECTED;
                    } else if (u.creatorStatus == CreatorStatus.REJECTED) {
                        u.creatorStatus = CreatorStatus.APPROVED;
                    }
                    userRepo.save(u);
                    return ResponseEntity.ok(Map.of(
                            "message", "状态已切换",
                            "newStatus", u.creatorStatus.name()));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}