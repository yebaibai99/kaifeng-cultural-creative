package com.kaifeng.wenchuang.service;

import com.kaifeng.wenchuang.domain.CategoryEntity;
import com.kaifeng.wenchuang.repo.CategoryRepo;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {
  private final CategoryRepo categoryRepo;

  public CategoryService(CategoryRepo categoryRepo) {
    this.categoryRepo = categoryRepo;
  }

  public List<CategoryEntity> listAll() {
    return categoryRepo.findAllByOrderByIdDesc();
  }

  public List<CategoryEntity> listActive() {
    return categoryRepo.findByEnabledTrueOrderBySortAsc();
  }

  public List<CategoryEntity> listRoot() {
    return categoryRepo.findByParentIdNullOrderBySortAsc();
  }

  public List<CategoryEntity> listByParent(Long parentId) {
    return categoryRepo.findByParentIdOrderBySortAsc(parentId);
  }

  public Optional<CategoryEntity> findById(long id) {
    return categoryRepo.findById(id);
  }

  @Transactional
  public CategoryEntity create(CategoryEntity category) {
    if (category.name == null || category.name.isBlank()) {
      throw new IllegalArgumentException("CATEGORY_NAME_REQUIRED");
    }
    if (category.sort == null) category.sort = 0;
    if (category.enabled == null) category.enabled = true;
    return categoryRepo.save(category);
  }

  @Transactional
  public CategoryEntity update(long id, CategoryEntity patch) {
    CategoryEntity category = categoryRepo.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("CATEGORY_NOT_FOUND"));
    if (patch.name != null && !patch.name.isBlank()) category.name = patch.name;
    if (patch.parentId != null) category.parentId = patch.parentId;
    if (patch.sort != null) category.sort = patch.sort;
    if (patch.enabled != null) category.enabled = patch.enabled;
    return categoryRepo.save(category);
  }

  @Transactional
  public void delete(long id) {
    if (!categoryRepo.existsById(id)) {
      throw new IllegalArgumentException("CATEGORY_NOT_FOUND");
    }
    categoryRepo.deleteById(id);
  }
}