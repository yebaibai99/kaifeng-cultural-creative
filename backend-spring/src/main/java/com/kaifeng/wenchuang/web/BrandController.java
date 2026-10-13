package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.BrandEntity;
import com.kaifeng.wenchuang.service.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

  private final BrandService brandService;

  public BrandController(BrandService brandService) {
    this.brandService = brandService;
  }

  @GetMapping("/active")
  public ResponseEntity<?> listActive() {
    return ResponseEntity.ok(brandService.listActive());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getById(@PathVariable long id) {
    return brandService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
  }
}
