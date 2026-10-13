package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.OrderEntity;
import com.kaifeng.wenchuang.domain.RefundStatus;
import com.kaifeng.wenchuang.service.OrderService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/refunds")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRefundController {
    private final OrderService orderService;

    public AdminRefundController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String status) {
        RefundStatus s = status != null && !status.isBlank() ? RefundStatus.valueOf(status) : null;
        List<OrderEntity> orders;
        if (s != null) {
            orders = orderService.listByRefundStatus(s);
        } else {
            orders = orderService.listAll().stream()
                    .filter(o -> o.refundStatus != RefundStatus.NONE)
                    .toList();
        }
        return Map.of("items", orders);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRefund(@PathVariable long id, @RequestBody Map<String, String> body) {
        try {
            String remark = body.getOrDefault("remark", "");
            return ResponseEntity.ok(orderService.approveRefund(id, remark));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRefund(@PathVariable long id, @RequestBody Map<String, String> body) {
        try {
            String remark = body.getOrDefault("remark", "");
            return ResponseEntity.ok(orderService.rejectRefund(id, remark));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}