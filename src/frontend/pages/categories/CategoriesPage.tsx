import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CategoriesPageProps {
  onNavigate: (path: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const categories = [
    {
      name: 'Men',
      tagline: 'Refined Casuals & Everyday Comfort',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      subCategories: [
        { name: 'Shirts', count: '14 styles', filter: 'Shirts' },
        { name: 'T-Shirts & Polos', count: '18 styles', filter: 'T-Shirts' },
        { name: 'Jeans & Denim', count: '12 styles', filter: 'Jeans' },
        { name: 'Trousers & Chinos', count: '8 styles', filter: 'Trousers' }
      ]
    },
    {
      name: 'Women',
      tagline: 'Timeless Elegance & Contemporary Silhouettes',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      subCategories: [
        { name: 'Kurtas & Suits', count: '24 styles', filter: 'Kurtas' },
        { name: 'Floral Dresses', count: '16 styles', filter: 'Dresses' },
        { name: 'Tops & Tunics', count: '19 styles', filter: 'Tops' },
        { name: 'High-Rise Denim', count: '10 styles', filter: 'Jeans' }
      ]
    },
    {
      name: 'Kids',
      tagline: 'Playful, Soft & Bio-Washed Apparel',
      image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      subCategories: [
        { name: 'Cotton Sets', count: '15 styles', filter: 'Sets' },
        { name: 'Dungarees & Overalls', count: '9 styles', filter: 'Dungarees' },
        { name: 'Graphic Tees', count: '22 styles', filter: 'T-Shirts' },
        { name: 'Party Wear', count: '8 styles', filter: 'Ethnic' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500">
            Explore The Wardrobe
          </p>
          <h1 className="text-2xl sm:text-4xl font-black font-serif text-neutral-950 mt-1">
            Collections & Categories
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Select your preferred department to shop high quality garments designed for all occasions.
          </p>
        </div>

        <div className="space-y-10">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Image banner for category */}
              <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-[300px]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-300">
                    Collection
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-serif mt-0.5">{cat.name}'s Wear</h2>
                  <p className="text-xs text-neutral-300 mt-1">{cat.tagline}</p>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/products?category=${cat.name}`)}
                    className="mt-4 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg inline-flex items-center gap-1.5 hover:bg-neutral-100"
                  >
                    <span>View All {cat.name}'s Wear</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subcategories list */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
                  Shop By Category
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.subCategories.map((sub) => (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() =>
                        onNavigate(`/products?category=${cat.name}&subCategory=${sub.filter}`)
                      }
                      className="p-4 rounded-xl border border-neutral-200 hover:border-black bg-neutral-50/50 hover:bg-white text-left transition-all group flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900 group-hover:text-black">
                          {sub.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">
                          {sub.count}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
