import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlaceOrderRequest {
    paymentMethod: PaymentMethod;
    address: Address;
    items: Array<OrderItem>;
    stripeTransactionId?: string;
}
export type ContactId = bigint;
export type Timestamp = bigint;
export interface StripeLineItem {
    name: string;
    priceRupees: number;
    quantity: bigint;
}
export interface Address {
    pin: string;
    houseNumber: string;
    city: string;
    state: string;
}
export interface ProductUpdate {
    inStock?: boolean;
    price?: number;
}
export interface RazorpayStats {
    failedCount: bigint;
    successCount: bigint;
    totalRevenue: bigint;
    totalTransactions: bigint;
}
export interface OrderItem {
    name: string;
    productId: ProductId;
    quantity: bigint;
    price: number;
}
export interface LoginEvent {
    method: LoginMethod;
    principal: UserId;
    displayName?: string;
    timestamp: Timestamp;
}
export interface CreateCheckoutSessionRequest {
    lineItems: Array<StripeLineItem>;
    cancelUrl: string;
    orderId: OrderId;
    successUrl: string;
}
export interface ContactSubmission {
    id: ContactId;
    name: string;
    submittedAt: Timestamp;
    isRead: boolean;
    email: string;
    message: string;
}
export interface UpiPaymentRecord {
    status: string;
    upiTransactionId: string;
    orderId: OrderId;
    timestamp: Timestamp;
    amount: bigint;
}
export interface Order {
    id: OrderId;
    status: OrderStatus;
    isDamaged: boolean;
    total: number;
    paymentMethod: PaymentMethod;
    userId: UserId;
    createdAt: Timestamp;
    address: Address;
    items: Array<OrderItem>;
    stripeTransactionId?: string;
}
export interface DashboardStats {
    totalProducts: bigint;
    cancelledOrders: bigint;
    totalOrders: bigint;
    damagedOrders: bigint;
    totalRazorpayTransactions: bigint;
    totalRazorpayRevenue: bigint;
    refundedOrders: bigint;
    uniqueCustomers: bigint;
    inStockCount: bigint;
    deliveredOrders: bigint;
}
export interface RazorpayPaymentRecord {
    razorpayPaymentId: string;
    status: string;
    paymentMethod: string;
    errorMessage: string;
    email: string;
    orderId: OrderId;
    razorpayOrderId: string;
    userPrincipal: string;
    timestamp: Timestamp;
    items: Array<OrderItem>;
    amount: bigint;
}
export type UserId = Principal;
export interface InventoryItem {
    inStock: boolean;
    productId: ProductId;
    updatedAt: Timestamp;
}
export type CreateCheckoutSessionResult = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface AltPaymentRecord {
    status: string;
    paymentMethod: string;
    orderId: OrderId;
    timestamp: Timestamp;
    amount: number;
    transactionId: string;
}
export type ReviewId = bigint;
export type ProductId = string;
export type PaymentStatus = {
    __kind__: "err";
    err: string;
} | {
    __kind__: "expired";
    expired: null;
} | {
    __kind__: "paid";
    paid: null;
} | {
    __kind__: "unpaid";
    unpaid: null;
};
export interface Review {
    id: ReviewId;
    text: string;
    productId: ProductId;
    reviewerName: string;
    timestamp: Timestamp;
    rating: bigint;
}
export type OrderId = bigint;
export enum LoginMethod {
    admin = "admin",
    internetIdentity = "internetIdentity"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    refunded = "refunded",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    cod = "cod",
    upi = "upi",
    cashfree = "cashfree",
    razorpay = "razorpay",
    paypal = "paypal",
    online = "online"
}
export interface backendInterface {
    adminDeleteProduct(password: string, productId: ProductId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminFlagOrderDamaged(password: string, orderId: OrderId, damaged: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetAllOrders(password: string): Promise<Array<Order>>;
    adminGetAllReviews(password: string): Promise<Array<Review>>;
    adminGetAltPayments(password: string): Promise<Array<AltPaymentRecord>>;
    adminGetContactSubmissions(password: string): Promise<Array<ContactSubmission>>;
    adminGetDamagedOrders(password: string): Promise<Array<Order>>;
    adminGetDashboardStats(password: string): Promise<DashboardStats | null>;
    adminGetInventory(password: string): Promise<Array<InventoryItem>>;
    adminGetLoginHistory(password: string): Promise<Array<LoginEvent>>;
    adminGetOutOfStockProducts(password: string): Promise<Array<InventoryItem>>;
    adminGetRazorpayPayments(password: string): Promise<Array<RazorpayPaymentRecord>>;
    adminGetRazorpayStats(password: string): Promise<RazorpayStats | null>;
    adminGetUpiPayments(password: string): Promise<Array<UpiPaymentRecord>>;
    adminMarkContactRead(password: string, id: ContactId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateOrderPaymentStatus(password: string, orderId: OrderId, sessionId: string): Promise<boolean>;
    adminUpdateOrderStatus(password: string, orderId: OrderId, newStatus: OrderStatus): Promise<boolean>;
    adminUpdateProduct(password: string, productId: ProductId, updates: ProductUpdate): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateStock(password: string, productId: ProductId, inStock: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminVerifyPassword(password: string): Promise<boolean>;
    cancelOrder(orderId: OrderId): Promise<boolean>;
    createStripeCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResult>;
    getAverageRating(productId: string): Promise<number | null>;
    getMyRazorpayPayments(): Promise<Array<RazorpayPaymentRecord>>;
    getReviews(productId: string): Promise<Array<Review>>;
    getUserOrders(): Promise<Array<Order>>;
    placeOrder(request: PlaceOrderRequest): Promise<Order>;
    recordAltPayment(orderId: OrderId, paymentMethod: string, transactionId: string, amount: number, password: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    recordLogin(method: LoginMethod, displayName: string | null): Promise<void>;
    recordRazorpayPayment(razorpayPaymentId: string, razorpayOrderId: string, amount: bigint, email: string, orderId: OrderId, items: Array<OrderItem>, paymentMethod: string, status: string, errorMessage: string): Promise<{
        __kind__: "ok";
        ok: RazorpayPaymentRecord;
    } | {
        __kind__: "err";
        err: string;
    }>;
    recordUpiPayment(orderId: OrderId, upiTransactionId: string, amount: bigint): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitContactForm(name: string, email: string, message: string): Promise<{
        __kind__: "ok";
        ok: ContactId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitReview(productId: string, reviewerName: string, rating: bigint, text: string): Promise<{
        __kind__: "ok";
        ok: ReviewId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifyStripePayment(sessionId: string): Promise<PaymentStatus>;
}
