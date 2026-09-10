-- Bilingual product categories (MySQL)

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  icon VARCHAR(64) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (slug, name_ar, name_en, icon, sort_order, is_active)
SELECT * FROM (
  SELECT 'phones' AS slug, 'هواتف ذكية' AS name_ar, 'Smartphones' AS name_en, 'smartphone' AS icon, 10 AS sort_order, 1 AS is_active
  UNION ALL SELECT 'laptops', 'لابتوبات', 'Laptops', 'laptop_mac', 20, 1
  UNION ALL SELECT 'tablets', 'أجهزة لوحية', 'Tablets', 'tablet_mac', 30, 1
  UNION ALL SELECT 'watches', 'ساعات', 'Watches', 'watch', 40, 1
  UNION ALL SELECT 'gaming', 'ألعاب', 'Gaming', 'sports_esports', 50, 1
  UNION ALL SELECT 'accessories', 'إكسسوارات', 'Accessories', 'headphones', 60, 1
  UNION ALL SELECT 'other', 'أخرى', 'Other', 'category', 90, 1
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);
