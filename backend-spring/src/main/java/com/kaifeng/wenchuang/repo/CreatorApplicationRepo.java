package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.CreatorApplicationEntity;
import com.kaifeng.wenchuang.domain.CreatorApplicationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreatorApplicationRepo extends JpaRepository<CreatorApplicationEntity, Long> {
  Optional<CreatorApplicationEntity> findTopByUserIdOrderByIdDesc(long userId);

  Optional<CreatorApplicationEntity> findByUserId(long userId);

  List<CreatorApplicationEntity> findByStatusOrderByIdDesc(CreatorApplicationStatus status);

  List<CreatorApplicationEntity> findAllByOrderByIdDesc();
}