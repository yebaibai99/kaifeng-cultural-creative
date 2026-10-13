-- 添加开封IP文创产品

-- 1. 包公盲盒手办 - 包公IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    '包公盲盒手办',
    '包公故里·Q版系列',
    '文创',
    5900,
    250,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '包拯，北宋名臣，曾任开封府尹，以清正廉明、铁面无私著称，被后世尊称为"包青天"。这款盲盒以包公为原型，设计多款Q版造型。',
    '材质：PVC+ABS；工艺：环保涂装。',
    '规格：高约8cm，随机款式。',
    '场景：桌面摆件、收藏、送礼。',
    '铁面无私的包大人，也有可爱的一面！',
    '开封府'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '包公盲盒手办');

-- 2. Q版清明娃挂件 - 清明娃IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    'Q版清明娃挂件',
    '清园IP·萌趣可爱',
    '文创',
    1500,
    300,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '清明娃是清明上河园的官方IP形象，以宋代儿童为原型设计，穿着宋服，憨态可掬，深受游客喜爱。',
    '材质：PVC；工艺：环保涂料涂装。',
    '规格：高约6cm，可挂背包或钥匙。',
    '场景：背包挂件、钥匙扣、收藏。',
    '萌萌的清明娃，陪你逛大宋！',
    '清明上河园'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Q版清明娃挂件');

-- 3. 清明上河图立体书 - 清明上河图IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    '清明上河图立体书',
    '儿童科普·3D立体呈现',
    '文创',
    6800,
    150,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '《清明上河图》是中国十大传世名画之一，由北宋画家张择端绘制。立体书以3D形式再现画作场景，让孩子在翻阅中感受宋代汴京的繁华。',
    '工艺：特种纸3D立体结构+手工组装。',
    '规格：约28×22×5cm，全彩印刷。',
    '场景：儿童科普、礼物、收藏。',
    '翻开一本书，穿越一千年！',
    '清明上河园'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '清明上河图立体书');

-- 4. 宋小哥IP帆布包 - 宋小哥IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    '宋小哥IP帆布包',
    '开封文旅·宋服形象',
    '文创',
    4900,
    180,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '"宋小哥"是开封文旅的官方IP形象，身着宋代服饰，代表开封的宋文化特色。这款帆布包印有宋小哥图案，实用又时尚。',
    '材质：12安帆布；工艺：丝网印刷。',
    '规格：约40×35cm，双肩带。',
    '场景：购物、通勤、旅行。',
    '背着宋文化去逛街！',
    '清明上河园'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '宋小哥IP帆布包');

-- 5. 清风文心折扇 - 包公IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    '清风文心折扇',
    '北宋廉政文化·名人名言',
    '文创',
    4500,
    160,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '扇子文化在北宋时期风行于各个阶层。这款折扇选取包拯、王安石、蔡襄等北宋名人关于廉洁自律的诗词金句，由书画家以书画形式呈现。',
    '材质：竹骨+宣纸；工艺：手工书画。',
    '规格：展开约32cm，折叠约5cm。',
    '场景：夏季使用、收藏、送礼。',
    '一扇清风，两袖廉洁。',
    '开封府'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '清风文心折扇');

-- 6. 汴绣真丝手帕 - 清明上河园IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    '汴绣真丝手帕',
    '清园文创·手工刺绣',
    '非遗',
    8900,
    120,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '汴绣是中国传统刺绣工艺，起源于北宋，以开封为中心。这款手帕采用真丝底料，手工刺绣清明上河园标志性建筑上善门图案。',
    '材质：真丝底料+桑蚕丝线；工艺：手工刺绣。',
    '规格：17×17cm，礼盒装。',
    '场景：日常使用、送礼、收藏。',
    '一针一线，绣出千年宋韵。',
    '清明上河园'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '汴绣真丝手帕');

-- 7. 开封夜市徽章贴 - 夜市美食IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    '开封夜市徽章贴',
    '行李箱贴·防水耐磨',
    '伴手礼',
    1190,
    400,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '把夜市招牌与开封小吃做成贴纸，适合装点行李箱与水杯。',
    '材质：防水贴膜；工艺：耐刮覆膜。',
    '规格：10 枚/包，随机款。',
    '场景：行李箱、水杯、笔记本。',
    '贴上就是一次"夜市回忆"。',
    '万岁山大宋武侠城'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '开封夜市徽章贴');

-- 8. 州桥海马冰箱贴 - 夜市美食IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    '州桥海马冰箱贴',
    '记忆开封·文创系列',
    '伴手礼',
    2500,
    400,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '州桥是开封古城的标志性建筑，海马是宋代建筑装饰的神兽。这款冰箱贴以州桥遗址出土的海马纹样为原型，展现开封深厚的历史底蕴。',
    '材质：树脂+磁铁；工艺：立体浮雕+手工上色。',
    '规格：约6×5cm。',
    '场景：冰箱装饰、旅行纪念、送礼。',
    '把开封的记忆贴在冰箱上！',
    '万岁山大宋武侠城'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '州桥海马冰箱贴');

-- 9. 朱仙镇木版年画 - 清明上河图IP
INSERT INTO products (
    creator_id, title, subtitle, category, price_cents, stock, status,
    cover_image_url, image_urls_json, video_urls_json,
    cultural_story, craft_info, specs_text, scene_text, description,
    scenic_spot
)
SELECT
    3,
    '朱仙镇木版年画',
    '中国四大年画·非遗传承',
    '非遗',
    3800,
    200,
    'ON',
    '/favicon.svg',
    '["/favicon.svg"]',
    '[]',
    '朱仙镇木版年画是中国四大年画之一，起源于唐代，兴于宋代。色彩鲜艳、造型夸张，具有浓郁的民俗特色和地方风情。',
    '材质：宣纸；工艺：木版套色印刷。',
    '规格：约30×25cm。',
    '场景：春节装饰、收藏、送礼。',
    '一纸年画，千年传承！',
    '清明上河园'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = '朱仙镇木版年画');