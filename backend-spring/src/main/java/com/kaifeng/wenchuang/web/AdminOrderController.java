package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.OrderEntity;
import com.kaifeng.wenchuang.domain.OrderItemEntity;
import com.kaifeng.wenchuang.service.OrderService;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {
  private final OrderService orderService;

  public AdminOrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @GetMapping
  public ResponseEntity<?> list(
      @RequestParam(required = false, defaultValue = "1") int page,
      @RequestParam(required = false, defaultValue = "10") int size,
      @RequestParam(required = false, defaultValue = "") String keyword) {
    Pageable pageable = PageRequest.of(page - 1, size);
    Page<OrderEntity> orderPage = orderService.listAll(pageable, keyword);
    return ResponseEntity.ok(Map.of(
        "orders", orderPage.getContent(),
        "total", orderPage.getTotalElements(),
        "page", page,
        "size", size
    ));
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> detail(@PathVariable long id) {
    try {
      OrderEntity o = orderService.getAny(id);
      List<OrderItemEntity> items = orderService.items(o.id);
      return ResponseEntity.ok(Map.of("order", o, "items", items));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/{id}/ship")
  public ResponseEntity<?> ship(@PathVariable long id) {
    try {
      return ResponseEntity.ok(orderService.ship(id));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/{id}/done")
  public ResponseEntity<?> done(@PathVariable long id) {
    try {
      return ResponseEntity.ok(orderService.done(id));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}

