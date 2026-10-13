package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.OrderEntity;
import com.kaifeng.wenchuang.domain.RefundStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepo extends JpaRepository<OrderEntity, Long> {
  List<OrderEntity> findByUserIdOrderByIdDesc(long userId);
  List<OrderEntity> findAllByOrderByIdDesc();
  Page<OrderEntity> findAllByOrderByIdDesc(Pageable pageable);
  Page<OrderEntity> findByBuyerNameContainingOrderByIdDesc(String buyerName, Pageable pageable);
  Page<OrderEntity> findByOrderNoContainingOrBuyerNameContainingOrderByIdDesc(String orderNo, String buyerName, Pageable pageable);
  List<OrderEntity> findByRefundStatusOrderByIdDesc(RefundStatus status);
}