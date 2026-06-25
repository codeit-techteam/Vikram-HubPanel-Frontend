export type CustomerType =
  | "individual"
  | "contractor"
  | "builder"
  | "interior_designer";

export type PaymentMethod = "credit" | "upi" | "bank_transfer" | "cash";

export type OrderPaymentStatus =
  | "payment_pending"
  | "ready_for_dispatch"
  | "dispatched";

export interface MockCustomer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  customerType: CustomerType;
  customerTypeLabel: string;
  gstStatus: "verified" | "unverified" | "not_applicable";
  gstNumber?: string;
  company?: string;
  billingAddress?: string;
  lifetimeRevenue: number;
  previousOrders: number;
  customerSince: string;
  outstandingBalance: number;
  creditLimit: number;
  loyaltyPoints: number;
}

export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  stockAvailable: number;
  stockLabel: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  unitPrice: number;
  unit: string;
  category: string;
}

export interface OrderLineItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  stockAvailable: number;
  stockLabel: string;
  unitPrice: number;
  quantity: number;
  unit: string;
}

export const MOCK_CUSTOMERS: Record<string, MockCustomer> = {
  "9876543210": {
    id: "CUST-001",
    name: "Rajesh K. Verma",
    mobile: "+91 98765 43210",
    email: "rajesh.v@infra.com",
    customerType: "contractor",
    customerTypeLabel: "A-Class Contractor",
    gstStatus: "verified",
    gstNumber: "07AAAAA0000A1Z5",
    company: "Verma Infra Projects",
    billingAddress: "Suite 405, Okhla Phase III, New Delhi, 110020",
    lifetimeRevenue: 1245000,
    previousOrders: 47,
    customerSince: "Mar 2022",
    outstandingBalance: 142000,
    creditLimit: 500000,
    loyaltyPoints: 4250,
  },
  "9123456789": {
    id: "CUST-002",
    name: "Priya Sharma",
    mobile: "+91 91234 56789",
    email: "priya.sharma@buildco.in",
    customerType: "builder",
    customerTypeLabel: "Builder / Developer",
    gstStatus: "verified",
    gstNumber: "07BBBBB0000B2Z6",
    company: "Sharma BuildCo Pvt Ltd",
    billingAddress: "Tower B, Cyber City, Gurugram, 122002",
    lifetimeRevenue: 3890000,
    previousOrders: 112,
    customerSince: "Jan 2021",
    outstandingBalance: 0,
    creditLimit: 1500000,
    loyaltyPoints: 12800,
  },
};

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "PROD-001",
    name: "UltraTech Cement (PPC)",
    sku: "UT-C-50-PPC",
    image: "/products/cement.jpg",
    stockAvailable: 1240,
    stockLabel: "1,240 Bags",
    stockStatus: "in_stock",
    unitPrice: 410,
    unit: "Bags (50kg)",
    category: "Cement",
  },
  {
    id: "PROD-002",
    name: "ACC Cement",
    sku: "ACC-C-50-OPC",
    image: "/products/acc-cement.jpg",
    stockAvailable: 890,
    stockLabel: "890 Bags",
    stockStatus: "in_stock",
    unitPrice: 395,
    unit: "Bags (50kg)",
    category: "Cement",
  },
  {
    id: "PROD-003",
    name: "TMT Steel Bar (12mm)",
    sku: "TMT-12-FE550",
    image: "/products/tmt-12.jpg",
    stockAvailable: 45,
    stockLabel: "45 MT (Low)",
    stockStatus: "low_stock",
    unitPrice: 68500,
    unit: "Tons",
    category: "Steel",
  },
  {
    id: "PROD-004",
    name: "TMT Steel Bar (16mm)",
    sku: "TMT-16-FE550",
    image: "/products/tmt-16.jpg",
    stockAvailable: 32,
    stockLabel: "32 MT",
    stockStatus: "in_stock",
    unitPrice: 67200,
    unit: "Tons",
    category: "Steel",
  },
  {
    id: "PROD-005",
    name: "Red Bricks (Class A)",
    sku: "BRK-RED-A",
    image: "/products/bricks.jpg",
    stockAvailable: 25000,
    stockLabel: "25,000 Pcs",
    stockStatus: "in_stock",
    unitPrice: 8.5,
    unit: "Pieces",
    category: "Masonry",
  },
  {
    id: "PROD-006",
    name: "River Sand (Fine)",
    sku: "SND-RVR-F",
    image: "/products/sand.jpg",
    stockAvailable: 120,
    stockLabel: "120 CFT",
    stockStatus: "in_stock",
    unitPrice: 55,
    unit: "CFT",
    category: "Aggregates",
  },
  {
    id: "PROD-007",
    name: "Stone Chips (20mm)",
    sku: "STC-20MM",
    image: "/products/chips.jpg",
    stockAvailable: 85,
    stockLabel: "85 CFT",
    stockStatus: "in_stock",
    unitPrice: 48,
    unit: "CFT",
    category: "Aggregates",
  },
  {
    id: "PROD-008",
    name: "CPVC Pipe (1 inch)",
    sku: "CPVC-1IN",
    image: "/products/cpvc.jpg",
    stockAvailable: 450,
    stockLabel: "450 Pcs",
    stockStatus: "in_stock",
    unitPrice: 185,
    unit: "Pieces",
    category: "Plumbing",
  },
];

export const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "contractor", label: "Contractor / Mason" },
  { value: "builder", label: "Builder / Developer" },
  { value: "interior_designer", label: "Interior Designer / Architect" },
];

export const DELIVERY_CHARGE = 2500;
export const GST_RATE = 0.18;
export const DEFAULT_DISCOUNT = 0;

export function normalizeMobile(input: string): string {
  return input.replace(/\D/g, "").slice(-10);
}

export function formatMobileDisplay(digits: string): string {
  const normalized = normalizeMobile(digits);
  if (!normalized) return "";
  if (normalized.length <= 5) return `+91 ${normalized}`;
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}

export function searchCustomerByMobile(mobile: string): MockCustomer | null {
  const normalized = normalizeMobile(mobile);
  if (normalized.length !== 10) return null;
  return MOCK_CUSTOMERS[normalized] ?? null;
}

export function searchProducts(query: string): MockProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

export function generatePaymentLink(orderId: string): string {
  return `https://pay.buildquick.in/order/${orderId}`;
}

export function generateOrderId(): string {
  return `${Date.now().toString().slice(-5)}`;
}
