import React, { useState, useRef } from 'react';
import { Product, CategoryType, ProductColor } from '../../../types';
import { storeDb } from '../../../database/store';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Check,
  Upload,
  ImagePlus,
  FolderUp,
  Star,
  Loader2,
  Link2,
  AlertCircle,
  Camera
} from 'lucide-react';

interface AdminAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '2-3Y', '4-5Y', '6-7Y', '8-9Y'];

const DEFAULT_COLORS: ProductColor[] = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Jet Black', hex: '#111111' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Olive Green', hex: '#3F6212' },
  { name: 'Mustard Yellow', hex: '#EAB308' },
  { name: 'Wine Red', hex: '#881337' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Beige Cream', hex: '#D7C4B7' }
];

// Client-side image compressor: scales photos to max 1200px and exports as clean base64 data URLs
const compressAndReadImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const AdminAddProductModal: React.FC<AdminAddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const [name, setName] = useState(productToEdit?.name || '');
  const [category, setCategory] = useState<CategoryType>(productToEdit?.category || 'Men');
  const [subCategory, setSubCategory] = useState(productToEdit?.subCategory || 'Shirts');
  const [price, setPrice] = useState<number>(productToEdit?.price || 999);
  const [mrp, setMrp] = useState<number>(productToEdit?.mrp || 1499);
  const [discount, setDiscount] = useState<number>(productToEdit?.discount || 33);
  const [stock, setStock] = useState<number>(productToEdit?.stock || 25);
  const [sku, setSku] = useState(productToEdit?.sku || '');
  const [description, setDescription] = useState(
    productToEdit?.description || 'Crafted with premium quality combed cotton for all-day breathability and comfort.'
  );
  const [material, setMaterial] = useState(productToEdit?.material || '100% Combed Cotton, 220 GSM');
  const [careInstructions, setCareInstructions] = useState(
    productToEdit?.careInstructions || 'Machine wash cold with like colors, gentle cycle, do not bleach'
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    productToEdit?.sizes || ['S', 'M', 'L', 'XL']
  );
  const [selectedColors, setSelectedColors] = useState<ProductColor[]>(
    productToEdit?.colors || [DEFAULT_COLORS[0], DEFAULT_COLORS[1]]
  );
  const [images, setImages] = useState<string[]>(
    productToEdit?.images || [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isBestseller, setIsBestseller] = useState(productToEdit?.isBestseller || false);
  const [isNewArrival, setIsNewArrival] = useState(productToEdit?.isNewArrival ?? true);
  const [isFeatured, setIsFeatured] = useState(productToEdit?.isFeatured || false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate SKU if blank
  const handleAutoSku = () => {
    const prefix = category.toUpperCase().slice(0, 3);
    const sub = subCategory.toUpperCase().slice(0, 3);
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`FP-${prefix}-${sub}-${rand}`);
  };

  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
    if (mrp > newPrice) {
      setDiscount(Math.round(((mrp - newPrice) / mrp) * 100));
    }
  };

  const handleMrpChange = (newMrp: number) => {
    setMrp(newMrp);
    if (newMrp > price) {
      setDiscount(Math.round(((newMrp - price) / newMrp) * 100));
    }
  };

  const toggleSize = (s: string) => {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleColor = (c: ProductColor) => {
    setSelectedColors((prev) => {
      const exists = prev.some((col) => col.name === c.name);
      return exists ? prev.filter((col) => col.name !== c.name) : [...prev, c];
    });
  };

  // Gallery File Upload Handlers
  const processImageFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsProcessingFiles(true);
    setValidationError(null);
    try {
      const compressedUrls = await Promise.all(fileArray.map(compressAndReadImage));
      setImages((prev) => [...prev, ...compressedUrls]);
    } catch (err) {
      console.error('Failed to read image files', err);
      setValidationError('Failed to process photos from gallery. Please try again.');
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const handleSetCover = (idx: number) => {
    if (idx === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const chosen = copy.splice(idx, 1)[0];
      return [chosen, ...copy];
    });
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
      setValidationError(null);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError('Product name is required');
      return;
    }

    const finalSku = sku.trim() || `FP-${category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const productData: Omit<Product, 'id' | 'createdAt'> = {
      name: name.trim(),
      category,
      subCategory: subCategory.trim(),
      price,
      mrp,
      discount,
      stock,
      sizes: selectedSizes.length > 0 ? selectedSizes : ['M'],
      colors: selectedColors.length > 0 ? selectedColors : [{ name: 'Black', hex: '#000000' }],
      sku: finalSku,
      description: description.trim(),
      material: material.trim(),
      careInstructions: careInstructions.trim(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      rating: productToEdit?.rating || 4.8,
      reviewsCount: productToEdit?.reviewsCount || 12,
      isBestseller,
      isNewArrival,
      isFeatured
    };

    if (productToEdit) {
      storeDb.updateProduct(productToEdit.id, productData);
    } else {
      storeDb.addProduct(productData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 my-8">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {productToEdit ? 'Edit Garment Details' : 'Add New Clothing Product to Store'}
            </h2>
            <p className="text-xs text-neutral-500">
              Configure apparel metadata, inventory counts, and media assets
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* Row 1: Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-700 mb-1">
                Product Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pure Cotton Oxford Button-Down Shirt"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-neutral-700">SKU Code</label>
                <button
                  type="button"
                  onClick={handleAutoSku}
                  className="text-[10px] text-amber-700 font-bold underline"
                >
                  Auto Gen
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. FP-MEN-SHR-01"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono focus:border-black focus:outline-hidden uppercase"
              />
            </div>
          </div>

          {/* Row 2: Category & SubCategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Department / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden bg-white"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Subcategory</label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Shirts, Jeans, Kurtas, Dresses"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 3: Price, MRP, Discount, Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg font-mono focus:border-black bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">MRP Tag (₹)</label>
              <input
                type="number"
                min="0"
                value={mrp}
                onChange={(e) => handleMrpChange(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg font-mono focus:border-black bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg font-mono focus:border-black bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Stock Units</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg font-mono focus:border-black bg-white"
              />
            </div>
          </div>

          {/* Row 4: Size Checkboxes */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1.5">
              Available Sizes ({selectedSizes.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-all ${
                    selectedSizes.includes(s)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Color Swatches */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1.5">
              Color Variations
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((c) => {
                const isSelected = selectedColors.some((col) => col.name === c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleColor(c)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all ${
                      isSelected
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 bg-white text-neutral-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Gallery Image Upload (गैलरी से फोटो अपलोड करें) */}
          <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block font-bold text-neutral-900 text-xs">
                  Product Photos ({images.length})
                </label>
                <span className="text-[11px] text-neutral-500">
                  Upload directly from your phone/computer gallery or camera
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Gallery Upload Enabled
              </span>
            </div>

            {/* Hidden native file input accepting multiple images */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Main Drag-and-Drop / Gallery Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-black bg-neutral-200/60 scale-[1.01]'
                  : 'border-neutral-300 hover:border-black bg-white hover:bg-neutral-50'
              }`}
            >
              {isProcessingFiles ? (
                <div className="flex flex-col items-center justify-center py-2 text-neutral-700">
                  <Loader2 className="w-8 h-8 animate-spin text-black mb-2" />
                  <span className="font-bold text-xs">Compressing & optimizing gallery photos...</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">Please wait a moment</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-2 group-hover:scale-105 transition-transform">
                    <FolderUp className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Choose from Gallery (गैलरी से फोटो चुनें)</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    or drag and drop garment photos here
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Supports JPG, PNG, WEBP • Multiple photos allowed • Optimized for fast loading
                  </p>
                </div>
              )}
            </div>

            {/* Photo Previews with Cover Indicator & Management */}
            {images.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-neutral-700">
                    Selected Images (First image is the main store cover):
                  </span>
                  <button
                    type="button"
                    onClick={() => setImages([])}
                    className="text-[10px] text-rose-600 hover:underline font-semibold"
                  >
                    Clear All Photos
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`group relative rounded-xl overflow-hidden border transition-all ${
                        i === 0
                          ? 'border-neutral-900 ring-2 ring-neutral-900 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="aspect-3/4 w-full bg-neutral-100 relative">
                        <img
                          src={img}
                          alt={`Garment ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Cover badge */}
                        {i === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-black/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>Cover</span>
                          </div>
                        )}
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(i);
                          }}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* Set as Cover button if not index 0 */}
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetCover(i);
                            }}
                            className="absolute bottom-1.5 inset-x-1.5 bg-white/95 hover:bg-black hover:text-white text-neutral-900 text-[10px] font-bold py-1 rounded-lg text-center shadow-xs transition-colors opacity-90 group-hover:opacity-100 flex items-center justify-center gap-1"
                          >
                            <Star className="w-2.5 h-2.5" />
                            <span>Make Cover</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional URL Toggle & Presets */}
            <div className="mt-3 pt-3 border-t border-neutral-200/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] font-bold text-neutral-700 hover:text-black flex items-center gap-1.5 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{showUrlInput ? 'Hide Web URL Input' : '+ Or add image via Web URL'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400 font-medium hidden sm:inline">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImages((prev) => [
                        ...prev,
                        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
                      ]);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md font-medium text-neutral-700"
                  >
                    Shirt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImages((prev) => [
                        ...prev,
                        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
                      ]);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md font-medium text-neutral-700"
                  >
                    T-Shirt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImages((prev) => [
                        ...prev,
                        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
                      ]);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md font-medium text-neutral-700"
                  >
                    Kurti/Ethnic
                  </button>
                </div>
              </div>

              {showUrlInput && (
                <div className="flex gap-2 mt-1 animate-in fade-in duration-150">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-xl text-xs focus:border-black focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs"
                  >
                    Add URL
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 7: Description & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl focus:border-black text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Fabric & Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl focus:border-black text-xs"
              />
              <label className="block font-bold text-neutral-700 mt-2 mb-1">Care Guide</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl focus:border-black text-xs"
              />
            </div>
          </div>

          {/* Row 8: Tags */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-neutral-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 accent-black rounded"
              />
              <span className="font-semibold text-neutral-800">New Arrival Tag</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 accent-black rounded"
              />
              <span className="font-semibold text-neutral-800">Bestseller Badge</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-black rounded"
              />
              <span className="font-semibold text-neutral-800">Featured On Homepage</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-black font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl shadow-md"
            >
              {productToEdit ? 'Save Changes' : 'Publish Product to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
