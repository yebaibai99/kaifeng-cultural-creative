package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "refunds")
public class RefundEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "order_id", nullable = false)
    public Long orderId;

    @Column(name = "user_id", nullable = false)
    public Long userId;

    @Column(name = "reason", nullable = false, columnDefinition = "text")
    public String reason;

    @Column(name = "amount_cents", nullable = false)
    public Integer amountCents;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 16, columnDefinition = "varchar(16)")
    public RefundStatus status = RefundStatus.PENDING;

    @Column(name = "handler_note", columnDefinition = "text")
    public String handlerNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt = Instant.now();

    @Column(name = "handled_at")
    public Instant handledAt;
}