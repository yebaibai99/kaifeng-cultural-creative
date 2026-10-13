package com.kaifeng.wenchuang.service;

import com.kaifeng.wenchuang.domain.*;
import com.kaifeng.wenchuang.repo.OrderRepo;
import com.kaifeng.wenchuang.repo.ProductRepo;
import com.kaifeng.wenchuang.repo.RefundRepo;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefundService {
    private final RefundRepo refundRepo;
    private final OrderRepo orderRepo;
    private final ProductRepo productRepo;

    public RefundService(RefundRepo refundRepo, OrderRepo orderRepo, ProductRepo productRepo) {
        this.refundRepo = refundRepo;
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }

    public List<RefundEntity> listByUser(long userId) {
        return refundRepo.findByUserIdOrderByIdDesc(userId);
    }

    public List<RefundEntity> listByOrder(long orderId) {
        return refundRepo.findByOrderIdOrderByIdDesc(orderId);
    }

    public Page<RefundEntity> listAll(int page, int size) {
        int p = Math.max(0, page);
        int s = Math.min(50, Math.max(1, size));
        return refundRepo.findAllByOrderByIdDesc(PageRequest.of(p, s));
    }

    public Page<RefundEntity> listAllByStatus(RefundStatus status, int page, int size) {
        int p = Math.max(0, page);
        int s = Math.min(50, Math.max(1, size));
        return refundRepo.findByStatusOrderByIdDesc(status, PageRequest.of(p, s));
    }

    @Transactional
    public RefundEntity apply(long userId, long orderId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("REFUND_REASON_REQUIRED");
        }

        OrderEntity order = orderRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));

        if (order.userId == null || order.userId != userId) {
            throw new IllegalArgumentException("FORBIDDEN");
        }

        if (order.status != OrderStatus.PAID && order.status != OrderStatus.SHIPPED && order.status != OrderStatus.RECEIVED) {
            throw new IllegalArgumentException("ORDER_NOT_REFUNDABLE");
        }

        long existingCount = refundRepo.findByOrderIdOrderByIdDesc(orderId).stream()
                .filter(r -> r.status == RefundStatus.PENDING)
                .count();
        if (existingCount > 0) {
            throw new IllegalArgumentException("REFUND_ALREADY_EXISTS");
        }

        RefundEntity refund = new RefundEntity();
        refund.orderId = orderId;
        refund.userId = userId;
        refund.reason = reason.trim();
        refund.amountCents = order.totalCents;
        refund.status = RefundStatus.PENDING;
        return refundRepo.save(refund);
    }

    @Transactional
    public RefundEntity approve(long refundId, String note) {
        RefundEntity refund = refundRepo.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("REFUND_NOT_FOUND"));

        if (refund.status != RefundStatus.PENDING) {
            throw new IllegalArgumentException("REFUND_ALREADY_HANDLED");
        }

        refund.status = RefundStatus.APPROVED;
        refund.handlerNote = note;
        refund.handledAt = Instant.now();

        OrderEntity order = orderRepo.findById(refund.orderId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));
        order.status = OrderStatus.CANCELLED;
        orderRepo.save(order);

        return refundRepo.save(refund);
    }

    @Transactional
    public RefundEntity reject(long refundId, String note) {
        RefundEntity refund = refundRepo.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("REFUND_NOT_FOUND"));

        if (refund.status != RefundStatus.PENDING) {
            throw new IllegalArgumentException("REFUND_ALREADY_HANDLED");
        }

        refund.status = RefundStatus.REJECTED;
        refund.handlerNote = note;
        refund.handledAt = Instant.now();
        return refundRepo.save(refund);
    }
}