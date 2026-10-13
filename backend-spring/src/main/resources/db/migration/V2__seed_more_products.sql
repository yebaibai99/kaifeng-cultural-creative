-- Add more seeded products (idempotent-ish via NOT EXISTS checks).

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '宋韵冰箱贴套装',
  '汴梁街景·四枚一套',
  '伴手礼',
  2990,
  200,
  'ON',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以开封古城轮廓与宋代市集纹样为灵感，做成可收藏的小纪念。',
  '材质：软磁+滴胶；工艺：高清印刷+防刮涂层。',
  '规格：4 枚装；单枚约 5cm。',
  '场景：旅行纪念、送礼、家居装饰。',
  '一眼宋韵，把开封带回家。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '宋韵冰箱贴套装');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '汴梁香囊',
  '随身香气·安神助眠',
  '非遗',
  2590,
  90,
  'ON',
  'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '香囊文化源远流长，取宋人雅趣与开封花香作配方线索。',
  '内袋：香草配方；外袋：织锦布；工艺：手工缝制。',
  '规格：约 6×8cm，可替换内芯。',
  '场景：车内、衣柜、随身包挂。',
  '清雅不腻，像一阵温柔的风。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '汴梁香囊');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '龙亭夜色明信片组',
  '12 张套装·礼盒装',
  '文创',
  1590,
  300,
  'ON',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以开封地标与宋风配色为主题，记录城市的夜与灯。',
  '纸张：特种纸；工艺：局部烫金+哑膜。',
  '规格：12 张/盒，约 10×15cm。',
  '场景：旅行纪念、寄送祝福、装饰拼贴。',
  '把想说的话写在“宋色”上。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '龙亭夜色明信片组');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '汴绣杯垫',
  '一组 2 片·防滑耐热',
  '非遗',
  1890,
  160,
  'ON',
  'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '把汴绣纹样“缩小”到日常桌面，茶与咖啡都更有仪式感。',
  '材质：复合软木；工艺：纹样热转印+防水涂层。',
  '规格：直径约 10cm，2 片装。',
  '场景：办公桌、茶席、家居。',
  '耐看又实用，轻松点亮桌面。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '汴绣杯垫');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '大相国寺手账贴纸',
  '宋风图案·40 枚',
  '文创',
  1290,
  500,
  'ON',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '取开封寺院建筑与纹样元素，做成可随手拼贴的小图标。',
  '材质：和纸；工艺：哑光印刷，易撕不留胶。',
  '规格：40 枚/包，随机混合图案。',
  '场景：手账、礼物包装、照片墙。',
  '让记录变得更有“宋味儿”。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '大相国寺手账贴纸');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '汴梁茶礼小罐',
  '桂花乌龙·旅行装',
  '伴手礼',
  3490,
  120,
  'ON',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以宋人点茶意象为灵感，配以清甜桂花香气，适合送礼。',
  '工艺：铝罐密封；配方：桂花香型乌龙。',
  '规格：约 30g/罐，可冲泡多次。',
  '场景：办公冲泡、旅行、礼赠。',
  '一开罐就像走进秋日桂花巷。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '汴梁茶礼小罐');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '开封府钥匙扣',
  '金属浮雕·耐磨不掉色',
  '伴手礼',
  990,
  600,
  'ON',
  'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以开封府匾额元素为核心，做成小巧的随身纪念。',
  '材质：锌合金；工艺：浮雕+电镀封釉。',
  '规格：约 3.5cm，附钥匙圈。',
  '场景：钥匙、包挂、车钥匙。',
  '小物件也能很有故事。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '开封府钥匙扣');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '宋风扇面书签',
  '扇形裁切·轻薄不易折',
  '文创',
  1490,
  260,
  'ON',
  'https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '扇面纹样取自宋代花鸟画意境，适合搭配古风书籍与手账。',
  '材质：特种纸+覆膜；工艺：异形裁切+烫银。',
  '规格：约 6×12cm。',
  '场景：阅读、礼赠、文具收藏。',
  '翻页之间有一点风雅。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '宋风扇面书签');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '汴梁手作小灯',
  '暖光氛围·USB 供电',
  '手作',
  6990,
  45,
  'ON',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以“灯火汴梁”为主题，做成可放在书桌上的小小夜灯。',
  '材质：木质底座+灯罩；工艺：手工组装。',
  '规格：约 10×10×16cm，USB 供电。',
  '场景：床头、书桌、氛围装饰。',
  '一盏灯，点亮夜读时刻。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '汴梁手作小灯');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '非遗剪纸窗花',
  '开封元素·可重复粘贴',
  '非遗',
  1690,
  220,
  'ON',
  'https://images.unsplash.com/photo-1458538977777-0549b3c5b1d0?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1458538977777-0549b3c5b1d0?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '剪纸承载民间审美与祝福，把开封地标与瑞兽纹样融在一张纸里。',
  '材质：专用剪纸纸；工艺：手工刻制。',
  '规格：约 20×20cm。',
  '场景：窗贴、节庆装饰、礼赠。',
  '把喜气贴在窗上，也贴进心里。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '非遗剪纸窗花');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '宋风茶席布',
  '防水易打理·桌面更高级',
  '文创',
  4590,
  70,
  'ON',
  'https://images.unsplash.com/photo-1526406915894-6c228685b7d0?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1526406915894-6c228685b7d0?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '取宋代纹样与留白美学，做成日常可用的茶席与桌布。',
  '材质：防泼水涤棉；工艺：高清印染。',
  '规格：约 60×40cm。',
  '场景：茶席、餐桌、拍照背景。',
  '一铺开就有“雅”的氛围。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '宋风茶席布');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '开封城墙拼图',
  '500 片·亲子互动',
  '文创',
  4990,
  110,
  'ON',
  'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '用拼图的方式认识开封城市记忆，拼完还能装框展示。',
  '材质：加厚纸板；工艺：哑光覆膜+精准模切。',
  '规格：500 片，完成尺寸约 52×38cm。',
  '场景：亲子互动、桌游、收藏。',
  '慢慢拼，也是在慢慢认识一座城。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '开封城墙拼图');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '汴梁香薰蜡烛',
  '桂雨木香·卧室氛围',
  '伴手礼',
  5590,
  60,
  'ON',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以“雨后桂花”为香气主题，配合木香尾调，柔和耐闻。',
  '蜡材：植物蜡；工艺：手工灌蜡。',
  '规格：约 180g，燃烧约 30 小时。',
  '场景：卧室、客厅、仪式感时刻。',
  '点上就像把秋天留在房间里。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '汴梁香薰蜡烛');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '手作流苏手机挂绳',
  '宋色配色·轻盈耐用',
  '手作',
  2190,
  150,
  'ON',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '取宋代传统配色做渐变编绳，日常搭配更有细节。',
  '材质：耐磨编绳+金属扣；工艺：手工编织。',
  '规格：约 18cm，可挂手机或钥匙。',
  '场景：手机挂绳、包挂、钥匙。',
  '小小流苏，让日常更精致。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '手作流苏手机挂绳');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '汴梁珐琅徽章',
  '宋风图案·三枚套装',
  '文创',
  2790,
  240,
  'ON',
  'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以城门、花鸟与汴绣纹样为元素，适合装点衣帽与包袋。',
  '材质：珐琅+金属底；工艺：滴釉上色+烤漆。',
  '规格：3 枚/套，单枚约 2.5cm。',
  '场景：背包、衣领、收藏。',
  '别在身上，就是随身的城市符号。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '汴梁珐琅徽章');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '非遗木版年画小册',
  '开封年画·图文介绍',
  '非遗',
  3290,
  85,
  'ON',
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '木版年画承载民俗与审美，精选图样与工艺流程做成轻读小册。',
  '工艺：四色印刷+锁线装订。',
  '规格：约 64 页，A6 便携。',
  '场景：随身阅读、展览周边、礼赠。',
  '带你快速了解“老手艺”的魅力。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '非遗木版年画小册');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '开封城景马克杯',
  '磨砂质感·耐热耐用',
  '文创',
  3690,
  95,
  'ON',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '把开封城景线稿做成杯身环绕图案，喝水也像在“逛城”。',
  '材质：陶瓷；工艺：磨砂釉+高温烧制。',
  '规格：约 350ml。',
  '场景：办公室、家用、礼赠。',
  '每天一杯，把城市温度握在手里。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '开封城景马克杯');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '汴梁礼盒手帕',
  '宋色渐变·亲肤吸汗',
  '伴手礼',
  1990,
  180,
  'ON',
  'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以宋代传统配色做渐变图案，简洁耐看，适合作为随手礼。',
  '材质：纯棉；工艺：活性印染。',
  '规格：约 30×30cm，礼盒装。',
  '场景：日用、送礼、旅行。',
  '低调有质感，越用越喜欢。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '汴梁礼盒手帕');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '手作宋风耳饰',
  '轻量不压耳·百搭',
  '手作',
  4990,
  40,
  'ON',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '以花瓣与扇面为造型灵感，配以宋色渐变，轻盈耐看。',
  '材质：合金镀色+树脂；工艺：手工上色。',
  '规格：一对装，轻量佩戴。',
  '场景：日常通勤、约会、礼赠。',
  '小小点缀，气质立刻加分。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '手作宋风耳饰');

INSERT INTO products (
  creator_id, title, subtitle, category, price_cents, stock, status,
  cover_image_url, image_urls_json, video_urls_json,
  cultural_story, craft_info, specs_text, scene_text, description
)
SELECT
  3,
  '开封夜市徽章贴',
  '行李箱贴·防水耐磨',
  '伴手礼',
  1190,
  400,
  'ON',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"]',
  '[]',
  '把夜市招牌与开封小吃做成贴纸，适合装点行李箱与水杯。',
  '材质：防水贴膜；工艺：耐刮覆膜。',
  '规格：10 枚/包，随机款。',
  '场景：行李箱、水杯、笔记本。',
  '贴上就是一次“夜市回忆”。'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '开封夜市徽章贴');

