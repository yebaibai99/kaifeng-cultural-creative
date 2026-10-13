package com.kaifeng.wenchuang.service;

import com.kaifeng.wenchuang.domain.CartItemEntity;
import com.kaifeng.wenchuang.domain.ProductEntity;
import com.kaifeng.wenchuang.repo.CartItemRepo;
import com.kaifeng.wenchuang.repo.ProductRepo;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
  private final CartItemRepo cartItemRepo;
  private final ProductRepo productRepo;

  public CartService(CartItemRepo cartItemRepo, ProductRepo productRepo) {
    this.cartItemRepo = cartItemRepo;
    this.productRepo = productRepo;
  }

  public List<CartItemEntity> list(long userId) {
    return cartItemRepo.findByUserIdOrderByIdDesc(userId);
  }

  @Transactional
  public CartItemEntity add(long userId, long productId, int qty) {
    int q = Math.min(999, Math.max(1, qty));
    ProductEntity p =
        productRepo.findById(productId).orElseThrow(() -> new IllegalArgumentException("PRODUCT_NOT_FOUND"));
    if (p.stock == null || p.stock <= 0) throw new IllegalArgumentException("OUT_OF_STOCK");

    var existing = cartItemRepo.findByUserIdAndProductId(userId, productId);
    if (existing.isPresent()) {
      CartItemEntity e = existing.get();
      e.qty = Math.min(999, e.qty + q);
      return cartItemRepo.save(e);
    }

    CartItemEntity ci = new CartItemEntity();
    ci.userId = userId;
    ci.productId = productId;
    ci.qty = q;
    return cartItemRepo.save(ci);
  }

  @Transactional
  public CartItemEntity setQty(long userId, long productId, int qty) {
    int q = Math.min(999, Math.max(1, qty));
    CartItemEntity ci =
        cartItemRepo
            .findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new IllegalArgumentException("CART_ITEM_NOT_FOUND"));
    ci.qty = q;
    return cartItemRepo.save(ci);
  }

  @Transactional
  public void remove(long userId, long productId) {
    cartItemRepo
        .findByUserIdAndProductId(userId, productId)
        .ifPresent(cartItemRepo::delete);
  }

  @Transactional
  public void clear(long userId) {
    cartItemRepo.deleteByUserId(userId);
  }
}

