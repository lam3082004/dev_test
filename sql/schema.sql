DROP TABLE IF EXISTS import_receipt_items;
DROP TABLE IF EXISTS import_receipts;

CREATE TABLE IF NOT EXISTS import_receipts (
  id SERIAL PRIMARY KEY,
  receipt_number VARCHAR(50) UNIQUE,
  don_vi VARCHAR(100),
  bo_phan VARCHAR(100),
  date DATE NOT NULL,
  deliverer_name VARCHAR(100),
  theo_so VARCHAR(50),
  theo_ngay VARCHAR(20),
  theo_cua VARCHAR(100),
  warehouse VARCHAR(100),
  dia_diem VARCHAR(100),
  total_amount NUMERIC(18,2) DEFAULT 0,
  total_text VARCHAR(255),
  so_chung_tu INT,
  creator_name VARCHAR(100),
  warehouse_keeper VARCHAR(100),
  accountant_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS import_receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INT NOT NULL REFERENCES import_receipts(id) ON DELETE CASCADE,
  line_number INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(50),
  unit_name VARCHAR(50),
  quantity_doc NUMERIC(15,3) DEFAULT 0,
  quantity_actual NUMERIC(15,3) DEFAULT 0,
  unit_price NUMERIC(15,2) DEFAULT 0,
  amount NUMERIC(18,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_receipts_date ON import_receipts(date);
CREATE INDEX IF NOT EXISTS idx_items_receipt ON import_receipt_items(receipt_id);