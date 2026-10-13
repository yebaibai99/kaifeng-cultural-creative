package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.CartItemEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepo extends JpaRepository<CartItemEntity, Long> {
  List<CartItemEntity> findByUserIdOrderByIdDesc(long userId);

  Optional<CartItemEntity> findByUserIdAndProductId(long userId, long productId);

  void deleteByUserId(long userId);

  void deleteByProductId(long productId);
}

