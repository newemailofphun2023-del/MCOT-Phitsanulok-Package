
import React, { useState, useEffect, useMemo } from 'react';
import { Customer, Product, Package, OrderItem, CustomerType } from '../types';
import { TIME_SLOTS, WEEKDAYS } from '../constants';
import { Calculator, Plus, Trash2, Calendar, Tag, CreditCard, Clock, Building2 } from 'lucide-react';

interface OrderSectionProps {
  customers: Customer[];
  products: Product[];
  packages: Package[];
  orders: OrderItem[];
  onAddOrder: (order: OrderItem) => void;
  onDeleteOrder: (id: string) => void;
}

const OrderSection: React.FC<OrderSectionProps> = ({ customers, products, packages, orders, onAddOrder, onDeleteOrder }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderType, setOrderType] = useState<'Produce' | 'Package' | 'Production'>('Produce');
  const [selectedItemId, setSelectedItemId] = useState('');
  
  // Duration Logic
  const [durationMode, setDurationMode] = useState<'date' | 'days' | 'months'>('date');
  const [durationValue, setDurationValue] = useState<number>(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [paymentType, setPaymentType] = useState<'หลังออกอากาศ' | 'ก่อนออกอากาศ'>('หลังออกอากาศ');
  const [note, setNote] = useState('');

  const selectedCustomer = useMemo(() => customers.find(c => c.id === selectedCustomerId), [customers, selectedCustomerId]);
  
  // Calculate End Date based on duration mode
  useEffect(() => {
    if (!startDate) return;
    const start = new Date(startDate);
    
    if (durationMode === 'days') {
      const end = new Date(start);
      end.setDate(start.getDate() + (durationValue - 1));
      setEndDate(end.toISOString().split('T')[0]);
    } else if (durationMode === 'months') {
      const end = new Date(start);
      end.setMonth(start.getMonth() + durationValue);
      end.setDate(end.getDate() - 1);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [startDate, durationMode, durationValue]);

  const allAvailableSlots = useMemo(() => TIME_SLOTS.flatMap(p => p.slots), []);

  const availableItems = useMemo(() => {
    if (orderType === 'Produce') return products.filter(p => p.type !== 'production');
    if (orderType === 'Package') return packages;
    return products.filter(p => p.type === 'production');
  }, [orderType, products, packages]);

  const selectedItem = useMemo(() => {
    if (orderType === 'Package') return packages.find(p => p.id === selectedItemId);
    return products.find(p => p.id === selectedItemId);
  }, [orderType, selectedItemId, packages, products]);

  // Pricing Calculation Helper
  const calculateResult = useMemo(() => {
    if (!selectedItem || !startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return null;

    let totalDays = 0;
    const current = new Date(start);
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        totalDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const unitPrice = (selectedItem as any).price || (selectedItem as any).totalPrice || 0;
    const timesPerDay = selectedSlots.length || 1; 
    const baseTotal = unitPrice * timesPerDay * totalDays;

    // Discount Logic automatically determined by selected customer type
    let conditionDiscountPercent = 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalMonths = diffDays / 30;

    const activeType = selectedCustomer?.type || 'เอกชน';

    if (activeType === 'ราชการ') {
      conditionDiscountPercent = 40;
    } else {
      // Private or State Enterprise follow duration rules
      if (totalMonths >= 6) conditionDiscountPercent = 30;
      else if (totalMonths >= 3) conditionDiscountPercent = 25;
      else if (totalMonths >= 2) conditionDiscountPercent = 20;
    }

    const paymentDiscountPercent = paymentType === 'ก่อนออกอากาศ' ? 5 : 0;
    
    const conditionDiscountAmount = baseTotal * (conditionDiscountPercent / 100);
    const paymentDiscountAmount = (baseTotal - conditionDiscountAmount) * (paymentDiscountPercent / 100);
    const totalDiscountAmount = conditionDiscountAmount + paymentDiscountAmount;
    
    const priceAfterDiscount = baseTotal - totalDiscountAmount;
    const vatAmount = priceAfterDiscount * 0.07;
    const netTotal = priceAfterDiscount + vatAmount;

    return {
      totalDays,
      timesPerDay,
      baseTotal,
      conditionDiscountPercent,
      paymentDiscountPercent,
      totalDiscountAmount,
      priceAfterDiscount,
      vatAmount,
      netTotal,
      totalMonths
    };
  }, [selectedItem, startDate, endDate, selectedDays, selectedSlots, selectedCustomer, paymentType]);

  const handleAddOrder = () => {
    if (!selectedCustomerId || !selectedItem || !calculateResult) return;

    const newOrder: OrderItem = {
      id: `ORD-${Date.now()}`,
      customerId: selectedCustomerId,
      productType: orderType,
      productId: selectedItem.id,
      productName: selectedItem.name,
      unitPrice: (selectedItem as any).price || (selectedItem as any).totalPrice || 0,
      timeSlots: selectedSlots,
      startDate,
      endDate,
      daysOfWeek: selectedDays,
      timesPerDay: calculateResult.timesPerDay,
      totalDays: calculateResult.totalDays,
      totalPrice: calculateResult.baseTotal,
      conditionDiscountPercent: calculateResult.conditionDiscountPercent,
      paymentDiscountPercent: calculateResult.paymentDiscountPercent,
      totalDiscountAmount: calculateResult.totalDiscountAmount,
      priceAfterDiscount: calculateResult.priceAfterDiscount,
      vatAmount: calculateResult.vatAmount,
      netTotal: calculateResult.netTotal,
      paymentType,
      note,
      created: new Date().toISOString()
    };

    onAddOrder(newOrder);
    setSelectedItemId('');
    setSelectedSlots([]);
    setNote('');
  };

  const totalCampaign = useMemo(() => {
    return orders.reduce((acc, curr) => ({
      base: acc.base + curr.totalPrice,
      discount: acc.discount + curr.totalDiscountAmount,
      net: acc.net + curr.netTotal
    }), { base: 0, discount: 0, net: 0 });
  }, [orders]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <Plus className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold">สร้างรายการสั่งซื้อใหม่</h2>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Customer Selection Only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">เลือกลูกค้า</label>
                  <select 
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100 transition-all"
                  >
                    <option value="">-- เลือกลูกค้า --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Building2 size={18} className="text-blue-500" />
                    <div>
                      <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">ประเภทองค์กรอัตโนมัติ</p>
                      <p className="text-sm font-bold text-blue-900">{selectedCustomer ? selectedCustomer.type : 'โปรดเลือกลูกค้า'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Type & Item */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">ประเภทรายการ</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                    {(['Produce', 'Package', 'Production'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => { setOrderType(type); setSelectedItemId(''); }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          orderType === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">สินค้า / บริการ</label>
                  <select 
                    value={selectedItemId}
                    onChange={e => setSelectedItemId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100 transition-all"
                  >
                    <option value="">-- เลือกรายการ --</option>
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({(item as any).price || (item as any).totalPrice} ฿)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" /> ช่วงเวลาออกอากาศ
                  </label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    เลือกแล้ว: {selectedSlots.length} ครั้ง/วัน
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {allAvailableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot])}
                      className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all ${
                        selectedSlots.includes(slot) 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" /> ระยะเวลาออกอากาศ
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                    {[
                      { id: 'date', label: 'ระบุวันที่' },
                      { id: 'days', label: 'ระบุวัน' },
                      { id: 'months', label: 'ระบุเดือน' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setDurationMode(mode.id as any)}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                          durationMode === mode.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">วันเริ่ม</span>
                        <input 
                          type="date" 
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100" 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">วันสิ้นสุด</span>
                        <input 
                          type="date" 
                          value={endDate}
                          disabled={durationMode !== 'date'}
                          onChange={e => setEndDate(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${durationMode === 'date' ? 'bg-slate-100' : 'bg-slate-50 opacity-70 cursor-not-allowed'}`} 
                        />
                      </div>
                    </div>
                    
                    {durationMode !== 'date' && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          จำนวน {durationMode === 'days' ? 'วัน' : 'เดือน'}
                        </span>
                        <input 
                          type="number" 
                          min="1"
                          value={durationValue}
                          onChange={e => setDurationValue(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">วันออกอากาศในสัปดาห์</label>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map(day => (
                        <button
                          key={day.value}
                          onClick={() => setSelectedDays(prev => prev.includes(day.value) ? prev.filter(d => d !== day.value) : [...prev, day.value])}
                          className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all border ${
                            selectedDays.includes(day.value) 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">การชำระเงิน</label>
                    <select 
                      value={paymentType}
                      onChange={e => setPaymentType(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100 transition-all"
                    >
                      <option value="หลังออกอากาศ">ชำระหลังออกอากาศ</option>
                      <option value="ก่อนออกอากาศ">ชำระก่อนออกอากาศ (ลดเพิ่ม 5%)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">หมายเหตุ/ข้อความแถม</label>
                <textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-100"
                  placeholder="ระบุข้อความแถม..."
                  rows={2}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Summary Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <Calculator className="text-emerald-600" size={24} />
              <h2 className="text-xl font-bold">สรุปการคำนวณ</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {calculateResult ? (
                <>
                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">จำนวนวันออกอากาศ:</span>
                      <span className="font-bold">{calculateResult.totalDays} วัน</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">จำนวนครั้งต่อวัน:</span>
                      <span className="font-bold text-blue-600">{calculateResult.timesPerDay} ครั้ง</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ระยะเวลาแคมเปญ:</span>
                      <span className="font-bold text-slate-900">{calculateResult.totalMonths.toFixed(1)} เดือน</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ราคาก่อนหักส่วนลด:</span>
                      <span className="font-bold">{calculateResult.baseTotal.toLocaleString()} ฿</span>
                    </div>
                  </div>

                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span className="flex items-center gap-1 font-bold">
                        <Tag size={12} /> ส่วนลดเงื่อนไข ({calculateResult.conditionDiscountPercent}%):
                      </span>
                      <span className="font-bold">- {(calculateResult.baseTotal * calculateResult.conditionDiscountPercent / 100).toLocaleString()} ฿</span>
                    </div>
                    {calculateResult.paymentDiscountPercent > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span className="flex items-center gap-1 font-bold">
                          <CreditCard size={12} /> ส่วนลดจ่ายล่วงหน้า ({calculateResult.paymentDiscountPercent}%):
                        </span>
                        <span className="font-bold">- {((calculateResult.baseTotal - (calculateResult.baseTotal * calculateResult.conditionDiscountPercent / 100)) * calculateResult.paymentDiscountPercent / 100).toLocaleString()} ฿</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ราคาหลังส่วนลด:</span>
                      <span className="font-bold text-slate-900">{calculateResult.priceAfterDiscount.toLocaleString()} ฿</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">VAT (7%):</span>
                      <span className="font-bold text-slate-900">{calculateResult.vatAmount.toLocaleString()} ฿</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-blue-900">ยอดสุทธิ:</span>
                      <span className="text-2xl font-black text-blue-600">{calculateResult.netTotal.toLocaleString()} ฿</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleAddOrder}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> เพิ่มรายการเข้าแคมเปญ
                  </button>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-3 text-center">
                  <Calculator size={48} className="opacity-20" />
                  <p className="text-xs">ระบุข้อมูลลูกค้า วันออกอากาศ<br/>และเลือกสินค้าเพื่อคำนวณราคา</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-xl border-l-4 border-yellow-500">
            <h3 className="text-xs font-bold opacity-70 uppercase tracking-widest mb-4">ยอดรวมแคมเปญปัจจุบัน</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>ราคารวมทั้งหมด:</span>
                <span className="font-mono">{totalCampaign.base.toLocaleString()} ฿</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-400">
                <span>ส่วนลดรวมสะสม:</span>
                <span className="font-mono">- {totalCampaign.discount.toLocaleString()} ฿</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="font-bold text-lg">สุทธิทั้งสิ้น:</span>
                <span className="text-2xl font-black">{totalCampaign.net.toLocaleString()} ฿</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold">รายการสั่งซื้อในแคมเปญ ({orders.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">สินค้า / บริการ</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-center">จำนวนวัน</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-center">ความถี่</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right">ส่วนลด</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right font-black">ยอดสุทธิ</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{order.productName}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(order.startDate).toLocaleDateString('th-TH')} - {new Date(order.endDate).toLocaleDateString('th-TH')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">{order.totalDays} วัน</td>
                  <td className="px-6 py-4 text-center font-medium">{order.timesPerDay} ครั้ง/วัน</td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-bold">- {order.totalDiscountAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-blue-600">{order.netTotal.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">ยังไม่มีรายการสั่งซื้อในแคมเปญนี้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderSection;
