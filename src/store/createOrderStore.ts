import { create } from "zustand";
import toast from "react-hot-toast";
import {
  type CustomerType,
  type MockCustomer,
  type OrderLineItem,
  type OrderPaymentStatus,
  type PaymentMethod,
  DELIVERY_CHARGE,
  DEFAULT_DISCOUNT,
  GST_RATE,
  generatePaymentLink,
  generateOrderId,
  searchCustomerByMobile,
  formatMobileDisplay,
  normalizeMobile,
} from "@/mock/createOrderData";

export interface SiteDetails {
  projectName: string;
  siteName: string;
  deliveryAddress: string;
  pinCode: string;
  city: string;
  state: string;
  supervisorName: string;
  supervisorPhone: string;
  specialInstructions: string;
}

export interface NewCustomerForm {
  fullName: string;
  mobile: string;
  email: string;
  customerType: CustomerType;
}

export interface AppSyncSettings {
  createInApp: boolean;
  pushNotification: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface DispatchChecklist {
  customerVerified: boolean;
  paymentReceived: boolean;
  inventoryAvailable: boolean;
  deliverySiteVerified: boolean;
  materialsAllocated: boolean;
}

interface CreateOrderState {
  orderId: string;
  paymentLink: string;
  mobileSearch: string;
  isSearching: boolean;
  customer: MockCustomer | null;
  isNewCustomer: boolean;
  showRegistration: boolean;
  newCustomer: NewCustomerForm;
  siteDetails: SiteDetails;
  lineItems: OrderLineItem[];
  paymentMethod: PaymentMethod;
  advanceAmount: number;
  paymentStatus: OrderPaymentStatus;
  paymentLinkSent: boolean;
  appSync: AppSyncSettings;
  dispatchChecklist: DispatchChecklist;
  discount: number;
  isSavingDraft: boolean;

