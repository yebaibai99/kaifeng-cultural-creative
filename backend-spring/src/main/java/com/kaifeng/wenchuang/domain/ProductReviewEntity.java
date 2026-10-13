package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "product_reviews")
public class ProductReviewEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(name = "product_id", nullable = false)
  public Long productId;

  @Column(name = "user_id", nullable = false)
  public Long userId;

  @Column(nullable = false)
  public Integer rating;

  @Column(columnDefinition = "text")
  public String content;

  @Column(name = "image_urls_json", nullable = false, columnDefinition = "text")
  public String imageUrlsJson = "[]";

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false, length = 16, columnDefinition = "varchar(16)")
  public ReviewStatus status = ReviewStatus.VISIBLE;

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}

