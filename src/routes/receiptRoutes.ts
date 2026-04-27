import { Router } from 'express';
import {
	createReceipt,
	getAllReceipts,
	getReceiptById,
	deleteReceipt,
} from '../controllers/receiptController';
import { validateReceipt } from '../middlewares/validation';

const router = Router();

router.post('/', validateReceipt, createReceipt);
router.get('/', getAllReceipts);
router.get('/:id', getReceiptById);
router.delete('/:id', deleteReceipt);

export default router;
