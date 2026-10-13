package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.ProductEntity;
import com.kaifeng.wenchuang.domain.ProductStatus;
import com.kaifeng.wenchuang.domain.ScenicSpotEntity;
import com.kaifeng.wenchuang.repo.ProductRepo;
import com.kaifeng.wenchuang.repo.ScenicSpotRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scenic-spots")
public class ScenicSpotController {

    private final ScenicSpotRepo scenicSpotRepo;
    private final ProductRepo productRepo;

    public ScenicSpotController(ScenicSpotRepo scenicSpotRepo, ProductRepo productRepo) {
        this.scenicSpotRepo = scenicSpotRepo;
        this.productRepo = productRepo;
    }

    public record ScenicSpotDTO(
            Long id,
            String name,
            String description,
            String coverImageUrl,
            Long productCount) {}

    public record ProductDTO(
            Long id,
            String title,
            String subtitle,
            String category,
            Integer priceCents,
            Integer stock,
            String coverImageUrl,
            String scenicSpot,
            Integer salesCount) {}

    /**
     * 获取所有景点列表
     */
    @GetMapping
    public ResponseEntity<?> getScenicSpots() {
        List<ScenicSpotDTO> spots = scenicSpotRepo.findByIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(s -> {
                    long count = productRepo.countByScenicSpotAndStatus(s.name, ProductStatus.ON);
                    return new ScenicSpotDTO(s.id, s.name, s.description, s.coverImageUrl, count);
                })
                .toList();
        return ResponseEntity.ok(spots);
    }

    /**
     * 获取单个景点详情及其商品
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getScenicSpotDetail(@PathVariable Long id) {
        return scenicSpotRepo.findById(id)
                .map(spot -> {
                    List<ProductDTO> products = productRepo.findByScenicSpotAndStatus(
                                    spot.name, ProductStatus.ON)
                            .stream()
                            .map(p -> new ProductDTO(
                                    p.id, p.title, p.subtitle, p.category,
                                    p.priceCents, p.stock, p.coverImageUrl, p.scenicSpot, p.salesCount))
                            .toList();

                    long count = productRepo.countByScenicSpotAndStatus(spot.name, ProductStatus.ON);

                    return ResponseEntity.ok(Map.of(
                            "spot", new ScenicSpotDTO(spot.id, spot.name, spot.description, spot.coverImageUrl, count),
                            "products", products));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}