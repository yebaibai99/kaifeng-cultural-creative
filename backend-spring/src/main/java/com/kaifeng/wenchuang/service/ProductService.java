package com.kaifeng.wenchuang.service;

import com.kaifeng.wenchuang.domain.ProductEntity;
import com.kaifeng.wenchuang.domain.ProductStatus;
import com.kaifeng.wenchuang.repo.CartItemRepo;
import com.kaifeng.wenchuang.repo.ProductRepo;
import com.kaifeng.wenchuang.repo.ProductReviewRepo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {
  private final ProductRepo productRepo;
  private final CartItemRepo cartItemRepo;
  private final ProductReviewRepo productReviewRepo;

  public ProductService(ProductRepo productRepo, CartItemRepo cartItemRepo, ProductReviewRepo productReviewRepo) {
    this.productRepo = productRepo;
    this.cartItemRepo = cartItemRepo;
    this.productReviewRepo = productReviewRepo;
  }

  public Page<ProductEntity> searchOn(int page, int size, String category, String q, String sort) {
    int p = Math.max(0, page);
    int s = Math.min(50, Math.max(1, size));
    Sort srt = switch (sort == null ? "" : sort) {
      case "price_asc" -> Sort.by(Sort.Direction.ASC, "priceCents").and(Sort.by(Sort.Direction.DESC, "id"));
      case "price_desc" -> Sort.by(Sort.Direction.DESC, "priceCents").and(Sort.by(Sort.Direction.DESC, "id"));
      case "sales_desc" -> Sort.by(Sort.Direction.DESC, "salesCount").and(Sort.by(Sort.Direction.DESC, "id"));
      case "newest" -> Sort.by(Sort.Direction.DESC, "id");
      default -> Sort.by(Sort.Direction.DESC, "id");
    };
    return productRepo.searchOn(ProductStatus.ON, category, q, PageRequest.of(p, s, srt));
  }

  public Page<ProductEntity> listOn(int page, int size) {
    int p = Math.max(0, page);
    int s = Math.min(50, Math.max(1, size));
    return productRepo.findByStatusOrderByIdDesc(ProductStatus.ON, PageRequest.of(p, s));
  }

  public List<String> listOnCategories() {
    return productRepo.listCategories(ProductStatus.ON);
  }

  public Page<ProductEntity> listAll(int page, int size) {
    int p = Math.max(0, page);
    int s = Math.min(100, Math.max(1, size));
    return productRepo.findAll(PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "id")));
  }

  public Optional<ProductEntity> findById(long id) {
    return productRepo.findById(id);
  }

  @Transactional
  public ProductEntity create(ProductEntity in) {
    // 如果传入了ID，则使用指定的ID
    // 注意：需要确保ID未被使用
    if (in.id != null) {
      // 检查ID是否已存在
      if (productRepo.existsById(in.id)) {
        throw new IllegalArgumentException("ID已存在");
      }
    } else {
      in.id = null; // 让数据库自动生成ID
    }
    if (in.subtitle == null) in.subtitle = "";
    if (in.category == null) in.category = "";
    if (in.coverImageUrl == null) in.coverImageUrl = "";
    if (in.imageUrlsJson == null || in.imageUrlsJson.isBlank()) in.imageUrlsJson = "[]";
    if (in.videoUrlsJson == null || in.videoUrlsJson.isBlank()) in.videoUrlsJson = "[]";
    if (in.stock == null) in.stock = 0;
    if (in.salesCount == null) in.salesCount = 0;
    if (in.status == null) in.status = ProductStatus.ON;
    return productRepo.save(in);
  }

  @Transactional
  public ProductEntity update(long id, ProductEntity patch) {
    ProductEntity p = productRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("NOT_FOUND"));
    if (patch.title != null) p.title = patch.title;
    if (patch.subtitle != null) p.subtitle = patch.subtitle;
    if (patch.category != null) p.category = patch.category;
    if (patch.priceCents != null) p.priceCents = patch.priceCents;
    if (patch.coverImageUrl != null) p.coverImageUrl = patch.coverImageUrl;
    if (patch.imageUrlsJson != null) p.imageUrlsJson = patch.imageUrlsJson;
    if (patch.videoUrlsJson != null) p.videoUrlsJson = patch.videoUrlsJson;
    if (patch.culturalStory != null) p.culturalStory = patch.culturalStory;
    if (patch.craftInfo != null) p.craftInfo = patch.craftInfo;
    if (patch.specsText != null) p.specsText = patch.specsText;
    if (patch.sceneText != null) p.sceneText = patch.sceneText;
    if (patch.description != null) p.description = patch.description;
    return productRepo.save(p);
  }

  @Transactional
  public ProductEntity setStock(long id, int stock) {
    ProductEntity p = productRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("NOT_FOUND"));
    p.stock = Math.max(0, stock);
    return productRepo.save(p);
  }

  @Transactional
  public ProductEntity setStatus(long id, ProductStatus status) {
    ProductEntity p = productRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("NOT_FOUND"));
    p.status = status;
    return productRepo.save(p);
  }

  @Transactional
  public void delete(long id) {
    // 先删除相关的购物车项
    cartItemRepo.deleteByProductId(id);
    // 先删除相关的评论
    productReviewRepo.deleteByProductId(id);
    // 订单商品不需要删除，因为订单是历史记录
    // 最后删除商品
    productRepo.deleteById(id);
  }
}

