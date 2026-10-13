package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "users")
public class UserEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(length = 190, unique = true)
  public String email;

  @Column(length = 32, unique = true)
  public String phone;

  @Column(name = "password_hash", nullable = false)
  public String passwordHash;

  @Column(nullable = false, length = 64)
  public String nickname;

  @Column(name = "avatar_url", nullable = false, length = 512)
  public String avatarUrl = "";

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false, length = 16, columnDefinition = "varchar(16)")
  public Role role = Role.USER;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(name = "creator_status", nullable = false, length = 16, columnDefinition = "varchar(16)")
  public CreatorStatus creatorStatus = CreatorStatus.NONE;

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}

