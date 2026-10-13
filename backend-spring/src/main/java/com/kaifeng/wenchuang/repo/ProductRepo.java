package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.ProductEntity;
import com.kaifeng.wenchuang.domain.ProductStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepo extends JpaRepository<ProductEntity, Long> {
  Page<ProductEntity> findByStatusOrderByIdDesc(ProductStatus status, Pageable pageable);

  Page<ProductEntity> findAllByOrderByIdDesc(Pageable pageable);


  Page<ProductEntity> findByScenicSpot(String scenicSpot, Pageable pageable);
  List<ProductEntity> findByScenicSpotAndStatus(String scenicSpot, ProductStatus status);
  long countByScenicSpotAndStatus(String scenicSpot, ProductStatus status);

  @Query(
      """
      select p from ProductEntity p
      where p.status = :status
        and (:category is null or :category = '' or p.category = :category)
        and (
          :q is null or :q = '' or
          lower(p.title) like lower(concat('%', :q, '%')) or
          lower(p.subtitle) like lower(concat('%', :q, '%'))
        )
      """)
  Page<ProductEntity> searchOn(
      @Param("status") ProductStatus status,
      @Param("category") String category,
      @Param("q") String q,
      Pageable pageable);

  @Query(
      """
      select distinct p.category from ProductEntity p
      where p.status = :status and p.category is not null and p.category <> ''
      order by p.category asc
      """)
  List<String> listCategories(@Param("status") ProductStatus status);
}

