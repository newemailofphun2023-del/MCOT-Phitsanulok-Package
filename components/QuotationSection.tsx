
import React, { useState, useMemo } from 'react';
import { Customer, OrderItem } from '../types';
import { geminiService } from '../services/gemini';
import { Printer, Mail, Sparkles, Loader2, CreditCard, Building, Info, FileText } from 'lucide-react';

interface QuotationSectionProps {
  customers: Customer[];
  orders: OrderItem[];
}

const QuotationSection: React.FC<QuotationSectionProps> = ({ customers, orders }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [staffName, setStaffName] = useState('ฝ่ายขาย');
  const [staffPhone, setStaffPhone] = useState('055-287833');
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedCustomer = useMemo(() => customers.find(c => c.id === selectedCustomerId), [customers, selectedCustomerId]);
  const filteredOrders = useMemo(() => orders.filter(o => o.customerId === selectedCustomerId), [orders, selectedCustomerId]);

  const totals = useMemo(() => {
    return filteredOrders.reduce((acc, curr) => ({
      beforeVat: acc.beforeVat + curr.priceAfterDiscount,
      vat: acc.vat + curr.vatAmount,
      total: acc.total + curr.netTotal
    }), { beforeVat: 0, vat: 0, total: 0 });
  }, [filteredOrders]);

  const handleGenerateAiSummary = async () => {
    if (!selectedCustomer || filteredOrders.length === 0) return;
    setIsGenerating(true);
    try {
      const summary = await geminiService.summarizeOrder(filteredOrders, selectedCustomer);
      setAiSummary(summary);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden no-print">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">ตั้งค่าการออกเอกสาร</h2>
          </div>
          <button 
            onClick={() => window.print()} 
            disabled={!selectedCustomerId}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 active:scale-95"
          >
            <Printer size={18} /> พิมพ์ใบเสนอราคา
          </button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">เลือกลูกค้า</label>
            <select 
              value={selectedCustomerId}
              onChange={e => { setSelectedCustomerId(e.target.value); setAiSummary(''); }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100"
            >
              <option value="">-- เลือกลูกค้า --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.company}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">ชื่อผู้เสนอราคา</label>
            <input 
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">เบอร์ติดต่อผู้ขาย</label>
            <input 
              value={staffPhone}
              onChange={e => setStaffPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Gemini AI Summary */}
      {selectedCustomerId && filteredOrders.length > 0 && (
        <div className="bg-gradient-to-r from-slate-100 to-blue-50 rounded-2xl border border-blue-100 p-6 no-print">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI ช่วยเขียนสรุปแคมเปญ</h3>
                <p className="text-xs text-slate-500">สร้างข้อความร่างอีเมลหรือไลน์ส่งให้ลูกค้า</p>
              </div>
            </div>
            <button 
              onClick={handleGenerateAiSummary}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              เขียนข้อความร่าง
            </button>
          </div>
          {aiSummary && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 shadow-inner relative">
              {aiSummary}
              <button 
                onClick={() => navigator.clipboard.writeText(aiSummary)}
                className="absolute top-2 right-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 font-bold"
              >
                คัดลอก
              </button>
            </div>
          )}
        </div>
      )}

      {/* Professional Quotation Preview */}
      {selectedCustomerId ? (
        <div id="quotation-print" className="bg-white p-12 shadow-2xl rounded-sm border border-slate-200 max-w-5xl mx-auto text-slate-800 min-h-[1100px] flex flex-col font-['Sarabun']">
          {/* Main Heading Content */}
          <div className="flex flex-col items-center text-center border-b-4 border-slate-800 pb-6 mb-8">
            <h1 className="text-2xl font-black text-blue-900 mb-1">MCOT Radio Network Phitsanulok</h1>
            <p className="text-lg font-bold">สถานีวิทยุกระจายเสียง อสมท จังหวัดพิษณุโลก F.M. 106.25 MHz.</p>
            <p className="text-sm">บมจ.อสมท สาขาพิษณุโลก 1 สาขาที่ 00010</p>
            <p className="text-sm">361/4 หมู่ที่ 2 ถนนบึงพระ-วัดหล่ม ต.บึงพระ อ.เมือง จ.พิษณุโลก 65000</p>
            <p className="text-sm font-bold mt-1">โทร. 055-287833 | เลขประจำตัวผู้เสียภาษี 0107547000745</p>
          </div>

          {/* Customer Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="font-bold w-20">เรียน:</span>
                <span className="font-black border-b border-dotted border-slate-400 flex-1">{selectedCustomer?.company}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-20">ที่อยู่:</span>
                <span className="border-b border-dotted border-slate-400 flex-1">{selectedCustomer?.address || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-20">เบอร์โทรศัพท์:</span>
                <span className="border-b border-dotted border-slate-400 flex-1">{selectedCustomer?.phone || '-'}</span>
              </div>
            </div>
            <div className="space-y-1.5 flex flex-col items-end">
              <div className="flex w-full justify-end">
                <span className="font-bold mr-2">วันที่:</span>
                <span className="font-bold border-b border-dotted border-slate-400 w-40 text-center">
                  {new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quotation Table */}
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200 border-y-2 border-slate-800">
                  <th className="p-3 text-left border-x border-slate-300">รายละเอียด</th>
                  <th className="p-3 text-center border-x border-slate-300 w-24">จำนวนวัน</th>
                  <th className="p-3 text-center border-x border-slate-300 w-48">วันที่ออกอากาศ</th>
                  <th className="p-3 text-center border-x border-slate-300 w-20">ครั้ง/วัน</th>
                  <th className="p-3 text-right border-x border-slate-300 w-28">ครั้งรวม</th>
                  <th className="p-3 text-right border-x border-slate-300 w-32">ยอดสุทธิ (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-200">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{order.productName}</p>
                      {order.note && <p className="text-[10px] text-blue-600 mt-0.5">* {order.note}</p>}
                    </td>
                    <td className="p-3 text-center font-bold">{order.totalDays}</td>
                    <td className="p-3 text-center">
                      <div className="text-[10px] leading-tight font-medium">
                        {new Date(order.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} - <br/>
                        {new Date(order.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold">{order.timesPerDay}</td>
                    <td className="p-3 text-right font-mono font-bold">{(order.totalDays * order.timesPerDay).toLocaleString()}</td>
                    <td className="p-3 text-right font-black">{order.priceAfterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {/* Empty rows to maintain table height consistency if needed */}
                {filteredOrders.length < 5 && Array.from({ length: 5 - filteredOrders.length }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-slate-100 h-12">
                    <td className="p-3" colSpan={6}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="mt-8 flex justify-end">
            <div className="w-80 space-y-1">
              <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                <span className="font-bold">ยอดก่อน VAT รวม:</span>
                <span className="font-black">{totals.beforeVat.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                <span className="font-bold">VAT 7% รวม:</span>
                <span className="font-black">{totals.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800 text-white p-3 rounded-lg mt-2 shadow-md">
                <span className="text-sm font-black">ยอดสุทธิรวม:</span>
                <span className="text-xl font-black">{totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
              </div>
            </div>
          </div>

          {/* Proposer Signature */}
          <div className="mt-12 mb-12 flex justify-end">
            <div className="text-center w-64 space-y-12">
              <div className="border-b border-slate-300 pb-1">
                 <p className="text-sm font-bold text-slate-800">ผู้เสนอราคา: {staffName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs">(....................................................................)</p>
                <p className="text-xs font-bold text-slate-500">MCOT Radio Network Phitsanulok</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions Section */}
          <div className="grid grid-cols-2 gap-12 text-[11px] pt-10 border-t-2 border-slate-200 mt-auto">
            <div className="space-y-4">
              <div>
                <p className="font-black text-blue-900 uppercase mb-2 flex items-center gap-1">
                  <Info size={14} /> เงื่อนไข:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-bold">
                  <li>ลูกค้ารายใหม่ชำระเงินก่อนออกอากาศ ในเวลาทำการ 09.00 น. - 15.00 น. (วันจันทร์ - วันศุกร์)</li>
                  <li>ถ้าชำระหลัง เวลา 15.00 น. ถือว่าชำระในวันรุ่งขึ้น</li>
                </ul>
              </div>
              <div>
                <p className="font-black text-blue-900 uppercase mb-2 flex items-center gap-1">
                  <Building size={14} /> หนังสือรับรองการหักภาษี ณ ที่จ่าย ออกในนาม:
                </p>
                <div className="text-slate-600 space-y-0.5 pl-4 border-l-2 border-slate-200">
                  <p className="font-bold">บมจ.อสมท 63/1 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310</p>
                  <p className="font-black">เลขประจำตัวผู้เสียภาษี 0107547000745</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-black text-blue-900 uppercase mb-2 flex items-center gap-1">
                  <CreditCard size={14} /> รายละเอียดการชำระเงิน:
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="pb-2 border-b border-slate-200">
                    <p className="font-black text-slate-800">ชำระเป็นเช็ค:</p>
                    <p className="text-slate-600">สั่งจ่ายในนาม <span className="font-bold">บมจ.อสมท</span></p>
                  </div>
                  <div className="pb-2 border-b border-slate-200">
                    <p className="font-black text-blue-800">โอนเงินเข้าบัญชี:</p>
                    <p className="font-bold text-slate-800 uppercase">บมจ. อสมท</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs">บัญชีเลขที่:</span>
                      <span className="font-mono font-black text-lg tracking-wider text-blue-700">015-1-05842-3</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold">ธนาคารกรุงไทย สาขาสิงห์คอมเพล็กซ์</p>
                  </div>
                  <div>
                    <p className="font-black text-slate-800">ชำระเป็นเงินสด:</p>
                    <p className="text-slate-600 text-[10px]">ที่ฝ่ายการเงิน บมจ. อสมท สาขาพิษณุโลก 1 ในเวลาทำการ 09.00 น. – 15.00 น.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-24 text-center text-slate-400 border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <FileText size={64} className="opacity-10" />
          <p className="text-lg font-medium">กรุณาเลือกลูกค้าเพื่อแสดงตัวอย่างใบเสนอราคา</p>
          <p className="text-sm">ใบเสนอราคาจะถูกสร้างขึ้นอัตโนมัติตามรายการที่เลือก</p>
        </div>
      )}
    </div>
  );
};

export default QuotationSection;
