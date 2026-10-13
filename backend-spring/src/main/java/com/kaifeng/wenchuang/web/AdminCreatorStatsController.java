package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.CreatorStatus;
import com.kaifeng.wenchuang.domain.ProductEntity;
import com.kaifeng.wenchuang.domain.UserEntity;
import com.kaifeng.wenchuang.repo.ProductRepo;
import com.kaifeng.wenchuang.repo.UserRepo;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/creator-stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCreatorStatsController {
    private final UserRepo userRepo;
    private final ProductRepo productRepo;

    public AdminCreatorStatsController(UserRepo userRepo, ProductRepo productRepo) {
        this.userRepo = userRepo;
        this.productRepo = productRepo;
    }

    @GetMapping
    public Map<String, Object> getStats() {
        List<UserEntity> allUsers = userRepo.findAll();
        List<ProductEntity> allProducts = productRepo.findAll();

        // 总创作者数（状态为 APPROVED）
        long totalCreators = allUsers.stream()
                .filter(u -> u.creatorStatus == CreatorStatus.APPROVED)
                .count();

        // 活跃创作者（有商品的创作者）
        Set<Long> creatorIdsWithProducts = allProducts.stream()
                .map(p -> p.creatorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        long activeCreators = creatorIdsWithProducts.size();

        // 总作品数
        long totalWorks = allProducts.size();

        // 作品平均浏览量（暂时返回 0，因为 ProductEntity 中没有 views 字段）
        double avgViews = 0;

        // 创作者状态分布
        Map<String, Long> statusStats = allUsers.stream()
                .collect(Collectors.groupingBy(u -> u.creatorStatus.name(), Collectors.counting()));

        // 最近7天创作者增长趋势
        List<Map<String, Object>> dailyTrend = getDailyTrend(allUsers);

        // 作品分类分布
        Map<String, Long> categoryStats = allProducts.stream()
                .collect(Collectors.groupingBy(p -> p.category != null && !p.category.isBlank() ? p.category : "未分类", Collectors.counting()));

        // 热门创作者（按商品销售数量排序）
        List<Map<String, Object>> topCreators = getTopCreators(allProducts, allUsers);

        Map<String, Object> result = new HashMap<>();
        result.put("totalCreators", totalCreators);
        result.put("activeCreators", activeCreators);
        result.put("totalWorks", totalWorks);
        result.put("avgViews", avgViews);
        result.put("statusStats", statusStats);
        result.put("dailyTrend", dailyTrend);
        result.put("categoryStats", categoryStats);
        result.put("topCreators", topCreators);

        return result;
    }

    private List<Map<String, Object>> getDailyTrend(List<UserEntity> allUsers) {
        List<Map<String, Object>> trend = new ArrayList<>();
        ZoneId zone = ZoneId.of("Asia/Shanghai");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now(zone).minusDays(i);
            Instant dayStart = date.atStartOfDay(zone).toInstant();
            Instant dayEnd = date.plusDays(1).atStartOfDay(zone).toInstant();

            long count = allUsers.stream()
                    .filter(u -> u.createdAt != null &&
                            !u.createdAt.isBefore(dayStart) &&
                            u.createdAt.isBefore(dayEnd) &&
                            u.creatorStatus == CreatorStatus.APPROVED)
                    .count();

            trend.add(Map.<String, Object>of(
                    "date", date.format(formatter),
                    "count", count
            ));
        }

        return trend;
    }

    private List<Map<String, Object>> getTopCreators(List<ProductEntity> allProducts, List<UserEntity> allUsers) {
        // 按创作者ID分组，计算总销售数量
        Map<Long, Integer> creatorSales = allProducts.stream()
                .filter(p -> p.creatorId != null)
                .collect(Collectors.groupingBy(p -> p.creatorId, Collectors.summingInt(p -> p.salesCount)));

        // 转换为带有创作者信息的列表
        return creatorSales.entrySet().stream()
                .map(entry -> {
                    Long creatorId = entry.getKey();
                    Integer totalSales = entry.getValue();

                    // 查找创作者信息
                    Optional<UserEntity> creatorOpt = allUsers.stream()
                            .filter(u -> u.id.equals(creatorId))
                            .findFirst();

                    String nickname = creatorOpt.map(u -> u.nickname).orElse("未知创作者");
                    String avatarUrl = creatorOpt.map(u -> u.avatarUrl).orElse("");

                    // 计算该创作者的商品数量
                    long productCount = allProducts.stream()
                            .filter(p -> p.creatorId != null && p.creatorId.equals(creatorId))
                            .count();

                    return Map.<String, Object>of(
                            "creatorId", creatorId,
                            "nickname", nickname,
                            "avatarUrl", avatarUrl,
                            "totalSales", totalSales,
                            "productCount", productCount
                    );
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("totalSales"), (Integer) a.get("totalSales")))
                .limit(10)
                .toList();
    }
}
