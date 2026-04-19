import {
  type ContactSubmission,
  type CreateCheckoutSessionRequest,
  type InventoryItem,
  type LoginEvent,
  LoginMethod,
  type Order,
  OrderStatus,
  PaymentMethod as PMEnum,
  type PlaceOrderRequest,
  createActor,
} from "@/backend";
import type {
  Address,
  AdminReview,
  AltPaymentRecord,
  DashboardStats,
  OrderItem,
  RazorpayPaymentRecord,
  UpiPaymentRecord,
} from "@/types";
import { useActor as useCoreActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function useActor() {
  return useCoreActor(createActor);
}

export function useUserOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["user-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      items,
      address,
      paymentMethod = PMEnum.cod,
      stripeTransactionId,
    }: {
      items: OrderItem[];
      address: Address;
      paymentMethod?: PMEnum;
      stripeTransactionId?: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const request: PlaceOrderRequest = {
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: BigInt(i.quantity as unknown as number),
          price: i.price,
        })),
        address,
        paymentMethod,
        stripeTransactionId,
      };
      return actor.placeOrder(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
    onError: () => {
      toast.error("Failed to place order. Please try again.");
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      toast.success("Order cancelled.");
    },
    onError: () => {
      toast.error("Failed to cancel order.");
    },
  });
}

export function useAdminOrders(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["admin-orders", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.adminGetAllOrders(password);
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

export function useAdminUpdateStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      password,
      orderId,
      status,
    }: {
      password: string;
      orderId: bigint;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminUpdateOrderStatus(password, orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated.");
    },
  });
}

export function useAdminVerifyPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminVerifyPassword(password);
    },
  });
}

// Contact Form
export function useSubmitContactForm() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      message,
    }: {
      name: string;
      email: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitContactForm(name, email, message);
    },
    onSuccess: () => {
      toast.success("Message sent! We'll get back to you soon.");
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });
}

// Record Login — passes displayName as second param
export function useRecordLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      method,
      displayName,
    }: {
      method: "internetIdentity" | "admin";
      displayName?: string;
    }) => {
      if (!actor) return;
      const loginMethod =
        method === "admin" ? LoginMethod.admin : LoginMethod.internetIdentity;
      return actor.recordLogin(loginMethod, displayName ?? null);
    },
  });
}

// Admin: Contact Submissions
export function useAdminContacts(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ContactSubmission[]>({
    queryKey: ["admin-contacts", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.adminGetContactSubmissions(password);
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Admin: Mark Contact Read
export function useAdminMarkContactRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      id,
    }: {
      password: string;
      id: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminMarkContactRead(password, id);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-contacts", vars.password],
      });
    },
  });
}

// Admin: Login History
export function useAdminLoginHistory(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<LoginEvent[]>({
    queryKey: ["admin-login-history", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.adminGetLoginHistory(password);
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Admin: Inventory
export function useAdminInventory(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ["admin-inventory", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.adminGetInventory(password);
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Admin: Update Stock
export function useAdminUpdateStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      productId,
      inStock,
    }: {
      password: string;
      productId: string;
      inStock: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminUpdateStock(password, productId, inStock);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory", vars.password],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-out-of-stock", vars.password],
      });
      toast.success("Stock status updated.");
    },
  });
}

// Admin: Delete Product
export function useAdminDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      productId,
    }: {
      password: string;
      productId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminDeleteProduct(password, productId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-inventory", vars.password],
      });
      toast.success("Product removed from inventory.");
    },
    onError: () => {
      toast.error("Failed to delete product.");
    },
  });
}

// Admin: Flag Damaged Order
export function useAdminFlagDamaged() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      orderId,
      damaged,
    }: {
      password: string;
      orderId: bigint;
      damaged: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminFlagOrderDamaged(password, orderId, damaged);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-orders", vars.password],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-damaged-orders", vars.password],
      });
      toast.success("Order damage flag updated.");
    },
  });
}

