-- TechPro POS + shared inventory (MySQL) — phase 1+2
-- Currency: OMR DECIMAL(10,3)

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(64) NOT NULL,
  barcode VARCHAR(128) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NULL,
  brand VARCHAR(128) NULL,
  category VARCHAR(64) NULL,
  listing_type VARCHAR(32) NOT NULL DEFAULT 'new',
  description_ar TEXT NULL,
  description_en TEXT NULL,
  image VARCHAR(1024) NULL,
  cost_price DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  selling_price DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  old_price DECIMAL(10,3) NULL,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  stock_quantity INT NOT NULL DEFAULT 0,
  min_stock_alert INT NOT NULL DEFAULT 5,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_products_sku (sku),
  UNIQUE KEY uq_products_barcode (barcode),
  KEY idx_products_active (is_active),
  KEY idx_products_category (category),
  CONSTRAINT chk_products_stock CHECK (stock_quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  change_qty INT NOT NULL,
  balance_after INT NOT NULL,
  reason VARCHAR(50) NOT NULL,
  reference_id BIGINT UNSIGNED NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_movements_product (product_id),
  KEY idx_movements_created (created_at),
  CONSTRAINT fk_movements_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sales (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(64) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL DEFAULT 'زبون نقدي',
  subtotal DECIMAL(10,3) NOT NULL,
  tax_amount DECIMAL(10,3) NOT NULL,
  total_amount DECIMAL(10,3) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  cashier_email VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sales_invoice (invoice_number),
  KEY idx_sales_channel (channel),
  KEY idx_sales_created (created_at),
  CONSTRAINT chk_sales_channel CHECK (channel IN ('POS', 'ONLINE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sale_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sale_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,3) NOT NULL,
  unit_cost DECIMAL(10,3) NOT NULL,
  subtotal DECIMAL(10,3) NOT NULL,
  tax_amount DECIMAL(10,3) NOT NULL,
  total_amount DECIMAL(10,3) NOT NULL,
  KEY idx_sale_items_sale (sale_id),
  KEY idx_sale_items_product (product_id),
  CONSTRAINT chk_sale_items_qty CHECK (quantity > 0),
  CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
