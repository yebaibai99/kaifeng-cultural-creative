package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.CreatorApplicationEntity;
import com.kaifeng.wenchuang.security.SecurityUtil;
import com.kaifeng.wenchuang.service.CreatorApplicationService;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/creator")
public class CreatorApplicationController {
  private final CreatorApplicationService creatorApplicationService;

  public CreatorApplicationController(CreatorApplicationService creatorApplicationService) {
    this.creatorApplicationService = creatorApplicationService;
  }

  public record SubmitReq(
      @NotBlank String real_name,
      @NotBlank String id_number,
      String portfolio_url,
      String note) {}

  public record ReviewReq(String note) {}

  @GetMapping("/application")
  public ResponseEntity<?> myLatest() {
    long userId = SecurityUtil.requireUser().userId();
    return creatorApplicationService
        .myLatest(userId)
        .<ResponseEntity<?>>map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.ok(Map.of("exists", false)));
  }

  @PostMapping("/apply")
  public ResponseEntity<?> submit(@RequestBody SubmitReq req) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      CreatorApplicationEntity app =
          creatorApplicationService.submit(userId, req.real_name, req.id_number, req.portfolio_url, req.note);
      return ResponseEntity.ok(app);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/pending")
  @PreAuthorize("hasRole('ADMIN')")
  public List<CreatorApplicationEntity> pending() {
    return creatorApplicationService.listPending();
  }

  @GetMapping("/approved")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> approved() {
    try {
      return ResponseEntity.ok(creatorApplicationService.listApproved());
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/rejected")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> rejected() {
    try {
      return ResponseEntity.ok(creatorApplicationService.listRejected());
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/applications")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> applications() {
    try {
      return ResponseEntity.ok(creatorApplicationService.listAll());
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/applications/{id}/approve")
  @PreAuthorize("hasRole('ADMIN')")
  public CreatorApplicationEntity approve(@PathVariable long id) {
    return creatorApplicationService.approve(id);
  }

  @PostMapping("/applications/{id}/reject")
  @PreAuthorize("hasRole('ADMIN')")
  public CreatorApplicationEntity reject(@PathVariable long id, @RequestBody(required = false) ReviewReq req) {
    return creatorApplicationService.reject(id, req == null ? null : req.note);
  }
}

