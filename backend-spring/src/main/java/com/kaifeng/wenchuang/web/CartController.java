package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.CartItemEntity;
import com.kaifeng.wenchuang.security.SecurityUtil;
import com.kaifeng.wenchuang.service.CartService;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
  private final CartService cartService;

  public CartController(CartService cartService) {
    this.cartService = cartService;
  }

  public record AddReq(long product_id, @Min(1) int qty) {}

  public record SetQtyReq(long product_id, @Min(1) int qty) {}

  @GetMapping
  public List<CartItemEntity> list() {
    long userId = SecurityUtil.requireUser().userId();
    return cartService.list(userId);
  }

  @PostMapping
  public ResponseEntity<?> add(@RequestBody AddReq req) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      return ResponseEntity.ok(cartService.add(userId, req.product_id, req.qty));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PatchMapping
  public ResponseEntity<?> setQty(@RequestBody SetQtyReq req) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      return ResponseEntity.ok(cartService.setQty(userId, req.product_id, req.qty));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @DeleteMapping("/{productId}")
  public Map<String, Object> remove(@PathVariable long productId) {
    long userId = SecurityUtil.requireUser().userId();
    cartService.remove(userId, productId);
    return Map.of("ok", true);
  }

  @DeleteMapping
  public Map<String, Object> clear() {
    long userId = SecurityUtil.requireUser().userId();
    cartService.clear(userId);
    return Map.of("ok", true);
  }
}

