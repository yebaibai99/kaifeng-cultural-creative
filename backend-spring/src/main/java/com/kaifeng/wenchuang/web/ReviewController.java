package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.ProductReviewEntity;
import com.kaifeng.wenchuang.security.SecurityUtil;
import com.kaifeng.wenchuang.service.ReviewService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
  private final ReviewService reviewService;

  public ReviewController(ReviewService reviewService) {
    this.reviewService = reviewService;
  }

  public record AddReq(
      long product_id,
      @Min(1) @Max(5) int rating,
      String content,
      String image_urls_json) {}

  @PostMapping
  public ResponseEntity<?> add(@RequestBody AddReq req) {
    long userId = SecurityUtil.requireUser().userId();
    try {
      ProductReviewEntity pr =
          reviewService.add(userId, req.product_id, req.rating, req.content, req.image_urls_json);
      return ResponseEntity.ok(pr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}

