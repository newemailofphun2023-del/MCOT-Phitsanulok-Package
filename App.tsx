
import React, { useState, useEffect, useCallback } from 'react';
import { SystemData, Customer, Product, Package, OrderItem } from './types';
import { storageService } from './services/storage';
import Sidebar from './components/Sidebar';
import CustomerSection from './components/CustomerSection';
import ProductSection from './components/ProductSection';
import PackageSection from './components/PackageSection';
import OrderSection from './components/OrderSection';
import QuotationSection from './components/QuotationSection';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [data, setData] = useState<SystemData>({
    customers: [],
    products: [],
    packages: [],
    orders: [],
    settings: { lastSave: null, version: "4.0" }
  });

  // Load initial data
  useEffect(() => {
    const saved = storageService.load();
    if (saved) {
      setData(saved);
    }
  }, []);

  const handleSave = useCallback(() => {
    setData(currentData => {
      storageService.save(currentData);
      return currentData;
    });
    alert("บันทึกข้อมูลเรียบร้อยแล้ว");
  }, []);

  // Auto-save every 30 seconds (no alert for auto-save)
  useEffect(() => {
    const interval = setInterval(() => {
      setData(currentData => {
        storageService.save(currentData);
        return currentData;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = useCallback(() => {
    storageService.exportData(data);
  }, [data]);

  const handleImport = async (file: File) => {
    try {
      const importedData = await storageService.importData(file);
      if (confirm("คุณแน่ใจหรือไม่ว่าต้องการนำเข้าข้อมูล? ข้อมูลปัจจุบันจะถูกเขียนทับ")) {
        setData(importedData);
        storageService.save(importedData);
        alert("นำเข้าข้อมูลสำเร็จ");
      }
    } catch (err) {
      alert("ไม่สามารถนำเข้าข้อมูลได้: " + (err as Error).message);
    }
  };

  const handleClear = useCallback(() => {
    if (confirm("ต้องการล้างข้อมูลทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      storageService.clear();
      window.location.reload();
    }
  }, []);

  // Customer Management
  const addCustomer = (customer: Customer) => {
    setData(prev => ({ ...prev, customers: [...prev.customers, customer] }));
  };
  const deleteCustomer = (id: string) => {
    if (confirm("ลบข้อมูลลูกค้านี้?")) {
      setData(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
    }
  };

  // Product Management
  const addProduct = (product: Product) => {
    setData(prev => ({ ...prev, products: [...prev.products, product] }));
  };
  const deleteProduct = (id: string) => {
    setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  };

  // Package Management
  const addPackage = (pkg: Package) => {
    setData(prev => ({ ...prev, packages: [...prev.packages, pkg] }));
  };
  const deletePackage = (id: string) => {
    if (confirm("ลบแพ็กเกจนี้?")) {
      setData(prev => ({ ...prev, packages: prev.packages.filter(p => p.id !== id) }));
    }
  };

  // Order Management
  const addOrder = (order: OrderItem) => {
    setData(prev => ({ ...prev, orders: [...prev.orders, order] }));
  };
  const deleteOrder = (id: string) => {
    setData(prev => ({ ...prev, orders: prev.orders.filter(o => o.id !== id) }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'customers':
        return <CustomerSection customers={data.customers} onAdd={addCustomer} onDelete={deleteCustomer} onUpdate={() => {}} />;
      case 'products':
        return <ProductSection products={data.products} onAdd={addProduct} onDelete={deleteProduct} />;
      case 'packages':
        return <PackageSection products={data.products} packages={data.packages} onAdd={addPackage} onDelete={deletePackage} />;
      case 'orders':
        return <OrderSection 
          customers={data.customers} 
          products={data.products} 
          packages={data.packages} 
          orders={data.orders}
          onAddOrder={addOrder}
          onDeleteOrder={deleteOrder}
        />;
      case 'quotations':
        return <QuotationSection customers={data.customers} orders={data.orders} />;
      default:
        return <div className="p-8 text-center text-slate-400">ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        orderCount={data.orders.length}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onClear={handleClear}
      />
      
      <main className="flex-1 ml-64 p-8 lg:p-12 transition-all">
        <header className="mb-10 no-print">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">MCOT Phitsanulok FM 106.25</p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h1>
            </div>
            {data.settings.lastSave && (
              <div className="text-[10px] text-slate-400 font-mono text-right italic">
                Last auto-saved: {new Date(data.settings.lastSave).toLocaleTimeString()}
              </div>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
