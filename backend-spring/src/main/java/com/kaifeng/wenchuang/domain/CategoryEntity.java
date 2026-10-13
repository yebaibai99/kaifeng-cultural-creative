package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "categories")
public class CategoryEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false, length = 64)
  public String name;

  @Column(name = "parent_id")
  public Long parentId;

  @Column(nullable = false)
  public Integer sort = 0;

  @Column(nullable = false)
  public Boolean enabled = true;

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}