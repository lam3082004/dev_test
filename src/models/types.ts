export interface ReceiptItem {
  line_number: number;
  product_name: string;
  product_code?: string;
  unit_name: string;
  quantity_doc: number;
  quantity_actual: number;
  unit_price: number;
  amount: number;
}

export interface Receipt {
  receipt_number?: string;
  don_vi?: string;
  bo_phan?: string;
  date: string;
  deliverer_name?: string;
  theo_so?: string;
  theo_ngay?: string;
  theo_cua?: string;
  warehouse?: string;
  dia_diem?: string;
  total_amount?: number;
  total_text?: string;
  so_chung_tu?: number;
  creator_name?: string;
  warehouse_keeper?: string;
  accountant_name?: string;
  items: ReceiptItem[];
}
