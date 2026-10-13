package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "cart_items",
    uniqueConstraints = {@UniqueConstraint(name = "uk_cart_user_product", columnNames = {"user_id", "product_id"})})
public class CartItemEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(name = "user_id", nullable = false)
  public Long userId;

  @Column(name = "product_id", nullable = false)
  public Long productId;

  @Column(name = "qty", nullable = false)
  public Integer qty;

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}

