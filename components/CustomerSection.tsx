
import React, { useState } from 'react';
import { Customer, CustomerType, PotentialLevel } from '../types';
import { UserPlus, Search, Edit2, Trash2, Mail, Phone, Briefcase, MapPin } from 'lucide-react';

interface CustomerSectionProps {
  customers: Customer[];
  onAdd: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onUpdate: (customer: Customer) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({ customers, onAdd, onDelete, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    company: '',
    type: 'เอกชน',
    category: '',
    address: '',
    name: '',
    position: '',
    phone: '',
    email: '',
    potential: 'กลาง',
    note: ''
  });

  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.name || !formData.phone) return;
    
    const newCustomer: Customer = {
      ...(formData as Omit<Customer, 'id' | 'created'>),
      id: `CUST-${Date.now()}`,
      created: new Date().toISOString()
    } as Customer;

    onAdd(newCustomer);
    setFormData({ company: '', type: 'เอกชน', category: '', address: '', name: '', position: '', phone: '', email: '', potential: 'กลาง', note: '' });
  };

  const filteredCustomers = customers.filter(c => 
    c.company.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn flex flex-col">
      {/* 1. Customer List (Now on Top) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden order-1">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Briefcase size={24} />
            </div>
            <h2 className="text-xl font-bold">รายชื่อลูกค้า ({customers.length})</h2>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหรือบริษัท..."
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">บริษัท / ผู้ติดต่อ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ประเภท</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">การติดต่อ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{customer.company}</div>
                    <div className="text-sm text-slate-500">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      customer.type === 'ราชการ' ? 'bg-indigo-100 text-indigo-700' :
                      customer.type === 'รัฐวิสาหกิจ' ? 'bg-cyan-100 text-cyan-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" /> {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" /> {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(customer.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={48} className="opacity-20" />
                      <p>ไม่พบข้อมูลลูกค้า</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Add New Customer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden order-2">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">เพิ่มลูกค้าใหม่</h2>
            <p className="text-sm text-slate-500">กรอกข้อมูลผู้ติดต่อและบริษัทเพื่อเริ่มการเสนอราคา</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">ชื่อองค์กร <span className="text-red-500">*</span></label>
              <input 
                value={formData.company} 
                onChange={e => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                placeholder="ชื่อบริษัท/หน่วยงาน"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">ประเภทองค์กร</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as CustomerType})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
              >
                <option value="เอกชน">เอกชน</option>
                <option value="ราชการ">ราชการ</option>
                <option value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">หมวดหมู่ธุรกิจ</label>
              <input 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                placeholder="เช่น อาหาร, ก่อสร้าง"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" /> ที่อยู่หน่วยงาน
            </label>
            <textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100 h-20 resize-none"
              placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">ชื่อผู้ติดต่อ <span className="text-red-500">*</span></label>
              <input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                placeholder="คุณ..."
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
              <input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                placeholder="0xx-xxxxxxx"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">อีเมล</label>
              <input 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-100"
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
              <UserPlus size={20} /> บันทึกข้อมูลลูกค้า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerSection;
