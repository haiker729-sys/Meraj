import React, { useState } from 'react';
import { Product } from '../../../types';
import { storeDb } from '../../../database/store';
import { Search, AlertTriangle, Plus, Minus, Check, CheckCircle2 } from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(storeDb.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const handleStockInputChange = (productId: string, val: number) => {
    setStockInputs((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const handleSaveStock = (productId: string) => {
    const newStock = stockInputs[productId];
    if (newStock !== undefined) {
      storeDb.updateStock(productId, newStock);
      setProducts(storeDb.getProducts());
      setSavedSuccess(productId);
      setTimeout(() => setSavedSuccess(null), 1500);
    }
  };

  const handleQuickAdjust = (product: Product, delta: number) => {
    const updated = Math.max(0, product.stock + delta);
    storeDb.updateStock(product.id, updated);
    setProducts(storeDb.getProducts());
  };

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'LOW' && (p.stock >= 5 || p.stock === 0)) return false;
    if (stockFilter === 'OUT' && p.stock > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Alert KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Total Inventory Units
          </span>
          <span className="text-xl font-mono font-black text-neutral-900 mt-1 block">
            {products.reduce((acc, p) => acc + p.stock, 0)} units
          </span>
          <span className="text-[10px] text-neutral-400">Across {products.length} product SKUs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
              Low Stock Alerts (&lt; 5 items)
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-mono font-black text-amber-900 mt-1 block">
            {lowStockCount} SKUs
          </span>
          <span className="text-[10px] text-amber-700">Immediate re-order advised</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 block">
            Out Of Stock
          </span>
          <span className="text-xl font-mono font-black text-rose-900 mt-1 block">
            {outOfStockCount} SKUs
          </span>
          <span className="text-[10px] text-rose-700">Products marked unavailable</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product SKU, title..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
            />
          </div>

          {/* Stock Filter Buttons */}
          <div className="flex gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stockFilter === 'ALL'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stockFilter === 'LOW'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('OUT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stockFilter === 'OUT'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Product Details</th>
                <th className="p-3.5">SKU Code</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Sizes</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Quick Adjust</th>
                <th className="p-3.5 text-right">Direct Stock Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredProducts.map((p) => {
                const isLow = p.stock > 0 && p.stock < 5;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-14 object-cover rounded-lg border border-neutral-200 bg-neutral-100 shrink-0"
                        />
                        <span className="font-bold text-neutral-900 block truncate max-w-xs">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-neutral-600">{p.sku}</td>
                    <td className="p-3.5 text-neutral-700">
                      {p.category} • {p.subCategory}
                    </td>
                    <td className="p-3.5 font-mono text-neutral-500 text-[11px]">
                      {p.sizes.join(', ')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full ${
                          isOut
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(p, -1)}
                          disabled={p.stock <= 0}
                          className="p-1 hover:bg-neutral-200 rounded border border-neutral-300 text-neutral-700 disabled:opacity-30"
                          title="Decrease 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(p, 1)}
                          className="p-1 hover:bg-neutral-200 rounded border border-neutral-300 text-neutral-700"
                          title="Add 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(p, 10)}
                          className="px-2 py-0.5 hover:bg-neutral-200 rounded border border-neutral-300 text-[10px] font-mono font-bold text-neutral-700"
                          title="Add 10"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder={String(p.stock)}
                          value={stockInputs[p.id] !== undefined ? stockInputs[p.id] : ''}
                          onChange={(e) => handleStockInputChange(p.id, Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-neutral-300 rounded-lg text-center font-mono text-xs focus:border-black focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveStock(p.id)}
                          className="px-3 py-1 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          {savedSuccess === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Set'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
