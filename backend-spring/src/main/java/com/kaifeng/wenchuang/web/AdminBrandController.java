package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.BrandEntity;
import com.kaifeng.wenchuang.service.BrandService;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/brands")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBrandController {
  private final BrandService brandService;

  public AdminBrandController(BrandService brandService) {
    this.brandService = brandService;
  }

  @GetMapping
  public Map<String, Object> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
    Page<BrandEntity> p = brandService.listAll(page, size);
    return Map.of(
            "page", p.getNumber(),
            "size", p.getSize(),
            "total", p.getTotalElements(),
            "items", p.getContent());
  }

  @GetMapping("/active")
  public ResponseEntity<?> listActive() {
    return ResponseEntity.ok(brandService.listActive());
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody BrandEntity req) {
    try {
      return ResponseEntity.ok(brandService.create(req));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable long id, @RequestBody BrandEntity req) {
    try {
      return ResponseEntity.ok(brandService.update(id, req));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable long id) {
    try {
      brandService.delete(id);
      return ResponseEntity.ok(Map.of("message", "品牌已删除"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}