import { afterAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/database';

const buildValidReceipt = (receiptNumber: string) => ({
  receipt_number: receiptNumber,
  don_vi: 'Cong ty ABC',
  bo_phan: 'Kho vat tu',
  date: '2024-03-15',
  deliverer_name: 'Nguyen Van A',
  warehouse: 'Kho A',
  creator_name: 'Tran Thi B',
  items: [
    {
      line_number: 1,
      product_name: 'Thep hop 40x40',
      product_code: 'TH-001',
      unit_name: 'Cay',
      quantity_doc: 100,
      quantity_actual: 100,
      unit_price: 150000,
      amount: 15000000,
    },
    {
      line_number: 2,
      product_name: 'Bulong M10',
      product_code: 'BL-010',
      unit_name: 'Cai',
      quantity_doc: 500,
      quantity_actual: 498,
      unit_price: 5000,
      amount: 2490000,
    },
  ],
});

const uniqueReceiptNumber = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

afterAll(async () => {
  await pool.end();
});

describe('POST /api/receipts', () => {
  it('creates a receipt successfully', async () => {
    const validReceipt = buildValidReceipt(uniqueReceiptNumber('PN-POST'));
    const res = await request(app).post('/api/receipts').send(validReceipt);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.receipt_number).toBe(validReceipt.receipt_number);
  });

  it('returns 400 when date is missing', async () => {
    const validReceipt = buildValidReceipt(uniqueReceiptNumber('PN-NODATE'));
    const { date, ...noDate } = validReceipt;
    const res = await request(app).post('/api/receipts').send(noDate);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0]).toContain('Ngày');
  });

  it('returns 400 when items are empty', async () => {
    const validReceipt = buildValidReceipt(uniqueReceiptNumber('PN-NOITEM'));
    const res = await request(app).post('/api/receipts').send({ ...validReceipt, items: [] });
    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toContain('ít nhất 1 dòng');
  });

  it('returns 400 when product_name is missing', async () => {
    const validReceipt = buildValidReceipt(uniqueReceiptNumber('PN-NONAME'));
    const badItems = [{ ...validReceipt.items[0], product_name: '' }];
    const res = await request(app)
      .post('/api/receipts')
      .send({ ...validReceipt, items: badItems });

    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toContain('tên hàng');
  });
});

describe('GET /api/receipts', () => {
  it('returns receipt list', async () => {
    const res = await request(app).get('/api/receipts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/receipts/:id', () => {
  it('returns receipt by existing id', async () => {
    const validReceipt = buildValidReceipt(uniqueReceiptNumber('PN-GET'));
    const created = await request(app).post('/api/receipts').send({
      ...validReceipt,
      receipt_number: uniqueReceiptNumber('PN-TEST-GET'),
    });

    const id = created.body.data.id;
    const res = await request(app).get(`/api/receipts/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('returns 404 for non-existing id', async () => {
    const res = await request(app).get('/api/receipts/9999999');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/receipts/:id', () => {
  it('deletes existing receipt successfully', async () => {
    const created = await request(app)
      .post('/api/receipts')
      .send(buildValidReceipt(uniqueReceiptNumber('PN-DEL')));

    const id = created.body.data.id;
    const res = await request(app).delete(`/api/receipts/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
