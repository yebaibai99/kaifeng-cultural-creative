package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.ProductEntity;
import com.kaifeng.wenchuang.domain.ProductStatus;
import com.kaifeng.wenchuang.service.ProductService;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {
  private final ProductService productService;

  public AdminProductController(ProductService productService) {
    this.productService = productService;
  }

  @GetMapping
  public Map<String, Object> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
    Page<ProductEntity> p = productService.listAll(page, size);
    return Map.of(
        "page", p.getNumber(),
        "size", p.getSize(),
        "total", p.getTotalElements(),
        "items", p.getContent());
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody ProductEntity req) {
    try {
      if (req.title == null || req.title.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "TITLE_REQUIRED"));
      if (req.priceCents == null || req.priceCents < 0) return ResponseEntity.badRequest().body(Map.of("error", "PRICE_REQUIRED"));
      return ResponseEntity.ok(productService.create(req));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable long id, @RequestBody ProductEntity req) {
    try {
      return ResponseEntity.ok(productService.update(id, req));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  public record StockReq(int stock) {}

  @PostMapping("/{id}/stock")
  public ResponseEntity<?> stock(@PathVariable long id, @RequestBody StockReq req) {
    try {
      return ResponseEntity.ok(productService.setStock(id, req.stock));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  public record StatusReq(String status) {}

  @PostMapping("/{id}/status")
  public ResponseEntity<?> status(@PathVariable long id, @RequestBody StatusReq req) {
    try {
      ProductStatus s = ProductStatus.valueOf(req.status);
      return ResponseEntity.ok(productService.setStatus(id, s));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", "BAD_STATUS"));
    }
  }

  @DeleteMapping("/{id}")
  public Map<String, Object> delete(@PathVariable long id) {
    productService.delete(id);
    return Map.of("ok", true);
  }
}

