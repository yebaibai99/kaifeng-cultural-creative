# 开封文创产品购物系统（Spring Boot 3.2 + Vue3 + MySQL）

## 技术栈
- 后端：Spring Boot 3.2.x（JDK17）+ Spring Security（JWT）+ JPA + Flyway + MySQL
- 前端：Vue3 + Vite + TypeScript + Vue Router + Pinia（后续补齐）

## 先启动数据库（推荐）
本项目**不要求 Docker**。你可以直接用本机安装的 MySQL 8.x 启动数据库。

### 本机 MySQL（不使用 Docker）
1) 确保 MySQL 服务已启动，且能用 `root` 登录。

2) 在 MySQL 客户端执行（会自动创建库）：

```sql
CREATE DATABASE IF NOT EXISTS wenchuang_shop
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

3) 后端默认连接（可按需改密码）：
- DB：`wenchuang_shop`
- 用户：`root`
- 密码：默认读取 `DB_PASS`，未设置时使用 `123456`（见 `backend-spring/src/main/resources/application.yml`）

> 提示：首次启动后端时，Flyway 会自动建表并写入演示账号、商品种子数据（并会通过 `V2__seed_more_products.sql` 追加更多商品）。

## 启动后端
进入后端目录：

```bash
cd C:\Users\15897\Desktop\wenchuang\Project\backend-spring
.\mvnw.cmd spring-boot:run
```

如需改数据库连接（本机 MySQL 密码不同）：

```bash
set DB_USER=root
set DB_PASS=你的密码
set DB_URL=jdbc:mysql://localhost:3306/wenchuang_shop?useUnicode=true^&characterEncoding=utf8^&useSSL=false^&allowPublicKeyRetrieval=true^&serverTimezone=Asia/Shanghai
cd C:\Users\15897\Desktop\wenchuang\Project\backend-spring
.\mvnw.cmd spring-boot:run
```

## 启动前端
进入前端目录：

```bash
cd C:\Users\15897\Desktop\wenchuang\Project\frontend-vue
npm install
npm run dev
```

浏览器打开（以终端输出为准，通常为）：
- `http://localhost:5173/`

健康检查：
- `GET http://localhost:8080/api/health`

## 种子账号（Flyway 初始化）
> 当前为演示版，密码使用 `{noop}`（后端已兼容）。

- 管理员：`admin@local` / `admin123`
- 用户：`user@local` / `user123`
- 创作者：`creator@local` / `creator123`

