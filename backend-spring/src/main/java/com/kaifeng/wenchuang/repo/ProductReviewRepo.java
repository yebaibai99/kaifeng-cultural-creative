package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.ProductReviewEntity;
import com.kaifeng.wenchuang.domain.ReviewStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductReviewRepo extends JpaRepository<ProductReviewEntity, Long> {
  List<ProductReviewEntity> findByProductIdAndStatusOrderByIdDesc(long productId, ReviewStatus status);

  void deleteByProductId(long productId);
}

