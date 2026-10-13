package com.kaifeng.wenchuang.web;

import com.kaifeng.wenchuang.domain.Role;
import com.kaifeng.wenchuang.domain.UserEntity;
import com.kaifeng.wenchuang.repo.OrderRepo;
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
@RequestMapping("/api/admin/user-stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserStatsController {
    private final UserRepo userRepo;
    private final OrderRepo orderRepo;

    public AdminUserStatsController(UserRepo userRepo, OrderRepo orderRepo) {
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
    }

    @GetMapping
    public Map<String, Object> getStats() {
        List<UserEntity> allUsers = userRepo.findAll();

        // 总用户数
        long totalUsers = allUsers.size();

        // 活跃用户数（有订单的用户）
        Set<Long> activeUserIds = orderRepo.findAll().stream()
                .map(o -> o.userId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        long activeUsers = activeUserIds.size();

        // 新注册用户（最近30天）
        Instant thirtyDaysAgo = Instant.now().minusSeconds(30 * 24 * 60 * 60);
        long newUsers = allUsers.stream()
                .filter(u -> u.createdAt != null && u.createdAt.isAfter(thirtyDaysAgo))
                .count();

        // 平均活跃度
        double avgActivity = totalUsers > 0 ? (double) activeUsers / totalUsers * 100 : 0;

        // 用户角色分布
        Map<String, Long> roleStats = allUsers.stream()
                .collect(Collectors.groupingBy(u -> u.role.name(), Collectors.counting()));

        // 最近7天用户增长趋势
        List<Map<String, Object>> dailyTrend = getDailyTrend(allUsers);

        // 最近注册的用户
        List<Map<String, Object>> recentUsers = getRecentUsers(allUsers);

        Map<String, Object> result = new HashMap<>();
        result.put("totalUsers", totalUsers);
        result.put("activeUsers", activeUsers);
        result.put("newUsers", newUsers);
        result.put("avgActivity", Math.round(avgActivity * 100) / 100.0);
        result.put("roleStats", roleStats);
        result.put("dailyTrend", dailyTrend);
        result.put("recentUsers", recentUsers);

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
                            u.createdAt.isBefore(dayEnd))
                    .count();

            trend.add(Map.<String, Object>of(
                    "date", date.format(formatter),
                    "count", count
            ));
        }

        return trend;
    }

    private List<Map<String, Object>> getRecentUsers(List<UserEntity> allUsers) {
        return allUsers.stream()
                .sorted((a, b) -> b.createdAt.compareTo(a.createdAt))
                .limit(10)
                .map(u -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", u.id);
                    userMap.put("nickname", u.nickname);
                    userMap.put("email", u.email);
                    userMap.put("phone", u.phone);
                    userMap.put("role", u.role.name());
                    userMap.put("createdAt", u.createdAt != null ? u.createdAt.toString() : "");
                    return userMap;
                })
                .toList();
    }
}
