import { Request, Response } from 'express';
import pool from '../config/database';
import { Receipt } from '../models/types';

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

const parseReceiptId = (id: string | string[] | undefined): number | null => {
  if (typeof id !== 'string') {
    return null;
  }

  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const createReceipt = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const receipt: Receipt = req.body;
    const totalAmount = receipt.items.reduce((sum, item) => {
      return sum + Number(item.quantity_actual) * Number(item.unit_price);
    }, 0);

    const receiptResult = await client.query(
      `INSERT INTO import_receipts
        (receipt_number, don_vi, bo_phan, date, deliverer_name,
         theo_so, theo_ngay, theo_cua, warehouse, dia_diem,
         total_amount, total_text, so_chung_tu,
         creator_name, warehouse_keeper, accountant_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        receipt.receipt_number,
        receipt.don_vi,
        receipt.bo_phan,
        receipt.date,
        receipt.deliverer_name,
        receipt.theo_so,
        receipt.theo_ngay,
        receipt.theo_cua,
        receipt.warehouse,
        receipt.dia_diem,
        totalAmount,
        receipt.total_text,
        receipt.so_chung_tu,
        receipt.creator_name,
        receipt.warehouse_keeper,
        receipt.accountant_name,
      ]
    );

    const receiptId = receiptResult.rows[0].id;

    for (const item of receipt.items) {
      const amount = Number(item.quantity_actual) * Number(item.unit_price);
      await client.query(
        `INSERT INTO import_receipt_items
          (receipt_id, line_number, product_name, product_code, unit_name,
           quantity_doc, quantity_actual, unit_price, amount)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          receiptId,
          item.line_number,
          item.product_name,
          item.product_code,
          item.unit_name,
          item.quantity_doc,
          item.quantity_actual,
          item.unit_price,
          amount,
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: receiptResult.rows[0],
      message: 'Tạo phiếu thành công',
    });
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  } finally {
    client.release();
  }
};

export const getAllReceipts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT r.*,
              json_agg(i ORDER BY i.line_number) AS items
       FROM import_receipts r
       LEFT JOIN import_receipt_items i ON i.receipt_id = r.id
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getReceiptById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseReceiptId(req.params.id);
    if (id == null) {
      res.status(400).json({ success: false, message: 'ID phiếu không hợp lệ' });
      return;
    }

    const result = await pool.query(
      `SELECT r.*,
              json_agg(i ORDER BY i.line_number) AS items
       FROM import_receipts r
       LEFT JOIN import_receipt_items i ON i.receipt_id = r.id
       WHERE r.id = $1
       GROUP BY r.id`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const deleteReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseReceiptId(req.params.id);
    if (id == null) {
      res.status(400).json({ success: false, message: 'ID phiếu không hợp lệ' });
      return;
    }

    const result = await pool.query('DELETE FROM import_receipts WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' });
      return;
    }

    res.json({ success: true, message: 'Đã xoá phiếu' });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};
