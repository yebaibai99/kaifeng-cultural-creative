package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.OrderEntity;
import com.kaifeng.wenchuang.domain.OrderItemEntity;
import com.kaifeng.wenchuang.domain.OrderStatus;
import com.kaifeng.wenchuang.domain.RefundStatus;
import com.kaifeng.wenchuang.repo.OrderItemRepo;
import com.kaifeng.wenchuang.repo.OrderRepo;
import com.kaifeng.wenchuang.service.OrderService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/order-stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderStatsController {
    private final OrderService orderService;
    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;

    public AdminOrderStatsController(OrderService orderService, OrderRepo orderRepo, OrderItemRepo orderItemRepo) {
        this.orderService = orderService;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
    }

    @GetMapping
    public Map<String, Object> getStats() {
        List<OrderEntity> allOrders = orderService.listAll();

        long totalOrders = allOrders.size();
        long completedOrders = allOrders.stream()
                .filter(o -> o.status == OrderStatus.DONE || o.status == OrderStatus.RECEIVED)
                .count();
        long pendingOrders = allOrders.stream()
                .filter(o -> o.status == OrderStatus.CREATED || o.status == OrderStatus.PAID)
                .count();
        long cancelledOrders = allOrders.stream()
                .filter(o -> o.status == OrderStatus.CANCELLED)
                .count();
        long refundOrders = allOrders.stream()
                .filter(o -> o.refundStatus != RefundStatus.NONE)
                .count();
        long approvedRefunds = allOrders.stream()
                .filter(o -> o.refundStatus == RefundStatus.APPROVED)
                .count();

        long totalSales = allOrders.stream()
                .filter(o -> o.status != OrderStatus.CANCELLED)
                .mapToLong(o -> o.totalCents)
                .sum();

        double refundRate = totalOrders > 0 ? (double) approvedRefunds / totalOrders * 100 : 0;

        // 按状态统计
        Map<String, Long> statusStats = allOrders.stream()
                .collect(Collectors.groupingBy(o -> o.status.name(), Collectors.counting()));

        // 最近7天订单趋势
        List<Map<String, Object>> dailyTrend = getDailyTrend(allOrders);

        // 商品销售排行
        List<Map<String, Object>> topProducts = getTopProducts();

        // 最近订单
        List<Map<String, Object>> recentOrders = allOrders.stream()
                .limit(5)
                .map(o -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", o.id);
                    orderMap.put("buyerName", o.buyerName != null ? o.buyerName : "未知");
                    orderMap.put("totalCents", o.totalCents);
                    orderMap.put("status", o.status.name());
                    orderMap.put("createdAt", o.createdAt != null ? o.createdAt.toString() : "");
                    return orderMap;
                })
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("totalOrders", totalOrders);
        result.put("totalSales", totalSales);
        result.put("completedOrders", completedOrders);
        result.put("pendingOrders", pendingOrders);
        result.put("cancelledOrders", cancelledOrders);
        result.put("refundOrders", refundOrders);
        result.put("approvedRefunds", approvedRefunds);
        result.put("refundRate", Math.round(refundRate * 100) / 100.0);
        result.put("statusStats", statusStats);
        result.put("dailyTrend", dailyTrend);
        result.put("topProducts", topProducts);
        result.put("recentOrders", recentOrders);

        return result;
    }

    private List<Map<String, Object>> getDailyTrend(List<OrderEntity> allOrders) {
        List<Map<String, Object>> trend = new ArrayList<>();
        ZoneId zone = ZoneId.of("Asia/Shanghai");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now(zone).minusDays(i);
            Instant dayStart = date.atStartOfDay(zone).toInstant();
            Instant dayEnd = date.plusDays(1).atStartOfDay(zone).toInstant();

            long count = allOrders.stream()
                    .filter(o -> o.createdAt != null &&
                            !o.createdAt.isBefore(dayStart) &&
                            o.createdAt.isBefore(dayEnd))
                    .count();

            long sales = allOrders.stream()
                    .filter(o -> o.createdAt != null &&
                            !o.createdAt.isBefore(dayStart) &&
                            o.createdAt.isBefore(dayEnd) &&
                            o.status != OrderStatus.CANCELLED)
                    .mapToLong(o -> o.totalCents)
                    .sum();

            trend.add(Map.<String, Object>of(
                    "date", date.format(formatter),
                    "count", count,
                    "sales", sales
            ));
        }

        return trend;
    }

    private List<Map<String, Object>> getTopProducts() {
        List<OrderItemEntity> allItems = orderItemRepo.findAll();

        Map<String, List<OrderItemEntity>> grouped = allItems.stream()
                .collect(Collectors.groupingBy(
                        item -> item.title != null ? item.title : "未知商品"
                ));

        return grouped.entrySet().stream()
                .map(entry -> {
                    String title = entry.getKey();
                    List<OrderItemEntity> items = entry.getValue();
                    int totalQty = items.stream().mapToInt(i -> i.qty).sum();
                    long totalSales = items.stream().mapToLong(i -> (long) i.priceCents * i.qty).sum();

                    return Map.<String, Object>of(
                            "title", title,
                            "totalQty", totalQty,
                            "totalSales", totalSales
                    );
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("totalQty"), (Integer) a.get("totalQty")))
                .limit(10)
                .toList();
    }
}