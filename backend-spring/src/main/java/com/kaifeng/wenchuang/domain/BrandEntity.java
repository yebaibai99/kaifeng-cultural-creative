package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "brands")
public class BrandEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false, length = 128)
  public String name;

  @Column(length = 256)
  public String logo = "";

  @Column(columnDefinition = "text")
  public String description;

  @Column(length = 64)
  public String origin;

  @Column(name = "found_year")
  public Integer foundYear;

  @Column(nullable = false)
  public Boolean enabled = true;

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}