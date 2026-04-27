import { NextFunction, Request, Response } from 'express';

interface ReceiptItemInput {
  product_name?: string;
  unit_name?: string;
  quantity_actual?: number | string;
  unit_price?: number | string;
}

interface ReceiptBody {
  date?: string;
  items?: ReceiptItemInput[];
}

export const validateReceipt = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];
  const { date, items } = req.body as ReceiptBody;

  if (!date) {
    errors.push('Ngày nhập kho không được để trống');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Phải có ít nhất 1 dòng hàng hóa');
  } else {
    items.forEach((item, idx) => {
      if (!item.product_name) {
        errors.push(`Dòng ${idx + 1}: Thiếu tên hàng hóa`);
      }
      if (!item.unit_name) {
        errors.push(`Dòng ${idx + 1}: Thiếu đơn vị tính`);
      }
      if (item.quantity_actual == null || Number(item.quantity_actual) < 0) {
        errors.push(`Dòng ${idx + 1}: Số lượng thực nhập không hợp lệ`);
      }
      if (item.unit_price == null || Number(item.unit_price) < 0) {
        errors.push(`Dòng ${idx + 1}: Đơn giá không hợp lệ`);
      }
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};
