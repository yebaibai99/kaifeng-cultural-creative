package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.ScenicSpotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScenicSpotRepo extends JpaRepository<ScenicSpotEntity, Long> {
    List<ScenicSpotEntity> findByIsActiveTrueOrderBySortOrderAsc();
}