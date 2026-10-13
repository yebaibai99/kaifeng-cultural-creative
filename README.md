# 开封文创产品购物系统

> 基于 Spring Boot 3 + Vue3 的开封文创社区电商平台，包含内容浏览互动与后台商品/订单管理能力。

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)
![Vue](https://img.shields.io/badge/Vue-3.x-42b883)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 项目简介

开封文创产品购物系统是一个前后端分离的全栈项目，围绕"文创商品浏览、购买、互动"与"后台商品/订单管理"两条主线设计。

- **用户端**：浏览文创商品、加入购物车、下单、评价、内容互动
- **管理端**：商品管理、订单管理、品牌/分类管理、用户管理、退款处理

---

## 技术栈

### 后端
- **框架**：Spring Boot 3
- **安全**：Spring Security + JWT
- **ORM**：MyBatis-Plus
- **数据库**：MySQL 8
- **迁移**：Flyway
- **构建**：Maven

### 前端
- **框架**：Vue3 + Vite
- **语言**：TypeScript
- **状态管理**：Pinia
- **路由**：Vue Router（含路由守卫）
- **样式**：TailwindCSS
- **HTTP**：Axios

---

## 功能列表

- [x] 用户注册 / 登录 / JWT 鉴权
- [x] 商品列表 / 详情 / 分类 / 品牌筛选
- [x] 购物车管理
- [x] 下单 / 订单查询 / 订单状态
- [x] 商品评价
- [x] 后台商品管理（增删改查、图片上传）
- [x] 后台订单管理（含退款字段）
- [x] 后台品牌 / 分类管理
- [x] Flyway 数据库版本管理
- [x] 统一异常处理、统一响应封装

---

## 目录结构

```
Project/
├── backend-spring/              # 后端 Spring Boot 项目
│   ├── src/main/java/com/kaifeng/wenchuang/
│   │   ├── controller/          # 接口层
│   │   ├── service/             # 业务层
│   │   ├── mapper/              # 持久层
│   │   ├── entity/              # 实体类
│   │   ├── config/              # 配置类（安全、跨域等）
│   │   └── common/              # 通用返回、异常处理
│   └── src/main/resources/
│       ├── application.yml      # 配置文件
│       └── db/migration/        # Flyway 迁移脚本
├── frontend-vue/                # 前端 Vue3 项目
│   ├── src/
│   │   ├── views/               # 页面
│   │   ├── components/          # 组件
│   │   ├── stores/              # Pinia 状态
│   │   ├── router/              # 路由 + 守卫
│   │   └── api/                 # 接口封装
│   └── vite.config.ts
├── docs/                        # 项目截图（可选）
├── README.md
└── 系统总体架构图.md
```

---

## 快速开始

### 环境要求

- JDK 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

### 1. 准备数据库

```sql
CREATE DATABASE wenchuang_shop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> 表结构由 Flyway 在启动时自动创建，无需手动建表。

### 2. 启动后端

```bash
cd backend-spring
```

设置环境变量（**本地开发用，不要提交到 Git**）：

**Windows CMD：**
```cmd
set DB_USER=root
set DB_PASS=你的MySQL密码
set JWT_SECRET=你的JWT密钥
.\mvnw.cmd spring-boot:run
```

**macOS / Linux：**
```bash
export DB_USER=root
export DB_PASS=你的MySQL密码
export JWT_SECRET=你的JWT密钥
./mvnw spring-boot:run
```

> 首次启动时 Flyway 会自动建表并写入演示账号、商品种子数据。

### 3. 启动前端

```bash
cd frontend-vue
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`（默认端口）。

---

## 配置说明

后端 `application.yml` 关键配置：

| 配置项 | 环境变量 | 默认值 | 说明 |
|--------|---------|--------|------|
| `spring.datasource.url` | `DB_URL` | `jdbc:mysql://localhost:3306/wenchuang_shop` | 数据库连接 |
| `spring.datasource.username` | `DB_USER` | `root` | 数据库用户 |
| `spring.datasource.password` | `DB_PASS` | `your_password_here` | 数据库密码 |
| `app.jwt.secret` | `JWT_SECRET` | `CHANGE_ME...` | JWT 密钥（生产必换） |
| `app.upload.dir` | `UPLOAD_DIR` | `./data/uploads` | 上传文件目录 |

---

## 项目预览

> 建议将运行截图放到 `docs/` 目录下，然后用下面的方式引用。

```markdown
![首页](./docs/home.png)
![商品详情](./docs/product.png)
![购物车](./docs/cart.png)
![后台订单管理](./docs/admin-order.png)
```

---

## 系统架构

详见 [系统总体架构图.md](./系统总体架构图.md)。

---

## License

本项目基于 [MIT License](./LICENSE) 开源。