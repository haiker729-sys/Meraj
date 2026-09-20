import React, { useState } from 'react';
import { Order } from '../../types';
import { ThermalShippingLabel } from '../templates/ThermalShippingLabel';
import { Printer, X, CheckCircle2, Copy } from 'lucide-react';

interface PrintLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({ order, isOpen, onClose }) => {
  const [labelFormat, setLabelFormat] = useState<'4x6' | 'a4'>('4x6');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyAWB = () => {
    navigator.clipboard?.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Container - hide during print so only the label prints */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
              FP
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                Shipping Label Preview
                <span className="text-xs font-mono font-normal bg-neutral-200 px-2 py-0.5 rounded text-neutral-800">
                  {order.id}
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Ready for thermal sticker or standard A4 printer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Toggle */}
            <div className="flex bg-neutral-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setLabelFormat('4x6')}
                className={`px-3 py-1 rounded-md transition-all ${
                  labelFormat === '4x6' ? 'bg-white text-black shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
                }`}
              >
                4 x 6" Thermal
              </button>
              <button
                type="button"
                onClick={() => setLabelFormat('a4')}
                className={`px-3 py-1 rounded-md transition-all ${
                  labelFormat === 'a4' ? 'bg-white text-black shadow-xs font-bold' : 'text-neutral-600 hover:text-black'
                }`}
              >
                A4 Sheet
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-neutral-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Label Canvas */}
        <div className="p-6 bg-neutral-100 flex flex-col items-center justify-center overflow-y-auto max-h-[70vh]">
          <div className="bg-white shadow-md p-2 rounded-sm border border-neutral-300">
            <div id="printable-shipping-label">
              <ThermalShippingLabel order={order} format={labelFormat} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-neutral-600 print:hidden">
            <span className="flex items-center gap-1">
              Order ID: <strong className="font-mono text-black">{order.id}</strong>
              <button
                type="button"
                onClick={handleCopyAWB}
                className="ml-1 text-neutral-500 hover:text-black"
                title="Copy Order ID"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>
            <span>•</span>
            <span>Customer: <strong>{order.customer.fullName}</strong></span>
            <span>•</span>
            <span>PIN: <strong>{order.shippingAddress.pinCode}</strong></span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-200 bg-white print:hidden">
          <div className="text-xs text-neutral-500">
            {labelFormat === '4x6' ? (
              <span>Tip: Set printer paper size to <strong>4 x 6 in (100 x 150mm)</strong> with 0 margins.</span>
            ) : (
              <span>Tip: Select <strong>A4 Portrait</strong>, cut along the outer line.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Shipping Label
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
