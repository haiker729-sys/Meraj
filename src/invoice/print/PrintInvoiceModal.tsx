import React from 'react';
import { Order } from '../../types';
import { TaxInvoiceTemplate } from '../templates/TaxInvoiceTemplate';
import { Printer, X, Download } from 'lucide-react';

interface PrintInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
              FP
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                Official Retail Tax Invoice
                <span className="text-xs font-mono font-normal bg-neutral-200 px-2 py-0.5 rounded text-neutral-800">
                  {order.id}
                </span>
              </h2>
              <p className="text-xs text-neutral-500">GST Compliant Tax Invoice & Proof of Purchase</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-neutral-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body Canvas */}
        <div className="p-6 bg-neutral-100 overflow-y-auto max-h-[75vh]">
          <TaxInvoiceTemplate order={order} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 bg-white print:hidden text-xs text-neutral-500">
          <span>This invoice is digitally signed and valid under the GST Act.</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-black text-white font-bold rounded-lg hover:bg-neutral-800"
            >
              <Download className="w-4 h-4" />
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