// Admin: Damaged Orders
export function useAdminDamagedOrders(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["admin-damaged-orders", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.adminGetDamagedOrders(password);
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Admin: Out of Stock Products
export function useAdminOutOfStock(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ["admin-out-of-stock", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.adminGetOutOfStockProducts(password);
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Admin: All Reviews (across all products)
export function useAdminAllReviews(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AdminReview[]>({
    queryKey: ["admin-all-reviews", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      const reviews = await actor.adminGetAllReviews(password);
      return reviews.map((r) => ({
        id: Number(r.id),
        productId: r.productId,
        reviewerName: r.reviewerName,
        rating: Number(r.rating),
        text: r.text,
        timestamp: r.timestamp,
      }));
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Admin: Dashboard Stats — merges backend order stats with frontend catalog counts
export function useAdminDashboardStats(password: string) {
  const { actor, isFetching } = useActor();
  // Import ALL_PRODUCTS inline to avoid circular deps — resolved at runtime
  return useQuery<DashboardStats | null>({
    queryKey: ["admin-dashboard-stats", password],
    queryFn: async () => {
      if (!actor || !password) return null;
      // Dynamically import the product catalog to get accurate counts
      const { ALL_PRODUCTS } = await import("@/data/products");
      const stats = await actor.adminGetDashboardStats(password);

      // Get backend out-of-stock overrides
      let outOfStockIds: Set<string> = new Set();
      try {
        const oosItems = await actor.adminGetOutOfStockProducts(password);
        outOfStockIds = new Set(oosItems.map((i) => i.productId));
      } catch {
        // ignore — if this fails, treat all as in-stock
      }

      const totalProducts = ALL_PRODUCTS.length;
      const outOfStockCount = outOfStockIds.size;
      const inStockCount = totalProducts - outOfStockCount;

      return {
        totalProducts,
        inStockCount,
        totalOrders: stats ? Number(stats.totalOrders) : 0,
        uniqueCustomers: stats ? Number(stats.uniqueCustomers) : 0,
        deliveredOrders: stats ? Number(stats.deliveredOrders) : 0,
        refundedOrders: stats ? Number(stats.refundedOrders) : 0,
        cancelledOrders: stats ? Number(stats.cancelledOrders) : 0,
        damagedOrders: stats ? Number(stats.damagedOrders) : 0,
      };
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Admin: Inventory from frontend catalog — overlaid with backend stock overrides
export function useAdminCatalogInventory(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<{
      productId: string;
      name: string;
      brand: string;
      category: string;
      price: number;
      image: string;
      inStock: boolean;
      updatedAt: bigint;
    }>
  >({
    queryKey: ["admin-catalog-inventory", password],
    queryFn: async () => {
      const { ALL_PRODUCTS } = await import("@/data/products");

      // Try to get backend overrides (which products were explicitly toggled)
      let overrides: Map<string, boolean> = new Map();
      if (actor && password) {
        try {
          const backendItems = await actor.adminGetInventory(password);
          for (const item of backendItems) {
            overrides.set(item.productId, item.inStock);
          }
        } catch {
          // ignore — fall back to all in-stock
        }
      }

      const now = BigInt(Date.now()) * BigInt(1_000_000);
      return ALL_PRODUCTS.map((p) => ({
        productId: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        image: p.image,
        inStock: overrides.has(p.id) ? (overrides.get(p.id) ?? true) : true,
        updatedAt: now,
      }));
    },
    enabled: !isFetching,
  });
}

// Stripe: Create Checkout Session
export function useCreateStripeSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (request: CreateCheckoutSessionRequest) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.createStripeCheckoutSession(request);
      if (result.__kind__ === "ok") return result.ok;
      throw new Error(result.err);
    },
  });
}

// Stripe: Verify Payment
export function useVerifyStripePayment() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.verifyStripePayment(sessionId);
    },
  });
}

// Admin: Update Order Payment Status
export function useAdminUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      orderId,
      stripeTransactionId,
    }: {
      password: string;
      orderId: bigint;
      stripeTransactionId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminUpdateOrderPaymentStatus(
        password,
        orderId,
        stripeTransactionId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}

export { OrderStatus };

// Admin: UPI Payments
export function useAdminGetUpiPayments(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UpiPaymentRecord[]>({
    queryKey: ["admin", "upi-payments", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      const records = await actor.adminGetUpiPayments(password);
      return records.map((r) => ({
        orderId: r.orderId,
        upiTransactionId: r.upiTransactionId,
        amount: r.amount,
        timestamp: r.timestamp,
        status: r.status,
      }));
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Record UPI Payment (user-facing: after scanning QR / completing UPI transfer)
export function useRecordUpiPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      upiTransactionId,
      amount,
    }: {
      orderId: bigint;
      upiTransactionId: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.recordUpiPayment(
        orderId,
        upiTransactionId,
        amount,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      toast.success("UPI payment recorded! Your order is confirmed. 🎉");
    },
    onError: () => {
      toast.error("Failed to record UPI payment. Please try again.");
    },
  });
}

// Admin: Alt Payments (PayPal, Razorpay, Cashfree)
export function useAdminAltPayments(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AltPaymentRecord[]>({
    queryKey: ["admin", "alt-payments", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      const records = await actor.adminGetAltPayments(password);
      return records.map((r) => ({
        orderId: r.orderId,
        paymentMethod: r.paymentMethod,
        transactionId: r.transactionId,
        amount: r.amount,
        timestamp: r.timestamp,
        status: r.status,
      }));
    },
    enabled: !!actor && !isFetching && !!password,
  });
}

// Record Alt Payment (user-facing: PayPal, Razorpay, Cashfree)
export function useRecordAltPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      paymentMethod,
      transactionId,
      amount,
      password,
    }: {
      orderId: bigint;
      paymentMethod: string;
      transactionId: string;
      amount: number;
      password: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.recordAltPayment(
        orderId,
        paymentMethod,
        transactionId,
        amount,
        password,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
    onError: () => {
      toast.error("Failed to record payment. Please try again.");
    },
  });
}

// Record Razorpay Payment — called after Razorpay Standard Checkout success/failure
// NOTE: recordRazorpayPayment will be available once backend bindings are regenerated (pnpm bindgen)
export function useRecordRazorpayPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: RazorpayPaymentRecord) => {
      if (!actor) throw new Error("Not connected");
      // Cast needed: backend method will be generated by bindgen — not yet in Backend type
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<boolean>
        >
      ).recordRazorpayPayment(
        record.razorpayPaymentId,
        record.razorpayOrderId,
        record.amount,
        record.email,
        record.orderId,
        record.items,
        record.paymentMethod,
        record.status,
        record.errorMessage,
      );
    },
    onSuccess: (_data, variables) => {
      if (variables.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      }
    },
    onError: () => {
      // Silent — payment confirmation saved best-effort; order already placed
    },
  });
}

// Admin: Razorpay Payments — full list for admin dashboard
// NOTE: adminGetRazorpayPayments will be available once backend bindings are regenerated (pnpm bindgen)
export function useAdminRazorpayPayments(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RazorpayPaymentRecord[]>({
    queryKey: ["admin", "razorpay-payments", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      // Cast needed: backend method will be generated by bindgen — not yet in Backend type
      return (
        actor as unknown as Record<
          string,
          (p: string) => Promise<RazorpayPaymentRecord[]>
        >
      ).adminGetRazorpayPayments(password);
    },
    enabled: !!actor && !isFetching && !!password,
  });
}