  setMobileSearch: (value: string) => void;
  searchCustomer: () => Promise<void>;
  showQuickRegistration: () => void;
  setNewCustomerField: <K extends keyof NewCustomerForm>(
    key: K,
    value: NewCustomerForm[K]
  ) => void;
  createNewCustomer: () => void;
  setSiteField: <K extends keyof SiteDetails>(
    key: K,
    value: SiteDetails[K]
  ) => void;
  addProduct: (item: OrderLineItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAdvanceAmount: (amount: number) => void;
  generatePaymentLink: () => void;
  sendPaymentLink: () => void;
  mockApprovePayment: () => void;
  setAppSync: <K extends keyof AppSyncSettings>(
    key: K,
    value: AppSyncSettings[K]
  ) => void;
  setDispatchCheck: <K extends keyof DispatchChecklist>(
    key: K,
    value: boolean
  ) => void;
  setDiscount: (amount: number) => void;
  saveDraft: () => Promise<void>;
  reset: () => void;

  materialTotal: () => number;
  deliveryCharge: () => number;
  gstAmount: () => number;
  grandTotal: () => number;
  balanceDue: () => number;
  isDispatchLocked: () => boolean;
  canCreateOrder: () => boolean;
}

const defaultSiteDetails: SiteDetails = {
  projectName: "",
  siteName: "",
  deliveryAddress: "",
  pinCode: "",
  city: "",
  state: "",
  supervisorName: "",
  supervisorPhone: "",
  specialInstructions: "",
};

const defaultNewCustomer: NewCustomerForm = {
  fullName: "",
  mobile: "",
  email: "",
  customerType: "contractor",
};

const defaultAppSync: AppSyncSettings = {
  createInApp: true,
  pushNotification: true,
  sms: false,
  whatsapp: true,
};

const defaultDispatchChecklist: DispatchChecklist = {
  customerVerified: false,
  paymentReceived: false,
  inventoryAvailable: false,
  deliverySiteVerified: false,
  materialsAllocated: false,
};

const initialOrderId = generateOrderId();

export const useCreateOrderStore = create<CreateOrderState>((set, get) => ({
  orderId: initialOrderId,
  paymentLink: generatePaymentLink(initialOrderId),
  mobileSearch: "",
  isSearching: false,
  customer: null,
  isNewCustomer: false,
  showRegistration: false,
  newCustomer: { ...defaultNewCustomer },
  siteDetails: { ...defaultSiteDetails },
  lineItems: [],
  paymentMethod: "credit",
  advanceAmount: 0,
  paymentStatus: "payment_pending",
  paymentLinkSent: false,
  appSync: { ...defaultAppSync },
  dispatchChecklist: { ...defaultDispatchChecklist },
  discount: DEFAULT_DISCOUNT,
  isSavingDraft: false,

  setMobileSearch: (value) =>
    set({ mobileSearch: normalizeMobile(value) }),

  searchCustomer: async () => {
    const { mobileSearch } = get();
    const digits = mobileSearch.replace(/\D/g, "");
    if (digits.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    set({ isSearching: true });
    await new Promise((r) => setTimeout(r, 600));

    const found = searchCustomerByMobile(mobileSearch);
    if (found) {
      set({
        customer: found,
        isNewCustomer: false,
        showRegistration: false,
        isSearching: false,
        dispatchChecklist: {
          ...get().dispatchChecklist,
          customerVerified: true,
        },
      });
      toast.success(`Customer found: ${found.name}`);
    } else {
      set({
        customer: null,
        isNewCustomer: true,
        showRegistration: true,
        newCustomer: {
          ...defaultNewCustomer,
          mobile: digits,
        },
        isSearching: false,
      });
      toast("Customer not found. Complete quick registration.", { icon: "ℹ️" });
    }
  },

  showQuickRegistration: () => {
    const digits = normalizeMobile(get().mobileSearch);
    set({
      showRegistration: true,
      isNewCustomer: true,
      newCustomer: {
        ...defaultNewCustomer,
        mobile: digits,
      },
    });
  },

  setNewCustomerField: (key, value) =>
    set((state) => ({
      newCustomer: { ...state.newCustomer, [key]: value },
    })),

  createNewCustomer: () => {
    const { newCustomer } = get();
    if (!newCustomer.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    const digits = normalizeMobile(newCustomer.mobile);
    if (digits.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    const typeLabels: Record<CustomerType, string> = {
      individual: "Individual",
      contractor: "Contractor / Mason",
      builder: "Builder / Developer",
      interior_designer: "Interior Designer / Architect",
    };

    const customer: MockCustomer = {
      id: `CUST-NEW-${Date.now()}`,
      name: newCustomer.fullName,
      mobile: formatMobileDisplay(digits),
      email: newCustomer.email || "—",
      customerType: newCustomer.customerType,
      customerTypeLabel: typeLabels[newCustomer.customerType],
      gstStatus: "not_applicable",
      lifetimeRevenue: 0,
      previousOrders: 0,
      customerSince: "Today",
      outstandingBalance: 0,
      creditLimit: 100000,
      loyaltyPoints: 0,
    };

    set({
      customer,
      isNewCustomer: true,
      showRegistration: false,
      dispatchChecklist: {
        ...get().dispatchChecklist,
        customerVerified: true,
      },
    });
    toast.success("New customer registered successfully.");
  },

  setSiteField: (key, value) =>
    set((state) => ({
      siteDetails: { ...state.siteDetails, [key]: value },
      dispatchChecklist:
        key === "siteName" && value.trim()
          ? { ...state.dispatchChecklist, deliverySiteVerified: true }
          : state.dispatchChecklist,
    })),

  addProduct: (item) => {
    const existing = get().lineItems.find((l) => l.productId === item.productId);
    if (existing) {
      set((state) => ({
        lineItems: state.lineItems.map((l) =>
          l.productId === item.productId
            ? { ...l, quantity: l.quantity + 1 }
            : l
        ),
        dispatchChecklist: {
          ...state.dispatchChecklist,
          inventoryAvailable: true,
          materialsAllocated: true,
        },
      }));
    } else {
      set((state) => ({
        lineItems: [...state.lineItems, { ...item, quantity: item.quantity || 1 }],
        dispatchChecklist: {
          ...state.dispatchChecklist,
          inventoryAvailable: true,
          materialsAllocated: true,
        },
      }));
    }
    toast.success(`${item.name} added to order.`);
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    set((state) => ({
      lineItems: state.lineItems.map((l) =>
        l.productId === productId ? { ...l, quantity } : l
      ),
    }));
  },

  removeProduct: (productId) =>
    set((state) => ({
      lineItems: state.lineItems.filter((l) => l.productId !== productId),
    })),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setAdvanceAmount: (amount) => set({ advanceAmount: Math.max(0, amount) }),

  generatePaymentLink: () => {
    const orderId = generateOrderId();
    set({
      orderId,
      paymentLink: generatePaymentLink(orderId),
    });
    toast.success("Payment link generated.");
  },

  sendPaymentLink: () => {
    set({ paymentLinkSent: true });
    toast.success("Payment link sent to customer via SMS & WhatsApp.");
  },

  mockApprovePayment: () => {
    const total = get().grandTotal();
    set({
      paymentStatus: "ready_for_dispatch",
      advanceAmount: total,
      dispatchChecklist: {
        ...get().dispatchChecklist,
        paymentReceived: true,
      },
    });
    toast.success("Payment approved. Order is ready for dispatch.");
  },

  setAppSync: (key, value) =>
    set((state) => ({
      appSync: { ...state.appSync, [key]: value },
    })),

  setDispatchCheck: (key, value) =>
    set((state) => ({
      dispatchChecklist: { ...state.dispatchChecklist, [key]: value },
    })),

  setDiscount: (amount) => set({ discount: Math.max(0, amount) }),

  saveDraft: async () => {
    set({ isSavingDraft: true });
    await new Promise((r) => setTimeout(r, 500));
    set({ isSavingDraft: false });
    toast.success("Draft saved locally.");
  },

  reset: () =>
    set({
      orderId: generateOrderId(),
      paymentLink: generatePaymentLink(generateOrderId()),
      mobileSearch: "",
      customer: null,
      isNewCustomer: false,
      showRegistration: false,
      newCustomer: { ...defaultNewCustomer },
      siteDetails: { ...defaultSiteDetails },
      lineItems: [],
      paymentMethod: "credit",
      advanceAmount: 0,
      paymentStatus: "payment_pending",
      paymentLinkSent: false,
      appSync: { ...defaultAppSync },
      dispatchChecklist: { ...defaultDispatchChecklist },
      discount: DEFAULT_DISCOUNT,
    }),

  materialTotal: () =>
    get().lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    ),

  deliveryCharge: () =>
    get().lineItems.length > 0 ? DELIVERY_CHARGE : 0,

  gstAmount: () => {
    const material = get().materialTotal();
    if (material <= 0) return 0;
    const subtotal = material + get().deliveryCharge() - get().discount;
    return Math.round(Math.max(0, subtotal) * GST_RATE);
  },

  grandTotal: () => {
    const material = get().materialTotal();
    if (material <= 0) return 0;
    const subtotal = material + get().deliveryCharge() - get().discount;
    return Math.round(Math.max(0, subtotal) * (1 + GST_RATE));
  },

  balanceDue: () => Math.max(0, get().grandTotal() - get().advanceAmount),

  isDispatchLocked: () => get().paymentStatus === "payment_pending",

  canCreateOrder: () => {
    const { customer, lineItems, siteDetails } = get();
    return (
      !!customer &&
      lineItems.length > 0 &&
      !!siteDetails.siteName.trim() &&
      !!siteDetails.deliveryAddress.trim()
    );
  },
}));
