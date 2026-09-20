import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * Public: Get Products Catalog
 * GET /api/products
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, subCategory, search, sort, minPrice, maxPrice, limit, offset } = req.query;

    const result = await db.getProducts({
      category: category as string,
      subCategory: subCategory as string,
      search: search as string,
      sort: sort as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Public: Get Categories
 * GET /api/categories
 */
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Public: Get Product by ID
 * GET /api/products/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

/**
 * Admin: Add New Product
 * POST /api/products
 */
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, category, price, mrp, stock, sku } = req.body;
    if (!name || !category || !price) {
      res.status(400).json({ success: false, error: 'Name, category, and price are required.' });
      return;
    }

    const created = await db.createProduct(req.body);
    res.status(201).json({ success: true, product: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Could not create product.' });
  }
});

/**
 * Admin: Edit Product
 * PUT /api/products/:id
 */
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Could not update product.' });
  }
});

/**
 * Admin: Delete Product
 * DELETE /api/products/:id
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const ok = await db.deleteProduct(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Could not delete product.' });
  }
});

/**
 * Admin: Update Product Stock
 * PATCH /api/products/:id/stock
 */
router.patch('/:id/stock', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || isNaN(Number(stock))) {
      res.status(400).json({ success: false, error: 'Valid stock number is required.' });
      return;
    }

    const updated = await db.updateProduct(req.params.id, { stock: Number(stock) });
    if (!updated) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Could not update stock.' });
  }
});

export default router;
