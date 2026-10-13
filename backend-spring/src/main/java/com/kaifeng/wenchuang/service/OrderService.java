package com.kaifeng.wenchuang.service;

import com.kaifeng.wenchuang.domain.*;
import com.kaifeng.wenchuang.repo.CartItemRepo;
import com.kaifeng.wenchuang.repo.OrderItemRepo;
import com.kaifeng.wenchuang.repo.OrderRepo;
import com.kaifeng.wenchuang.repo.ProductRepo;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
  private final CartItemRepo cartItemRepo;
  private final ProductRepo productRepo;
  private final OrderRepo orderRepo;
  private final OrderItemRepo orderItemRepo;

  public OrderService(
          CartItemRepo cartItemRepo, ProductRepo productRepo, OrderRepo orderRepo, OrderItemRepo orderItemRepo) {
    this.cartItemRepo = cartItemRepo;
    this.productRepo = productRepo;
    this.orderRepo = orderRepo;
    this.orderItemRepo = orderItemRepo;
  }

  public List<OrderEntity> listByUser(long userId) {
    return orderRepo.findByUserIdOrderByIdDesc(userId);
  }

  public List<OrderEntity> listAll() {
    return orderRepo.findAllByOrderByIdDesc();
  }

  public Page<OrderEntity> listAll(Pageable pageable, String keyword) {
    if (keyword == null || keyword.isBlank()) {
      return orderRepo.findAllByOrderByIdDesc(pageable);
    } else {
      return orderRepo.findByOrderNoContainingOrBuyerNameContainingOrderByIdDesc(keyword, keyword, pageable);
    }
  }

  public List<OrderEntity> listByRefundStatus(RefundStatus status) {
    return orderRepo.findByRefundStatusOrderByIdDesc(status);
  }

  public OrderEntity getForUser(long userId, long orderId) {
    OrderEntity o = orderRepo.findById(orderId).orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));
    if (o.userId == null || o.userId != userId) throw new IllegalArgumentException("FORBIDDEN");
    return o;
  }

  public OrderEntity getAny(long orderId) {
    return orderRepo.findById(orderId).orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));
  }

  public List<OrderItemEntity> items(long orderId) {
    return orderItemRepo.findByOrderIdOrderByIdAsc(orderId);
  }

  @Transactional
  public OrderEntity createFromCart(long userId, String buyerName, String buyerPhone, String buyerAddress) {
    List<CartItemEntity> cart = cartItemRepo.findByUserIdOrderByIdDesc(userId);
    if (cart.isEmpty()) throw new IllegalArgumentException("CART_EMPTY");

    int total = 0;
    List<OrderItemEntity> items = new ArrayList<>();

    for (CartItemEntity ci : cart) {
      ProductEntity p =
              productRepo.findById(ci.productId).orElseThrow(() -> new IllegalArgumentException("PRODUCT_NOT_FOUND"));
      int qty = Math.max(1, ci.qty);
      if (p.stock == null || p.stock < qty) throw new IllegalArgumentException("INSUFFICIENT_STOCK");

      total += p.priceCents * qty;

      OrderItemEntity oi = new OrderItemEntity();
      oi.productId = p.id;
      oi.title = p.title;
      oi.priceCents = p.priceCents;
      oi.qty = qty;
      items.add(oi);
    }

    for (OrderItemEntity oi : items) {
      ProductEntity p = productRepo.findById(oi.productId).orElseThrow();
      p.stock = p.stock - oi.qty;
      p.salesCount = (p.salesCount == null ? 0 : p.salesCount) + oi.qty;
      productRepo.save(p);
    }

    OrderEntity o = new OrderEntity();
    o.userId = userId;
    o.buyerName = buyerName;
    o.buyerPhone = buyerPhone;
    o.buyerAddress = buyerAddress;
    o.totalCents = total;
    o.status = OrderStatus.CREATED;
    // 生成订单编号：时间戳 + 4位随机数 + 用户ID后4位
    String timestamp = String.valueOf(System.currentTimeMillis());
    String random = String.format("%04d", (int)(Math.random() * 10000));
    String userIdSuffix = String.format("%04d", userId % 10000);
    o.orderNo = timestamp + random + userIdSuffix;
    o = orderRepo.save(o);

    for (OrderItemEntity oi : items) {
      oi.orderId = o.id;
      orderItemRepo.save(oi);
    }

    cartItemRepo.deleteByUserId(userId);
    return o;
  }

  @Transactional
  public OrderEntity pay(long userId, long orderId) {
    OrderEntity o = getForUser(userId, orderId);
    if (o.status != OrderStatus.CREATED) throw new IllegalArgumentException("BAD_ORDER_STATUS");
    o.status = OrderStatus.PAID;
    return orderRepo.save(o);
  }

  @Transactional
  public OrderEntity receive(long userId, long orderId) {
    OrderEntity o = getForUser(userId, orderId);
    if (o.status != OrderStatus.SHIPPED && o.status != OrderStatus.PAID) {
      throw new IllegalArgumentException("BAD_ORDER_STATUS");
    }
    o.status = OrderStatus.RECEIVED;
    return orderRepo.save(o);
  }

  @Transactional
  public OrderEntity cancel(long userId, long orderId) {
    OrderEntity o = getForUser(userId, orderId);
    if (o.status != OrderStatus.CREATED) throw new IllegalArgumentException("BAD_ORDER_STATUS");
    o.status = OrderStatus.CANCELLED;
    return orderRepo.save(o);
  }

  @Transactional
  public OrderEntity ship(long orderId) {
    OrderEntity o = getAny(orderId);
    if (o.status != OrderStatus.PAID) throw new IllegalArgumentException("BAD_ORDER_STATUS");
    o.status = OrderStatus.SHIPPED;
    return orderRepo.save(o);
  }

  @Transactional
  public OrderEntity done(long orderId) {
    OrderEntity o = getAny(orderId);
    if (o.status != OrderStatus.RECEIVED) throw new IllegalArgumentException("BAD_ORDER_STATUS");
    o.status = OrderStatus.DONE;
    return orderRepo.save(o);
  }

  @Transactional
  public OrderEntity applyRefund(long userId, long orderId, String reason, int amountCents) {
    OrderEntity o = getForUser(userId, orderId);
    if (o.status != OrderStatus.PAID && o.status != OrderStatus.SHIPPED && o.status != OrderStatus.RECEIVED) {
      throw new IllegalArgumentException("ONLY_PAID_OR_SHIPPED_OR_RECEIVED_CAN_REFUND");
    }
    if (o.refundStatus != RefundStatus.NONE && o.refundStatus != RefundStatus.REJECTED) {
      throw new IllegalArgumentException("REFUND_ALREADY_EXISTS");
    }
    if (reason == null || reason.isBlank()) {
      throw new IllegalArgumentException("REFUND_REASON_REQUIRED");
    }
    if (amountCents <= 0 || amountCents > o.totalCents) {
      throw new IllegalArgumentException("INVALID_REFUND_AMOUNT");
    }
    o.refundStatus = RefundStatus.PENDING;
    o.refundReason = reason;
    o.refundAmountCents = amountCents;
    o.refundAppliedAt = Instant.now();
    return orderRepo.save(o);
  }

  @Transactional
  public OrderEntity approveRefund(long orderId, String remark) {
    OrderEntity o = getAny(orderId);
    if (o.refundStatus != RefundStatus.PENDING) {
      throw new IllegalArgumentException("BAD_REFUND_STATUS");
    }
    o.refundStatus = RefundStatus.APPROVED;
    o.refundRemark = remark;
    o.refundProcessedAt = Instant.now();
    return orderRepo.save(o);
  }

  @Transactional
  public OrderEntity rejectRefund(long orderId, String remark) {
    OrderEntity o = getAny(orderId);
    if (o.refundStatus != RefundStatus.PENDING) {
      throw new IllegalArgumentException("BAD_REFUND_STATUS");
    }
    o.refundStatus = RefundStatus.REJECTED;
    o.refundRemark = remark;
    o.refundProcessedAt = Instant.now();
    return orderRepo.save(o);
  }
}