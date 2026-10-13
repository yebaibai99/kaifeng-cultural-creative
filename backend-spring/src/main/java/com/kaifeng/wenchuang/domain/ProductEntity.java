package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "products")
public class ProductEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(name = "creator_id")
  public Long creatorId;

  @Column(nullable = false, length = 128)
  public String title;

  @Column(nullable = false, length = 255)
  public String subtitle = "";

  @Column(nullable = false, length = 64)
  public String category = "";

  @Column(name = "price_cents", nullable = false)
  public Integer priceCents;

  @Column(nullable = false)
  public Integer stock = 0;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false, length = 16, columnDefinition = "varchar(16)")
  public ProductStatus status = ProductStatus.ON;

  @Column(name = "cover_image_url", nullable = false, length = 512)
  public String coverImageUrl = "";

  @Column(name = "image_urls_json", nullable = false, columnDefinition = "text")
  public String imageUrlsJson = "[]";

  @Column(name = "video_urls_json", nullable = false, columnDefinition = "text")
  public String videoUrlsJson = "[]";

  @Column(name = "cultural_story", columnDefinition = "text")
  public String culturalStory;

  @Column(name = "craft_info", columnDefinition = "text")
  public String craftInfo;

  @Column(name = "specs_text", columnDefinition = "text")
  public String specsText;

  @Column(name = "scene_text", columnDefinition = "text")
  public String sceneText;

  @Column(columnDefinition = "text")
  public String description;

  @Column(name = "sales_count", nullable = false)
  public Integer salesCount = 0;

  @Column(name = "scenic_spot", length = 64)
  public String scenicSpot = "";

  @Column(name = "created_at", nullable = false, updatable = false)
  public Instant createdAt = Instant.now();
}