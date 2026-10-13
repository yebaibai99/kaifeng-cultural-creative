package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "creator_applications")
public class CreatorApplicationEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(name = "user_id", nullable = false)
  public Long userId;

  @Column(name = "real_name", nullable = false, length = 64)
  public String realName;

  @Column(name = "id_number", nullable = false, length = 64)
  public String idNumber;

  @Column(name = "portfolio_url", nullable = false, length = 512)
  public String portfolioUrl = "";

  @Column(columnDefinition = "text")
  public String note;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false, length = 16, columnDefinition = "varchar(16)")
  public CreatorApplicationStatus status = CreatorApplicationStatus.PENDING;

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}

