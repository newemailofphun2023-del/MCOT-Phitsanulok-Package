
import React, { useState, useMemo } from 'react';
import { Product, Package, ProductType } from '../types';
import { Package as PackageIcon, Plus, Trash2, X, CheckCircle2, ChevronRight, Satellite, Globe, Factory } from 'lucide-react';

interface PackageSectionProps {
  products: Product[];
  packages: Package[];
  onAdd: (pkg: Package) => void;
  onDelete: (id: string) => void;
}

const PackageSection: React.FC<PackageSectionProps> = ({ products, packages, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    selectedProductIds: [] as string[],
    note: ''
  });

  const selectedProducts = useMemo(() => 
    products.filter(p => formData.selectedProductIds.includes(p.id)),
    [products, formData.selectedProductIds]
  );

  const totalPrice = useMemo(() => 
    selectedProducts.reduce((sum, p) => sum + p.price, 0),
    [selectedProducts]
  );

  const groupedProducts = useMemo(() => {
    const groups: Record<ProductType, Product[]> = {
      onAir: [],
      online: [],
      production: []
    };
    products.forEach(p => {
      groups[p.type].push(p);
    });
    return groups;
  }, [products]);

  const toggleProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.includes(id)
        ? prev.selectedProductIds.filter(pid => pid !== id)
        : [...prev.selectedProductIds, id]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.selectedProductIds.length === 0) return;

    const newPackage: Package = {
      id: `PKG-${Date.now()}`,
      name: formData.name,
      products: selectedProducts,
      totalPrice: totalPrice,
      note: formData.note,
      created: new Date().toISOString()
    };

    onAdd(newPackage);
    setFormData({ name: '', selectedProductIds: [], note: '' });
    setShowForm(false);
  };

  const categoryInfo: Record<ProductType, { label: string, icon: React.ReactNode, color: string }> = {
    onAir: { label: 'On Air', icon: <Satellite size={14} />, color: 'blue' },
    online: { label: 'Online', icon: <Globe size={14} />, color: 'emerald' },
    production: { label: 'Production', icon: <Factory size={14} />, color: 'amber' }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการแพ็กเกจ</h2>
          <p className="text-sm text-slate-500">รวมสินค้าหลายรายการเป็นแพ็กเกจเดียวเพื่อความสะดวกในการเสนอราคา</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
          >
            <Plus size={20} /> สร้างแพ็กเกจใหม่
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 ${showForm ? 'xl:grid-cols-2' : 'xl:grid-cols-1'} gap-8 transition-all`}>
        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <PackageIcon className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold">สร้างแพ็กเกจใหม่</h2>
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
                <label className="text-sm font-semibold text-slate-700">ชื่อแพ็กเกจ <span className="text-red-500">*</span></label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                  placeholder="เช่น แพ็กเกจสุดคุ้ม A"
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700">เลือกสินค้าเข้าแพ็กเกจ ({formData.selectedProductIds.length} รายการ)</label>
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                  {(Object.keys(groupedProducts) as ProductType[]).map(type => (
                    <div key={type} className="space-y-3">
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-${categoryInfo[type].color}-600 border-b border-slate-100 pb-2`}>
                        {categoryInfo[type].icon}
                        {categoryInfo[type].label}
                        <span className="ml-auto text-slate-300 font-normal">({groupedProducts[type].length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {groupedProducts[type].map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => toggleProduct(product.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                              formData.selectedProductIds.includes(product.id)
                                ? `bg-${categoryInfo[type].color}-50 border-${categoryInfo[type].color}-500 ring-1 ring-${categoryInfo[type].color}-500`
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className={`mt-0.5 rounded-full ${formData.selectedProductIds.includes(product.id) ? `text-${categoryInfo[type].color}-600` : 'text-slate-200'}`}>
                              <CheckCircle2 size={18} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{product.price.toLocaleString()} ฿</div>
                            </div>
                          </button>
                        ))}
                        {groupedProducts[type].length === 0 && (
                          <p className="col-span-full text-center py-4 text-[10px] text-slate-400 italic">ไม่มีสินค้าในหมวดหมู่นี้</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">หมายเหตุ</label>
                <textarea 
                  value={formData.note} 
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-20 resize-none bg-slate-100"
                  placeholder="รายละเอียดเพิ่มเติมสำหรับแพ็กเกจนี้..."
                ></textarea>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl text-white flex justify-between items-center shadow-xl">
                <div>
                  <div className="text-[10px] opacity-60 uppercase font-bold tracking-widest">ยอดรวมราคาทั้งหมด</div>
                  <div className="text-xl font-black">{totalPrice.toLocaleString()} ฿</div>
                </div>
                <button 
                  type="submit" 
                  disabled={formData.selectedProductIds.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
                >
                  บันทึกแพ็กเกจ
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                      <PackageIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{pkg.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDelete(pkg.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">สินค้าภายใน</p>
                    <div className="space-y-1.5">
                      {pkg.products.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                          <span className="text-slate-600 flex items-center gap-1">
                            <ChevronRight size={10} className="text-slate-300" /> {p.name}
                            <span className={`text-[8px] font-black uppercase ml-1 opacity-40 text-${categoryInfo[p.type].color}-600`}>[{p.type}]</span>
                          </span>
                          <span className="font-mono text-slate-400">{p.price.toLocaleString()} ฿</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {pkg.note && (
                    <div className="p-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 italic">
                      {pkg.note}
                    </div>
                  )}
                  <div className="pt-2 flex justify-between items-end border-t border-slate-100">
                    <div className="text-[10px] text-slate-400">สร้างเมื่อ: {new Date(pkg.created).toLocaleDateString()}</div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-blue-600 uppercase">ราคาแพ็กเกจ</div>
                      <div className="text-xl font-black text-slate-900">{pkg.totalPrice.toLocaleString()} ฿</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {packages.length === 0 && (
              <div className={`col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 ${showForm ? 'hidden xl:flex' : ''}`}>
                <PackageIcon size={48} className="opacity-10 mb-4" />
                <p className="text-sm">ยังไม่มีการสร้างแพ็กเกจ</p>
                <p className="text-xs">คลิกที่ปุ่มด้านบนเพื่อเริ่มรวมสินค้าเป็นแพ็กเกจ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSection;
