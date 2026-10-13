package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.CategoryEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepo extends JpaRepository<CategoryEntity, Long> {
  List<CategoryEntity> findAllByOrderByIdDesc();
  List<CategoryEntity> findByEnabledTrueOrderBySortAsc();
  List<CategoryEntity> findByParentIdOrderBySortAsc(Long parentId);
  List<CategoryEntity> findByParentIdNullOrderBySortAsc();
}