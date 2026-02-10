
import React, { useState, useMemo } from 'react';
import { Product, ProductType } from '../types';
import { Box, Plus, Trash2, Edit2, Satellite, Globe, Factory, X } from 'lucide-react';

interface ProductSectionProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({ products, onAdd, onDelete }) => {
  const [activeType, setActiveType] = useState<ProductType>('onAir');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    promotion: 'ไม่มี',
    promotionDetail: '',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const newProduct: Product = {
      ...(formData as Omit<Product, 'id' | 'created' | 'type'>),
      id: `${activeType.toUpperCase().substring(0, 2)}-${Date.now()}`,
      type: activeType,
      created: new Date().toISOString()
    } as Product;

    onAdd(newProduct);
    setFormData({ name: '', price: 0, promotion: 'ไม่มี', promotionDetail: '', note: '' });
    setShowForm(false);
  };

  const currentProducts = products.filter(p => p.type === activeType);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Type Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          {[
            { id: 'onAir', label: 'On Air', icon: <Satellite size={18} />, color: 'blue' },
            { id: 'online', label: 'Online', icon: <Globe size={18} />, color: 'emerald' },
            { id: 'production', label: 'Production', icon: <Factory size={18} />, color: 'amber' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as ProductType)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all border ${
                activeType === tab.id 
                  ? `bg-${tab.color}-600 border-${tab.color}-600 text-white shadow-md` 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
          >
            <Plus size={20} /> เพิ่มรายการใหม่
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 ${showForm ? 'xl:grid-cols-2' : 'xl:grid-cols-1'} gap-8 transition-all duration-300`}>
        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <Plus className="text-slate-600" size={24} />
                <h2 className="text-xl font-bold">เพิ่มรายการใหม่ ({activeType})</h2>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">ชื่อผลิตภัณฑ์ / บริการ <span className="text-red-500">*</span></label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                  placeholder="ระบุชื่อรายการ..."
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">ราคาต่อหน่วย (บาท) <span className="text-red-500">*</span></label>
                  <input 
                    type="number"
                    value={formData.price || ''} 
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">โปรโมชั่น</label>
                  <select 
                    value={formData.promotion}
                    onChange={e => setFormData({...formData, promotion: e.target.value as 'ไม่มี' | 'มี'})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                  >
                    <option value="ไม่มี">ไม่มี</option>
                    <option value="มี">มีโปรโมชั่นพิเศษ</option>
                  </select>
                </div>
              </div>
              {formData.promotion === 'มี' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">รายละเอียดโปรโมชั่น</label>
                  <input 
                    value={formData.promotionDetail} 
                    onChange={e => setFormData({...formData, promotionDetail: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                    placeholder="เช่น ซื้อ 10 แถม 1"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">หมายเหตุ</label>
                <textarea 
                  value={formData.note} 
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none bg-slate-100"
                  placeholder="หมายเหตุเพิ่มเติมสำหรับภายใน..."
                ></textarea>
              </div>
              {/* Lightened button color from bg-slate-900 to bg-slate-500 */}
              <button type="submit" className="w-full bg-slate-500 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                <Plus size={20} /> บันทึกผลิตภัณฑ์
              </button>
            </form>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            <Box className="text-slate-600" size={24} />
            <h2 className="text-xl font-bold">รายการสินค้าทั้งหมด ({currentProducts.length})</h2>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">รหัส / รายการ</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ราคา</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">โปรโมชั่น</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-mono font-bold text-blue-600">{product.id}</div>
                      <div className="font-bold text-slate-800">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {product.promotion === 'มี' ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                          {product.promotionDetail || 'YES'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">NO</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(product.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">ไม่มีข้อมูลผลิตภัณฑ์ในหมวดนี้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
