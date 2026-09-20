import React, { useState, useEffect } from 'react';
import { Order } from '../../../types';
import { apiClient } from '../../../api/client';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';
import { FileText, Printer, Search, IndianRupee, Download } from 'lucide-react';

export const AdminInvoicesPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await apiClient.orders.list({ limit: 100 });
        if (res?.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to load invoice orders:', err);
      }
    };
    fetchInvoices();
  }, []);

  const totalGrossInvoiced = orders.reduce((sum, o) => sum + (o.totalAmount ?? o.pricing?.grandTotal ?? 0), 0);
  const totalGstCollected = orders.reduce((sum, o) => sum + (o.taxBreakdown?.totalGst || 0), 0);

  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (o.invoiceNumber || '').toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.mobileNumber.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* GST Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Gross B2C Turnover
          </span>
          <span className="text-xl font-mono font-black text-neutral-900 mt-1 block">
            ₹{totalGrossInvoiced.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-neutral-400">Total invoiced value</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            GST Output Tax (5% Apparel)
          </span>
          <span className="text-xl font-mono font-black text-emerald-800 mt-1 block">
            ₹{Math.round(totalGstCollected).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-700">CGST + SGST collected</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Active Store GSTIN
          </span>
          <span className="text-sm font-mono font-black text-neutral-900 mt-2 block">
            23AAAAF8899A1Z2
          </span>
          <span className="text-[10px] text-neutral-400">HSN: 6205 (Cotton Apparels)</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Invoice #, Order ID, customer..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
            />
          </div>

          <span className="text-xs text-neutral-500">
            Total Generated: <strong className="font-mono text-black">{filteredOrders.length}</strong> tax invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Invoice Number</th>
                <th className="p-3.5">Order ID & Date</th>
                <th className="p-3.5">Billed Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Taxable Base</th>
                <th className="p-3.5">GST (5%)</th>
                <th className="p-3.5">Invoice Total</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-neutral-900">
                    {order.invoiceNumber}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-neutral-700 block">{order.id}</span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-neutral-900 block">{order.customer.fullName}</span>
                    <span className="font-mono text-[10px] text-neutral-500">+91 {order.customer.mobileNumber}</span>
                  </td>
                  <td className="p-3.5 text-neutral-600">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items
                  </td>
                  <td className="p-3.5 font-mono text-neutral-700">
                    ₹{order.taxBreakdown?.taxableAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 font-mono text-neutral-700">
                    ₹{order.taxBreakdown?.totalGst.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 font-mono font-black text-black">
                    ₹{(order.totalAmount ?? order.pricing?.grandTotal ?? 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <PrintInvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </div>
  );
};
