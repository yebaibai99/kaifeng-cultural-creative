package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "order_items")
public class OrderItemEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(name = "order_id", nullable = false)
  public Long orderId;

  @Column(name = "product_id", nullable = false)
  public Long productId;

  @Column(nullable = false, length = 128)
  public String title;

  @Column(name = "price_cents", nullable = false)
  public Integer priceCents;

  @Column(name = "qty", nullable = false)
  public Integer qty;

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}

