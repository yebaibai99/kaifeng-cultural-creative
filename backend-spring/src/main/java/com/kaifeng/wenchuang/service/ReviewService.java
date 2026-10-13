package com.kaifeng.wenchuang.service;

import com.kaifeng.wenchuang.domain.ProductReviewEntity;
import com.kaifeng.wenchuang.domain.ReviewStatus;
import com.kaifeng.wenchuang.repo.ProductReviewRepo;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
  private final ProductReviewRepo productReviewRepo;

  public ReviewService(ProductReviewRepo productReviewRepo) {
    this.productReviewRepo = productReviewRepo;
  }

  public List<ProductReviewEntity> listVisible(long productId) {
    return productReviewRepo.findByProductIdAndStatusOrderByIdDesc(productId, ReviewStatus.VISIBLE);
  }

  @Transactional
  public ProductReviewEntity add(long userId, long productId, int rating, String content, String imageUrlsJson) {
    int r = Math.min(5, Math.max(1, rating));
    ProductReviewEntity pr = new ProductReviewEntity();
    pr.userId = userId;
    pr.productId = productId;
    pr.rating = r;
    pr.content = content;
    pr.imageUrlsJson = (imageUrlsJson == null || imageUrlsJson.isBlank()) ? "[]" : imageUrlsJson;
    pr.status = ReviewStatus.VISIBLE;
    return productReviewRepo.save(pr);
  }
}

