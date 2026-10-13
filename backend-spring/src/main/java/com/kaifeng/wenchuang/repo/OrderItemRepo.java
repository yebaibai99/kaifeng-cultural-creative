package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.OrderItemEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepo extends JpaRepository<OrderItemEntity, Long> {
  List<OrderItemEntity> findByOrderIdOrderByIdAsc(long orderId);
}

