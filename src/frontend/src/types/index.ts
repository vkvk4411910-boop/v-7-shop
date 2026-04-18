export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: "new" | "sale" | "hot" | "bestseller";
  tags: string[];
  // Extended detail fields
  colors?: string[];
  materials?: string[];
  images?: string[];
  specs?: Record<string, string>;
  qualityDescription?: string;
  features?: string[];
}

export interface Review {
  id: number;
  productId: string;
  reviewerName: string;
  rating: number;
  text: string;
  timestamp: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: bigint;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  userId: string;
  createdAt: bigint;
  address: Address;
  items: OrderItem[];
  isDamaged: boolean;
  stripeTransactionId?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: bigint;
  price: number;
}

export interface Address {
  pin: string;
  city: string;
  state: string;
  houseNumber: string;
}

export enum OrderStatus {
  shipped = "shipped",
  cancelled = "cancelled",
  pending = "pending",
  delivered = "delivered",
  confirmed = "confirmed",
  refunded = "refunded",
}

export enum PaymentMethod {
  cod = "cod",
  online = "online",
  upi = "upi",
  gpay = "gpay",
  paypal = "paypal",
  razorpay = "razorpay",
  cashfree = "cashfree",
}

export interface AltPaymentRecord {
  orderId: bigint;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  timestamp: bigint;
  status: string;
}

export interface UpiPaymentRecord {
  orderId: bigint;
  upiTransactionId: string;
  amount: bigint;
  timestamp: bigint;
  status: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  submittedAt: bigint;
  isRead: boolean;
}

export interface LoginEvent {
  principal: string;
  method: "internetIdentity" | "admin";
  timestamp: number;
  displayName?: string;
}

export interface InventoryItem {
  productId: string;
  inStock: boolean;
  updatedAt: bigint;
}

export interface DashboardStats {
  totalProducts: number;
  inStockCount: number;
  totalOrders: number;
  uniqueCustomers: number;
  deliveredOrders: number;
  refundedOrders: number;
  cancelledOrders: number;
  damagedOrders: number;
}

export interface AdminReview {
  id: number;
  productId: string;
  reviewerName: string;
  rating: number;
  text: string;
  timestamp: bigint;
}

export type Category =
  | "men"
  | "women"
  | "shoes"
  | "beauty"
  | "sports"
  | "accessories";

export type ThemeId = "blue" | "orange" | "teal" | "magenta" | "green";

export interface Theme {
  id: ThemeId;
  label: string;
  color: string;
  primary: string;
}

export const THEMES: Theme[] = [
  { id: "blue", label: "Blue", color: "#1a6be8", primary: "0.48 0.25 254" },
  { id: "orange", label: "Orange", color: "#e86a1a", primary: "0.64 0.22 30" },
  { id: "teal", label: "Teal", color: "#1ab8a8", primary: "0.68 0.18 165" },
  {
    id: "magenta",
    label: "Magenta",
    color: "#c41ab8",
    primary: "0.58 0.20 331",
  },
  { id: "green", label: "Green", color: "#22c55e", primary: "0.72 0.15 142" },
];

export const CATEGORIES = [
  { id: "men" as Category, label: "Men", icon: "👔", color: "bg-blue-500" },
  { id: "women" as Category, label: "Women", icon: "👗", color: "bg-pink-500" },
  {
    id: "shoes" as Category,
    label: "Shoes",
    icon: "👟",
    color: "bg-orange-500",
  },
  {
    id: "beauty" as Category,
    label: "Beauty",
    icon: "💄",
    color: "bg-rose-500",
  },
  {
    id: "sports" as Category,
    label: "Sports",
    icon: "⚽",
    color: "bg-green-500",
  },
  {
    id: "accessories" as Category,
    label: "Accessories",
    icon: "🎒",
    color: "bg-purple-500",
  },
] as const;
