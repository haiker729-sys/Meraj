import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { CategoryType } from '../../../types';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryType;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  category = 'Men'
}) => {
  const [activeTab, setActiveTab] = useState<CategoryType>(category);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-neutral-900" />
            <h3 className="text-base font-bold text-neutral-900">Standard Size Guide</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs & Unit Switcher */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {(['Men', 'Women', 'Kids'] as CategoryType[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === cat
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs font-medium bg-neutral-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={`px-2 py-0.5 rounded ${unit === 'inches' ? 'bg-white shadow-2xs font-bold text-black' : 'text-neutral-500'}`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-2 py-0.5 rounded ${unit === 'cm' ? 'bg-white shadow-2xs font-bold text-black' : 'text-neutral-500'}`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Chart Table */}
        <div className="mt-4 overflow-x-auto">
          {activeTab === 'Men' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 font-bold border-b border-neutral-200">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Chest ({unit})</th>
                  <th className="p-2.5">Waist ({unit})</th>
                  <th className="p-2.5">Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="p-2.5 font-bold">S (Small)</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '38"' : '96 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '30"' : '76 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '27"' : '68 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">M (Medium)</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '40"' : '101 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '32"' : '81 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '28"' : '71 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">L (Large)</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '42"' : '106 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '34"' : '86 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '29"' : '73 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">XL</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '44"' : '112 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '36"' : '91 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '30"' : '76 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">XXL</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '46"' : '117 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '38"' : '96 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '31"' : '78 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'Women' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 font-bold border-b border-neutral-200">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Bust ({unit})</th>
                  <th className="p-2.5">Waist ({unit})</th>
                  <th className="p-2.5">Hips ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="p-2.5 font-bold">XS</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '32"' : '81 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '25"' : '63 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '35"' : '89 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">S</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '34"' : '86 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '27"' : '68 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '37"' : '94 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">M</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '36"' : '91 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '29"' : '73 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '39"' : '99 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">L</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '38"' : '96 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '31"' : '78 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '41"' : '104 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">XL</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '41"' : '104 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '34"' : '86 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '44"' : '111 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'Kids' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 font-bold border-b border-neutral-200">
                  <th className="p-2.5">Age Group</th>
                  <th className="p-2.5">Height ({unit})</th>
                  <th className="p-2.5">Chest ({unit})</th>
                  <th className="p-2.5">Waist ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="p-2.5 font-bold">2 - 3 Years</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '36 - 38"' : '92 - 98 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '21"' : '54 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '20"' : '51 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">4 - 5 Years</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '40 - 43"' : '104 - 110 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '23"' : '58 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '21.5"' : '55 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">6 - 7 Years</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '45 - 48"' : '116 - 122 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '25"' : '63 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '23"' : '58 cm'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">8 - 9 Years</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '50 - 53"' : '128 - 134 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '27"' : '68 cm'}</td>
                  <td className="p-2.5 font-mono">{unit === 'inches' ? '24.5"' : '62 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        <p className="text-[11px] text-neutral-500 mt-4 italic">
          *Measurements refer to body size, not garment dimensions. If in between sizes, order the larger size for a relaxed fit.
        </p>

        <div className="mt-5 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
