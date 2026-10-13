package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.CategoryEntity;
import com.kaifeng.wenchuang.service.CategoryService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {
  private final CategoryService categoryService;

  public AdminCategoryController(CategoryService categoryService) {
    this.categoryService = categoryService;
  }

  @GetMapping
  public List<CategoryEntity> list() {
    return categoryService.listAll();
  }

  @GetMapping("/active")
  public ResponseEntity<?> listActive() {
    return ResponseEntity.ok(categoryService.listActive());
  }

  @GetMapping("/root")
  public ResponseEntity<?> listRoot() {
    return ResponseEntity.ok(categoryService.listRoot());
  }

  @GetMapping("/parent/{parentId}")
  public ResponseEntity<?> listByParent(@PathVariable Long parentId) {
    return ResponseEntity.ok(categoryService.listByParent(parentId));
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody CategoryEntity req) {
    try {
      return ResponseEntity.ok(categoryService.create(req));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable long id, @RequestBody CategoryEntity req) {
    try {
      return ResponseEntity.ok(categoryService.update(id, req));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable long id) {
    try {
      categoryService.delete(id);
      return ResponseEntity.ok(Map.of("message", "分类已删除"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}