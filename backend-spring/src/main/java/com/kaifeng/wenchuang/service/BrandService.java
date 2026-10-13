package com.kaifeng.wenchuang.service;

import com.kaifeng.wenchuang.domain.BrandEntity;
import com.kaifeng.wenchuang.repo.BrandRepo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BrandService {
  private final BrandRepo brandRepo;

  public BrandService(BrandRepo brandRepo) {
    this.brandRepo = brandRepo;
  }

  public Page<BrandEntity> listAll(int page, int size) {
    int p = Math.max(0, page);
    int s = Math.min(50, Math.max(1, size));
    return brandRepo.findAllByOrderByIdDesc(PageRequest.of(p, s));
  }

  public List<BrandEntity> listActive() {
    return brandRepo.findByEnabledTrueOrderByIdDesc();
  }

  public Optional<BrandEntity> findById(long id) {
    return brandRepo.findById(id);
  }

  @Transactional
  public BrandEntity create(BrandEntity brand) {
    if (brand.name == null || brand.name.isBlank()) {
      throw new IllegalArgumentException("BRAND_NAME_REQUIRED");
    }
    if (brand.logo == null) brand.logo = "";
    if (brand.description == null) brand.description = "";
    if (brand.origin == null) brand.origin = "";
    if (brand.enabled == null) brand.enabled = true;
    return brandRepo.save(brand);
  }

  @Transactional
  public BrandEntity update(long id, BrandEntity patch) {
    BrandEntity brand = brandRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("BRAND_NOT_FOUND"));
    if (patch.name != null && !patch.name.isBlank()) brand.name = patch.name;
    if (patch.logo != null) brand.logo = patch.logo;
    if (patch.description != null) brand.description = patch.description;
    if (patch.origin != null) brand.origin = patch.origin;
    if (patch.foundYear != null) brand.foundYear = patch.foundYear;
    if (patch.enabled != null) brand.enabled = patch.enabled;
    return brandRepo.save(brand);
  }

  @Transactional
  public void delete(long id) {
    if (!brandRepo.existsById(id)) {
      throw new IllegalArgumentException("BRAND_NOT_FOUND");
    }
    brandRepo.deleteById(id);
  }
}