package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.RefundEntity;
import com.kaifeng.wenchuang.domain.RefundStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefundRepo extends JpaRepository<RefundEntity, Long> {
    List<RefundEntity> findByUserIdOrderByIdDesc(long userId);
    List<RefundEntity> findByOrderIdOrderByIdDesc(long orderId);
    Page<RefundEntity> findAllByOrderByIdDesc(Pageable pageable);
    Page<RefundEntity> findByStatusOrderByIdDesc(RefundStatus status, Pageable pageable);
}