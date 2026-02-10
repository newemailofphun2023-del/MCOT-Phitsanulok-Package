
import React, { useRef } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Save, 
  Download, 
  Trash2,
  Radio,
  Box,
  Upload
} from 'lucide-react';
import { MCOT_BLUE_GRADIENT } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orderCount: number;
  onSave: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  orderCount,
  onSave,
  onExport,
  onImport,
  onClear
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'customers', label: 'ลูกค้า', icon: <Users size={20} /> },
    { id: 'products', label: 'สินค้า', icon: <Box size={20} /> },
    { id: 'packages', label: 'แพ็กเกจ', icon: <Package size={20} /> },
    { id: 'orders', label: 'รายการสั่งซื้อ', icon: <ShoppingCart size={20} />, badge: orderCount },
    { id: 'quotations', label: 'ใบเสนอราคา', icon: <FileText size={20} /> },
  ];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <aside className={`w-64 flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 text-white z-50 no-print ${MCOT_BLUE_GRADIENT} border-r-4 border-[#f9a826]`}>
      <div className="p-6 flex flex-col items-center border-b border-white/10">
        <div className="bg-white p-3 rounded-2xl mb-4 shadow-xl">
          <Radio size={40} className="text-[#1c5bb8]" />
        </div>
        <h1 className="text-lg font-bold text-center leading-tight">MCOT Package</h1>
        <p className="text-xs opacity-70 mt-1">FM 106.25 Phitsanulok</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 transition-colors relative group ${
              activeTab === item.id ? 'bg-white/15 border-l-4 border-[#f9a826]' : 'hover:bg-white/5 border-l-4 border-transparent'
            }`}
          >
            <span className={`${activeTab === item.id ? 'text-[#f9a826]' : 'text-white/70 group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className={`ml-4 text-sm font-medium ${activeTab === item.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
              {item.label}
            </span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2 bg-black/10">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 px-1">คำสั่งหลัก</p>
        <button onClick={onSave} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95">
          <Save size={16} /> บันทึก
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onExport} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-2 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95">
            <Download size={14} /> ส่งออก
          </button>
          <button onClick={handleImportClick} className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95">
            <Upload size={14} /> นำเข้า
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
        </div>
        <button onClick={onClear} className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95">
          <Trash2 size={14} /> ล้างข้อมูลทั้งหมด
        </button>
        <div className="pt-2">
          <p className="text-[10px] text-center text-white/50 font-medium leading-relaxed">
            By Suraphun Inopas@2026 V4.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
