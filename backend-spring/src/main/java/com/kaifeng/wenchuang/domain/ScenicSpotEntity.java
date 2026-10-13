package com.kaifeng.wenchuang.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "scenic_spots")
public class ScenicSpotEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 128)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "cover_image_url", nullable = false, length = 512)
    public String coverImageUrl = "";

    @Column(name = "sort_order", nullable = false)
    public Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    public Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt = Instant.now();
}