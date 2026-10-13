package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class PublicCategoryController {
  private final CategoryService categoryService;

  public PublicCategoryController(CategoryService categoryService) {
    this.categoryService = categoryService;
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
}
