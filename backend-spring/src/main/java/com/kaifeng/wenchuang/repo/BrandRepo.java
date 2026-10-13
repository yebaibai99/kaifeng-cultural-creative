package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.BrandEntity;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepo extends JpaRepository<BrandEntity, Long> {
  Page<BrandEntity> findAllByOrderByIdDesc(Pageable pageable);
  List<BrandEntity> findByEnabledTrueOrderByIdDesc();
}