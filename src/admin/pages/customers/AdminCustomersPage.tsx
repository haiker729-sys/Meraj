import React, { useState, useEffect } from 'react';
import { Order } from '../../../types';
import { apiClient } from '../../../api/client';
import { Search, User, Phone, MapPin, Package } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        const res = await apiClient.orders.list({ limit: 200 });
        if (res?.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      }
    };
    fetchCustomerOrders();
  }, []);

  // Group by customer mobile
  const customerMap = new Map<string, {
    fullName: string;
    mobile: string;
    email?: string;
    city: string;
    state: string;
    orderCount: number;
    totalSpend: number;
    lastOrderDate: string;
  }>();

  orders.forEach((o) => {
    const key = o.customer.mobileNumber;
    const existing = customerMap.get(key);
    if (!existing) {
      customerMap.set(key, {
        fullName: o.customer.fullName,
        mobile: o.customer.mobileNumber,
        email: o.customer.email,
        city: o.shippingAddress.city,
        state: o.shippingAddress.state,
        orderCount: 1,
        totalSpend: o.totalAmount,
        lastOrderDate: o.createdAt
      });
    } else {
      existing.orderCount += 1;
      existing.totalSpend += o.totalAmount;
    }
  });

  const customersList = Array.from(customerMap.values()).filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer by name, mobile, city..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
          />
        </div>

        <span className="text-xs text-neutral-500">
          Total Registered Buyers: <strong className="font-mono text-black">{customersList.length}</strong>
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Mobile Contact</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Lifetime Value (LTV)</th>
                <th className="p-3.5">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {customersList.map((cust) => (
                <tr key={cust.mobile} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-neutral-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 font-mono text-[10px]">
                      {cust.fullName.charAt(0)}
                    </div>
                    <span>{cust.fullName}</span>
                  </td>
                  <td className="p-3.5 font-mono text-neutral-600">+91 {cust.mobile}</td>
                  <td className="p-3.5 text-neutral-700">
                    {cust.city}, {cust.state}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-neutral-900">
                    {cust.orderCount} {cust.orderCount === 1 ? 'order' : 'orders'}
                  </td>
                  <td className="p-3.5 font-mono font-black text-black">
                    ₹{cust.totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-neutral-500 text-[11px]">
                    {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
