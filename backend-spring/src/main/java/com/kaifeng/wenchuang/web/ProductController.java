package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.ProductEntity;
import com.kaifeng.wenchuang.domain.ProductReviewEntity;
import com.kaifeng.wenchuang.repo.CategoryRepo;
import com.kaifeng.wenchuang.service.ProductService;
import com.kaifeng.wenchuang.service.ReviewService;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
  private final ProductService productService;
  private final ReviewService reviewService;
  private final CategoryRepo categoryRepo;

  public ProductController(ProductService productService, ReviewService reviewService, CategoryRepo categoryRepo) {
    this.productService = productService;
    this.reviewService = reviewService;
    this.categoryRepo = categoryRepo;
  }

  public record ProductResp(
      long id,
      String title,
      String subtitle,
      String category,
      int price_cents,
      int stock,
      String status,
      String cover_image_url,
      String image_urls_json,
      String video_urls_json,
      String cultural_story,
      String craft_info,
      String specs_text,
      String scene_text,
      String description,
      int sales_count,
      String created_at) {}

  private static ProductResp toResp(ProductEntity p) {
    return new ProductResp(
        p.id,
        p.title,
        p.subtitle,
        p.category,
        p.priceCents,
        p.stock,
        p.status == null ? null : p.status.name(),
        p.coverImageUrl,
        p.imageUrlsJson,
        p.videoUrlsJson,
        p.culturalStory,
        p.craftInfo,
        p.specsText,
        p.sceneText,
        p.description,
        p.salesCount == null ? 0 : p.salesCount,
        p.createdAt == null ? null : p.createdAt.toString());
  }

  @GetMapping
  public Map<String, Object> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      @RequestParam(required = false) String category,
      @RequestParam(required = false, name = "q") String q,
      @RequestParam(required = false) String sort) {
    Page<ProductEntity> p = productService.searchOn(page, size, category, q, sort);
    return Map.of(
        "page", p.getNumber(),
        "size", p.getSize(),
        "total", p.getTotalElements(),
        "items", p.getContent().stream().map(ProductController::toResp).toList());
  }

  @GetMapping("/categories")
  public List<String> categories() {
    return categoryRepo.findByEnabledTrueOrderBySortAsc().stream()
            .filter(c -> c.parentId == null)
            .map(c -> c.name)
            .toList();
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> detail(@PathVariable long id) {
    return productService
        .findById(id)
        .<ResponseEntity<?>>map(p -> ResponseEntity.ok(toResp(p)))
        .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "NOT_FOUND")));
  }

  @GetMapping("/{id}/reviews")
  public List<ProductReviewEntity> reviews(@PathVariable long id) {
    return reviewService.listVisible(id);
  }
}

