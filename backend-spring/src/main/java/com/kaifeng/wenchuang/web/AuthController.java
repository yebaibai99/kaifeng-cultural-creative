package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.Role;
import com.kaifeng.wenchuang.domain.UserEntity;
import com.kaifeng.wenchuang.repo.UserRepo;
import com.kaifeng.wenchuang.security.JwtService;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepo userRepo;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthController(UserRepo userRepo, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepo = userRepo;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public record RegisterReq(
      String email,
      String phone,
      @NotBlank String password,
      @NotBlank String nickname) {}

  public record LoginReq(String email, String phone, @NotBlank String password) {}

  public record AuthResp(String access_token, long user_id, String role, String nickname) {}

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterReq req) {
    if ((req.email == null || req.email.isBlank()) && (req.phone == null || req.phone.isBlank())) {
      return ResponseEntity.badRequest().body(new Err("EMAIL_OR_PHONE_REQUIRED"));
    }
    if (req.password == null || req.password.isBlank()) {
      return ResponseEntity.badRequest().body(new Err("PASSWORD_REQUIRED"));
    }
    if (req.nickname == null || req.nickname.isBlank()) {
      return ResponseEntity.badRequest().body(new Err("NICKNAME_REQUIRED"));
    }

    if (req.email != null && !req.email.isBlank() && userRepo.findByEmail(req.email).isPresent()) {
      return ResponseEntity.badRequest().body(new Err("EMAIL_EXISTS"));
    }
    if (req.phone != null && !req.phone.isBlank() && userRepo.findByPhone(req.phone).isPresent()) {
      return ResponseEntity.badRequest().body(new Err("PHONE_EXISTS"));
    }

    UserEntity u = new UserEntity();
    u.email = req.email != null && !req.email.isBlank() ? req.email : null;
    u.phone = req.phone != null && !req.phone.isBlank() ? req.phone : null;
    u.nickname = req.nickname.trim();
    u.role = Role.USER;
    u.passwordHash = passwordEncoder.encode(req.password);
    u = userRepo.save(u);

    String token = jwtService.issueAccessToken(u.id, u.role);
    return ResponseEntity.ok(new AuthResp(token, u.id, u.role.name(), u.nickname));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginReq req) {
    Optional<UserEntity> u =
        (req.email != null && !req.email.isBlank())
            ? userRepo.findByEmail(req.email)
            : (req.phone != null && !req.phone.isBlank()) ? userRepo.findByPhone(req.phone) : Optional.empty();

    if (u.isEmpty()) return ResponseEntity.status(401).body(new Err("INVALID_CREDENTIALS"));

    if (!passwordEncoder.matches(req.password, u.get().passwordHash)) {
      return ResponseEntity.status(401).body(new Err("INVALID_CREDENTIALS"));
    }

    String token = jwtService.issueAccessToken(u.get().id, u.get().role);
    return ResponseEntity.ok(new AuthResp(token, u.get().id, u.get().role.name(), u.get().nickname));
  }

  public record Err(String error) {}
}

