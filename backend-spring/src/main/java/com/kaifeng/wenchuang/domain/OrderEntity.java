package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "orders")
public class OrderEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(name = "user_id", nullable = false)
  public Long userId;

  @Column(name = "buyer_name", nullable = false, length = 64)
  public String buyerName;

  @Column(name = "buyer_phone", nullable = false, length = 32)
  public String buyerPhone;

  @Column(name = "buyer_address", nullable = false, length = 512)
  public String buyerAddress;

  @Column(name = "total_cents", nullable = false)
  public Integer totalCents;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false, length = 16, columnDefinition = "varchar(16)")
  public OrderStatus status = OrderStatus.CREATED;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(name = "refund_status", nullable = false, length = 16, columnDefinition = "varchar(16)")
  public RefundStatus refundStatus = RefundStatus.NONE;

  @Column(name = "refund_reason", columnDefinition = "text")
  public String refundReason;

  @Column(name = "refund_amount_cents")
  public Integer refundAmountCents;

  @Column(name = "refund_applied_at")
  public Instant refundAppliedAt;

  @Column(name = "refund_processed_at")
  public Instant refundProcessedAt;

  @Column(name = "refund_remark", columnDefinition = "text")
  public String refundRemark;

  @Column(name = "order_no", unique = true, length = 32)
  public String orderNo;

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}