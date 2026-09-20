import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { apiClient } from '../../../api/client';
import { Plus, Search, Edit2, Trash2, Tag, Layers, AlertCircle, Copy, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { AdminAddProductModal } from './AdminAddProductModal';

export const AdminProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.products.list({ limit: 100 });
      if (res?.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    const prodName = deletingProduct.name;
    try {
      await apiClient.products.delete(deletingProduct.id);
      fetchProducts();
      showToast(`"${prodName}" successfully removed from catalog!`, 'success');
    } catch (err) {
      showToast(`Failed to delete product. Please try again.`, 'error');
    }
    setDeletingProduct(null);
  };

  const handleDuplicate = async (p: Product) => {
    const copy: Omit<Product, 'id' | 'createdAt'> = {
      ...p,
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`
    };
    try {
      await apiClient.products.create(copy);
      fetchProducts();
      showToast(`Duplicated "${p.name}" as a new product`, 'success');
    } catch (err) {
      showToast(`Failed to duplicate product.`, 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, category..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden bg-white"
          >
            <option value="ALL">All Departments</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Total Catalog: <strong className="text-black font-mono">{filteredProducts.length}</strong> products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price / MRP</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Tags</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-14 object-cover rounded-lg border border-neutral-200 bg-neutral-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-neutral-900 block truncate max-w-xs">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Sizes: {product.sizes.join(', ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-neutral-600">{product.sku}</td>
                  <td className="p-3.5">
                    <span className="bg-neutral-100 text-neutral-800 text-[10px] px-2 py-0.5 rounded font-medium">
                      {product.category} • {product.subCategory}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-black">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="font-mono text-neutral-400 text-[10px] line-through ml-1.5">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        product.stock <= 5
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {product.stock} pcs
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1">
                      {product.isBestseller && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                          Bestseller
                        </span>
                      )}
                      {product.isNewArrival && (
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(product)}
                        className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700"
                        title="Duplicate product"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(product)}
                        className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Delete Product from Catalog?</h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Are you sure you want to permanently delete this garment? This will remove it from the online store and customer catalog.
            </p>

            <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
              <img
                src={deletingProduct.images[0]}
                alt={deletingProduct.name}
                className="w-12 h-16 object-cover rounded-lg border border-neutral-200 shrink-0 bg-white"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-neutral-900 truncate">{deletingProduct.name}</p>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">SKU: {deletingProduct.sku}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-xs text-neutral-900 font-mono">
                    ₹{deletingProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded font-medium">
                    {deletingProduct.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 text-xs font-medium animate-in slide-in-from-bottom-5">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AdminAddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
          handleRefresh();
        }}
        productToEdit={editingProduct}
      />
    </div>
  );
};
