import React, { useState, useMemo, useEffect } from 'react';
import { Product, CategoryType } from '../../../types';
import { storeDb } from '../../../database/store';
import { ProductCard } from '../../components/product-card/ProductCard';
import { Search, Filter, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface ProductsPageProps {
  initialCategory?: string;
  initialSearch?: string;
  initialFilter?: string;
  onNavigate: (path: string) => void;
  onSelectProduct?: (product: Product) => void;
  onProductClick?: (productId: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (id: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  initialCategory,
  initialSearch = '',
  initialFilter,
  onNavigate,
  onSelectProduct,
  onProductClick,
  wishlist: propWishlist,
  onToggleWishlist
}) => {
  const currentWishlist = propWishlist || storeDb.getWishlist();

  const handleSelectProduct = (p: Product) => {
    if (onProductClick) {
      onProductClick(p.id);
    } else if (onSelectProduct) {
      onSelectProduct(p);
    } else {
      onNavigate(`/product/${p.id}`);
    }
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR'>('POPULAR');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    setProducts(storeDb.getProducts());
    const unsub = storeDb.subscribe(() => {
      setProducts(storeDb.getProducts());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  // Available unique sizes and colors across catalog
  const allAvailableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  const allAvailableColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Filtering & Sorting pipeline
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search matching (Name, SKU, Category, Subcategory)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesSub = p.subCategory.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCat && !matchesSub) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // SubCategory filter
      if (selectedSubCategory !== 'ALL' && p.subCategory !== selectedSubCategory) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = selectedSizes.some((s) => p.sizes.includes(s));
        if (!hasMatchingSize) return false;
      }

      // Color filter
      if (selectedColors.length > 0) {
        const hasMatchingColor = selectedColors.some((c) =>
          p.colors.some((col) => col.name === c)
        );
        if (!hasMatchingColor) return false;
      }

      // Price filter
      if (p.price > maxPrice) {
        return false;
      }

      // Stock availability
      if (onlyInStock && p.stock <= 0) {
        return false;
      }

      // Preset filter parameter (e.g. New Arrivals / Bestsellers)
      if (initialFilter === 'new' && !p.isNewArrival) return false;
      if (initialFilter === 'bestsellers' && !p.isBestseller) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'NEWEST') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      // Popular (rating * review count)
      return (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    selectedSizes,
    selectedColors,
    maxPrice,
    onlyInStock,
    sortBy,
    initialFilter
  ]);

  const toggleSizeFilter = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColorFilter = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedSubCategory('ALL');
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(5000);
    setOnlyInStock(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'ALL' ||
    selectedSubCategory !== 'ALL' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    maxPrice < 5000 ||
    onlyInStock;

  return (
    <div className="min-h-screen bg-neutral-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1">
              <button onClick={() => onNavigate('/home')} className="hover:text-black">Home</button>
              <span>/</span>
              <span className="text-black font-semibold">
                {selectedCategory === 'ALL' ? 'All Clothing' : `${selectedCategory}'s Collection`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950">
              {selectedCategory === 'ALL' ? 'Browse All Apparel' : `${selectedCategory}'s Fashion`}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Showing <strong className="font-mono text-black">{filteredProducts.length}</strong> styles
            </p>
          </div>

          {/* Search bar & Sorting Selector */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name or SKU..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:border-black focus:outline-hidden cursor-pointer"
              >
                <option value="POPULAR">Most Popular</option>
                <option value="NEWEST">Newest Arrivals</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden p-2 bg-white border border-neutral-300 rounded-xl text-neutral-700 hover:text-black flex items-center gap-1 text-xs font-bold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 py-3 border-b border-neutral-200 text-xs">
            <span className="text-neutral-500 font-medium">Active filters:</span>
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-black text-white px-2.5 py-1 rounded-full text-xs font-bold">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('ALL')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedSubCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-full text-xs font-medium">
                {selectedSubCategory}
                <button onClick={() => setSelectedSubCategory('ALL')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedSizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-full text-xs font-mono font-bold">
                Size: {s}
                <button onClick={() => toggleSizeFilter(s)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {selectedColors.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-full text-xs font-medium">
                Color: {c}
                <button onClick={() => toggleColorFilter(c)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {maxPrice < 5000 && (
              <span className="inline-flex items-center gap-1 bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-full text-xs font-mono">
                Under ₹{maxPrice}
                <button onClick={() => setMaxPrice(5000)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Content Layout: Sidebar Filters + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-6">
              {/* Category Filter */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 mb-3">
                  Department
                </h4>
                <div className="space-y-1.5 text-xs">
                  {['ALL', 'Men', 'Women', 'Kids'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedSubCategory('ALL');
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex justify-between ${
                        selectedCategory === cat
                          ? 'bg-black text-white font-bold'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{cat === 'ALL' ? 'All Collections' : cat}</span>
                      {cat !== 'ALL' && (
                        <span className="font-mono text-[10px] opacity-75">
                          {products.filter((p) => p.category === cat).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                    Max Price
                  </h4>
                  <span className="font-mono font-bold text-xs text-black">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                  <span>₹500</span>
                  <span>₹5000</span>
                </div>
              </div>

              {/* Sizes Filter */}
              <div className="pt-4 border-t border-neutral-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 mb-2.5">
                  Available Sizes
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {allAvailableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSizeFilter(size)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md border transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="pt-4 border-t border-neutral-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 mb-2.5">
                  Colors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {allAvailableColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColorFilter(color.name)}
                      title={color.name}
                      style={{ backgroundColor: color.hex }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        selectedColors.includes(color.name)
                          ? 'border-black scale-110 ring-2 ring-neutral-300'
                          : 'border-neutral-300 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Stock toggle */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-800">Only In-Stock Items</span>
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 accent-black rounded cursor-pointer"
                />
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">No products match your criteria</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Try clearing your filters or search keywords to view the rest of our catalog.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={handleSelectProduct}
                    isWishlisted={currentWishlist.includes(product.id)}
                    onToggleWishlist={(id) => {
                      if (onToggleWishlist) onToggleWishlist(id);
                      else storeDb.toggleWishlist(id);
                    }}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
