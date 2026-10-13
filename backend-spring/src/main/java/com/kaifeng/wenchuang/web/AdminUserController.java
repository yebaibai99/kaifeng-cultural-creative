package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.CreatorStatus;
import com.kaifeng.wenchuang.domain.Role;
import com.kaifeng.wenchuang.domain.UserEntity;
import com.kaifeng.wenchuang.repo.UserRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }


    public record UserDTO(
            Long id,
            String email,
            String phone,
            String nickname,
            String avatarUrl,
            String role,
            String creatorStatus,
            String createdAt) {}

    public record CreateUserRequest(
            String email,
            String password,
            String nickname,
            String phone,
            String role) {}


    /**
     * 创建新用户
     */

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        if (request.email == null || request.email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "邮箱不能为空"));
        }
        if (request.password == null || request.password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "密码至少6位"));
        }
        if (request.nickname == null || request.nickname.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "昵称不能为空"));
        }

        if (userRepo.findByEmail(request.email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "邮箱已存在"));
        }

        UserEntity user = new UserEntity();
        user.email = request.email;
        user.passwordHash = passwordEncoder.encode(request.password);
        user.nickname = request.nickname;
        user.phone = request.phone;
        user.role = request.role != null ? Role.valueOf(request.role) : Role.USER;
        user.creatorStatus = CreatorStatus.NONE;
        user.avatarUrl = "";

        userRepo.save(user);

        return ResponseEntity.ok(Map.of("message", "用户创建成功", "userId", user.id));
    }


    /**
     * 获取用户列表（分页）
     */
    @GetMapping
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<UserEntity> usersPage;

        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.trim() + "%";
            usersPage = userRepo.findByNicknameContainingOrEmailContaining(kw, kw, pageRequest);
        } else if (role != null && !role.isBlank()) {
            usersPage = userRepo.findByRole(Role.valueOf(role), pageRequest);
        } else {
            usersPage = userRepo.findAll(pageRequest);
        }

        List<UserDTO> users = usersPage.getContent().stream()
                .map(u -> new UserDTO(
                        u.id,
                        u.email,
                        u.phone,
                        u.nickname,
                        u.avatarUrl,
                        u.role.name(),
                        u.creatorStatus.name(),
                        u.createdAt.toString()))
                .toList();

        return ResponseEntity.ok(Map.of(
                "users", users,
                "total", usersPage.getTotalElements(),
                "page", usersPage.getNumber(),
                "size", usersPage.getSize()));
    }

    /**
     * 获取单个用户详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userRepo.findById(id)
                .map(u -> ResponseEntity.ok(new UserDTO(
                        u.id,
                        u.email,
                        u.phone,
                        u.nickname,
                        u.avatarUrl,
                        u.role.name(),
                        u.creatorStatus.name(),
                        u.createdAt.toString())))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 修改用户角色
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newRole = body.get("role");
        if (newRole == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ROLE_REQUIRED"));
        }

        return userRepo.findById(id)
                .map(u -> {
                    u.role = Role.valueOf(newRole);
                    userRepo.save(u);
                    return ResponseEntity.ok(Map.of("message", "角色已更新"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 修改创作者状态
     */
    @PutMapping("/{id}/creator-status")
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
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "用户已删除"));
    }
}