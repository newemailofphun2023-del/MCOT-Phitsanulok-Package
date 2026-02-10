
export type CustomerType = 'เอกชน' | 'ราชการ' | 'รัฐวิสาหกิจ';
export type PotentialLevel = 'สูง' | 'กลาง' | 'ต่ำ';
export type ProductType = 'onAir' | 'online' | 'production';

export interface Customer {
  id: string;
  company: string;
  type: CustomerType;
  category?: string;
  address?: string;
  name: string;
  position?: string;
  phone: string;
  email: string;
  potential: PotentialLevel;
  note?: string;
  created: string;
}

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  price: number;
  promotion: 'ไม่มี' | 'มี';
  promotionDetail?: string;
  note?: string;
  created: string;
}

export interface Package {
  id: string;
  name: string;
  products: Product[];
  totalPrice: number;
  note?: string;
  created: string;
}

export interface OrderItem {
  id: string;
  customerId: string;
  productType: 'Produce' | 'Package' | 'Production';
  productId: string; // The ID of the actual product/package
  productName: string;
  unitPrice: number;
  timeSlots: string[];
  startDate: string;
  endDate: string;
  daysOfWeek: number[]; // 0-6 (Sun-Sat)
  timesPerDay: number;
  totalDays: number;
  totalPrice: number;
  conditionDiscountPercent: number;
  paymentDiscountPercent: number;
  totalDiscountAmount: number;
  priceAfterDiscount: number;
  vatAmount: number;
  netTotal: number;
  paymentType: 'หลังออกอากาศ' | 'ก่อนออกอากาศ';
  note?: string;
  created: string;
}

export interface SystemData {
  customers: Customer[];
  products: Product[];
  packages: Package[];
  orders: OrderItem[];
  settings: {
    lastSave: string | null;
    version: string;
  };
}
