package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.OrderEntity;
import com.kaifeng.wenchuang.domain.OrderItemEntity;
import com.kaifeng.wenchuang.security.SecurityUtil;
import com.kaifeng.wenchuang.service.OrderService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  public record CreateReq(@NotBlank String buyer_name, @NotBlank String buyer_phone, @NotBlank String buyer_address) {}

  public record RefundApplyReq(@NotBlank String reason, @NotNull Integer amountCents) {}

  @GetMapping
  public List<OrderEntity> list() {
    long userId = SecurityUtil.requireUser().userId();
    return orderService.listByUser(userId);
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> detail(@PathVariable long id) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      OrderEntity o = orderService.getForUser(userId, id);
      List<OrderItemEntity> items = orderService.items(o.id);
      return ResponseEntity.ok(Map.of("order", o, "items", items));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody CreateReq req) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      OrderEntity o = orderService.createFromCart(userId, req.buyer_name, req.buyer_phone, req.buyer_address);
      return ResponseEntity.ok(o);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/{id}/pay")
  public ResponseEntity<?> pay(@PathVariable long id) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      return ResponseEntity.ok(orderService.pay(userId, id));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/{id}/receive")
  public ResponseEntity<?> receive(@PathVariable long id) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      return ResponseEntity.ok(orderService.receive(userId, id));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/{id}/cancel")
  public ResponseEntity<?> cancel(@PathVariable long id) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      return ResponseEntity.ok(orderService.cancel(userId, id));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/{id}/refund")
  public ResponseEntity<?> applyRefund(@PathVariable long id, @RequestBody RefundApplyReq req) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      return ResponseEntity.ok(orderService.applyRefund(userId, id, req.reason, req.amountCents));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}