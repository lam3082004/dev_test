# Warehouse Management - dev_test

## Cau truc bang co so du lieu

He thong su dung PostgreSQL voi 2 bang chinh:

- `import_receipts`: Luu thong tin phieu nhap kho (phan header)
- `import_receipt_items`: Luu danh sach hang hoa theo tung phieu (phan detail)

### 1. Bang `import_receipts`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | ID tu tang cua phieu |
| receipt_number | VARCHAR(50) | UNIQUE | So phieu nhap |
| don_vi | VARCHAR(100) |  | Don vi lap phieu |
| bo_phan | VARCHAR(100) |  | Bo phan lap phieu |
| date | DATE | NOT NULL | Ngay nhap kho |
| deliverer_name | VARCHAR(100) |  | Nguoi giao hang |
| theo_so | VARCHAR(50) |  | Chung tu tham chieu so |
| theo_ngay | VARCHAR(20) |  | Chung tu tham chieu ngay |
| theo_cua | VARCHAR(100) |  | Don vi/nguoi cap chung tu |
| warehouse | VARCHAR(100) |  | Kho nhap |
| dia_diem | VARCHAR(100) |  | Dia diem nhap |
| total_amount | NUMERIC(18,2) | DEFAULT 0 | Tong tien phieu |
| total_text | VARCHAR(255) |  | Tong tien bang chu |
| so_chung_tu | INT |  | So chung tu goc kem theo |
| creator_name | VARCHAR(100) |  | Nguoi lap phieu |
| warehouse_keeper | VARCHAR(100) |  | Thu kho |
| accountant_name | VARCHAR(100) |  | Ke toan truong |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Thoi diem tao ban ghi |

### 2. Bang `import_receipt_items`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | ID tu tang cua dong hang |
| receipt_id | INT | NOT NULL, FK -> import_receipts(id), ON DELETE CASCADE | Khoa ngoai toi bang phieu |
| line_number | INT | NOT NULL | So thu tu dong hang |
| product_name | VARCHAR(255) | NOT NULL | Ten hang hoa |
| product_code | VARCHAR(50) |  | Ma hang |
| unit_name | VARCHAR(50) |  | Don vi tinh |
| quantity_doc | NUMERIC(15,3) | DEFAULT 0 | So luong theo chung tu |
| quantity_actual | NUMERIC(15,3) | DEFAULT 0 | So luong thuc nhap |
| unit_price | NUMERIC(15,2) | DEFAULT 0 | Don gia |
| amount | NUMERIC(18,2) | DEFAULT 0 | Thanh tien |

### 3. Quan he giua cac bang

- Mot ban ghi trong `import_receipts` co nhieu ban ghi trong `import_receipt_items`.
- `import_receipt_items.receipt_id` tham chieu den `import_receipts.id`.
- Khi xoa mot phieu trong `import_receipts`, toan bo dong hang lien quan trong `import_receipt_items` se bi xoa theo (`ON DELETE CASCADE`).

### 4. Index dang su dung

- `idx_receipts_date` tren cot `import_receipts.date`
- `idx_items_receipt` tren cot `import_receipt_items.receipt_id`

Cac index nay giup toi uu truy van danh sach phieu theo ngay va truy van chi tiet dong hang theo phieu.
