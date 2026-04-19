import type { ContactSubmission, LoginEvent, Order } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OrderStatus,
  useAdminAllReviews,
  useAdminAltPayments,
  useAdminCatalogInventory,
  useAdminContacts,
  useAdminDamagedOrders,
  useAdminDashboardStats,
  useAdminFlagDamaged,
  useAdminGetUpiPayments,
  useAdminLoginHistory,
  useAdminMarkContactRead,
  useAdminOrders,
  useAdminRazorpayPayments,
  useAdminUpdateStatus,
  useAdminUpdateStock,
  useAdminVerifyPassword,
} from "@/hooks/useBackend";
import type {
  AdminReview,
  AltPaymentRecord,
  RazorpayPaymentRecord,
  UpiPaymentRecord,
} from "@/types";
import {
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Copy,
  CreditCard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Package,
  RefreshCcw,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | "overview"
  | "inventory"
  | "users"
  | "orders"
  | "razorpay_payments"
  | "reviews"
  | "contacts"
  | "damaged"
  | "outofstock";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: {
  id: Section;
  label: string;
  Icon: typeof Package;
}[] = [
  { id: "overview", label: "Overview", Icon: TrendingUp },
  { id: "inventory", label: "Inventory", Icon: Package },
  { id: "users", label: "User Logins", Icon: Users },
  { id: "orders", label: "Orders", Icon: ClipboardList },
  { id: "razorpay_payments", label: "Razorpay Payments", Icon: CreditCard },
  { id: "reviews", label: "Reviews", Icon: Star },
  { id: "contacts", label: "Contact Us", Icon: Mail },
  { id: "damaged", label: "Damaged Orders", Icon: AlertTriangle },
  { id: "outofstock", label: "Out of Stock", Icon: XCircle },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-accent/15 text-accent border-accent/30",
  confirmed: "bg-primary/10 text-primary border-primary/25",
  shipped: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  delivered: "bg-accent/20 text-foreground border-accent/35",
  cancelled: "bg-destructive/10 text-destructive border-destructive/25",
  refunded: "bg-muted text-muted-foreground border-border",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  hero,
  icon: Icon,
  subtitle,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  hero?: boolean;
  icon?: typeof Package;
  subtitle?: string;
}) {
  if (hero) {
    return (
      <div
        className="rounded-2xl p-5 sm:p-6 col-span-2 relative overflow-hidden border border-primary/30"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.48 0.25 254 / 0.15) 0%, oklch(0.58 0.20 280 / 0.10) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, oklch(0.78 0.18 254) 0%, transparent 65%)",
          }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1">
              {label}
            </p>
            <p className="text-4xl sm:text-5xl font-display font-extrabold text-primary leading-none">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-3 sm:p-4 border ${accent ? "bg-primary text-primary-foreground border-primary/40" : "bg-card border-border"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-medium mb-1 leading-tight ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}
          >
            {label}
          </p>
          <p
            className={`text-xl sm:text-2xl font-display font-extrabold ${accent ? "text-primary-foreground" : "text-foreground"}`}
          >
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-primary-foreground/20" : "bg-muted/60"}`}
          >
            <Icon
              className={`h-4 w-4 ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Table Wrapper ────────────────────────────────────────────────────────────

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[560px] text-xs sm:text-sm">
        {children}
      </table>
    </div>
  );
}

function Th({
  children,
  sticky,
}: { children: React.ReactNode; sticky?: boolean }) {
  return (
    <th
      className={`px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border whitespace-nowrap ${sticky ? "sticky left-0 z-10 bg-muted/60 backdrop-blur-sm" : ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  sticky,
}: { children: React.ReactNode; className?: string; sticky?: boolean }) {
  return (
    <td
      className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/50 last:border-0 text-foreground ${sticky ? "sticky left-0 z-10 bg-card" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="px-4 py-10 text-center text-muted-foreground text-sm"
      >
        {message}
      </td>
    </tr>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
      title="Copy to clipboard"
    >
      <Copy className={`h-3 w-3 ${copied ? "text-accent" : ""}`} />
    </button>
  );
}

// ─── Section: Overview ────────────────────────────────────────────────────────

function OverviewSection({ password }: { password: string }) {
  const { data: stats, isLoading } = useAdminDashboardStats(password);
  const { data: orders = [] } = useAdminOrders(password);
  const { data: loginEvents = [] } = useAdminLoginHistory(password);
  const { data: rzpPayments = [] } = useAdminRazorpayPayments(password);

  const recentOrders = [...orders]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 5);

  const rzpRevenue = rzpPayments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount / 100, 0); // paise → rupees
  const rzpTxnCount = rzpPayments.length;

  return (
    <div>
      <SectionHeader
        title="Dashboard Overview"
        subtitle="At-a-glance metrics for V-7 Shop"
      />

      {/* Stats grid — Total Products hero + supporting cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Row 1: core stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-3">
            <StatCard
              label="Total Products"
              value={stats?.totalProducts ?? 0}
              hero
              icon={Package}
              subtitle="Items across all categories"
            />
            <StatCard
              label="In Stock"
              value={stats?.inStockCount ?? 0}
              accent
              icon={ShoppingBag}
            />
            <StatCard
              label="Total Orders"
              value={stats?.totalOrders ?? 0}
              icon={CheckSquare}
            />
            <StatCard
              label="Customers"
              value={stats?.uniqueCustomers ?? 0}
              icon={Users}
            />
          </div>
          {/* Row 2: order breakdown stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
            <div className="rounded-xl p-3 sm:p-4 border bg-card border-border">
              <p className="text-xs font-medium mb-1 text-green-600">
                Delivered
              </p>
              <p className="text-xl sm:text-2xl font-display font-extrabold text-foreground flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {stats?.deliveredOrders ?? 0}
              </p>
            </div>
            <div className="rounded-xl p-3 sm:p-4 border bg-card border-border">
              <p className="text-xs font-medium mb-1 text-blue-600">Refunded</p>
              <p className="text-xl sm:text-2xl font-display font-extrabold text-foreground flex items-center gap-1.5">
                <RefreshCcw className="h-4 w-4 text-blue-500" />
                {stats?.refundedOrders ?? 0}
              </p>
            </div>
            <div className="rounded-xl p-3 sm:p-4 border bg-card border-border">
              <p className="text-xs font-medium mb-1 text-destructive">
                Cancelled
              </p>
              <p className="text-xl sm:text-2xl font-display font-extrabold text-foreground flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-destructive" />
                {stats?.cancelledOrders ?? 0}
              </p>
            </div>
            <div className="rounded-xl p-3 sm:p-4 border bg-card border-border">
              <p className="text-xs font-medium mb-1 text-orange-600">
                Damaged
              </p>
              <p className="text-xl sm:text-2xl font-display font-extrabold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                {stats?.damagedOrders ?? 0}
              </p>
            </div>
          </div>
          {/* Row 3: Razorpay stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
            <div className="rounded-xl p-3 sm:p-4 border bg-card border-indigo-200/60">
              <p className="text-xs font-medium mb-1 text-indigo-600 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Razorpay Revenue
              </p>
              <p className="text-xl sm:text-2xl font-display font-extrabold text-foreground">
                ₹{rzpRevenue.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-xl p-3 sm:p-4 border bg-card border-indigo-200/60">
              <p className="text-xs font-medium mb-1 text-indigo-600 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Razorpay Transactions
              </p>
              <p className="text-xl sm:text-2xl font-display font-extrabold text-foreground">
                {rzpTxnCount}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Two-panel quick overview */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-display font-bold text-foreground mb-3">
            Recent Orders
          </p>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No orders yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div
                  key={o.id.toString()}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-mono text-muted-foreground">
                    #{o.id.toString()}
                  </span>
                  <span className="text-foreground font-medium truncate flex-1 text-right">
                    ₹{o.total.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[o.status] ?? "bg-muted text-muted-foreground border-border"}`}
                  >
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Login Activity */}
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-display font-bold text-foreground mb-3">
            Recent Logins ({loginEvents.length} total)
          </p>
          {loginEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No login events yet
            </p>
          ) : (
            <div className="space-y-2">
              {[...loginEvents]
                .sort((a, b) => Number(b.timestamp - a.timestamp))
                .slice(0, 5)
                .map((e) => (
                  <div
                    key={`${e.principal.toString()}-${e.timestamp.toString()}`}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${e.method === "admin" ? "bg-red-500" : "bg-primary"}`}
                      >
                        {e.method === "admin"
                          ? "A"
                          : (e.displayName?.[0] ?? "U")}
                      </div>
                      <span className="truncate text-foreground">
                        {e.displayName ??
                          `${e.principal.toString().slice(0, 10)}…`}
                      </span>
                    </div>
                    <span className="text-muted-foreground whitespace-nowrap shrink-0">
                      {new Date(
                        Number(e.timestamp / BigInt(1_000_000)),
                      ).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Inventory ───────────────────────────────────────────────────────

function InventorySection({ password }: { password: string }) {
  const { data: items = [], isLoading } = useAdminCatalogInventory(password);
  const updateStock = useAdminUpdateStock();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.productId.toLowerCase().includes(search.toLowerCase()) ||
      i.brand.toLowerCase().includes(search.toLowerCase()),
  );
  const inStockCount = items.filter((i) => i.inStock).length;
  const outOfStockCount = items.length - inStockCount;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const prevSearch = React.useRef(search);
  if (prevSearch.current !== search) {
    prevSearch.current = search;
    setPage(1);
  }

  return (
    <div>
      <SectionHeader
        title="Inventory Management"
        subtitle="All products from catalog with stock status"
      />
      {/* Prominent inventory summary banner */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4 flex flex-wrap items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm font-display font-bold text-foreground">
            Total:{" "}
            <span className="text-primary text-base">
              {items.length.toLocaleString("en-IN")}
            </span>{" "}
            products
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-xs text-foreground font-semibold">
            {inStockCount.toLocaleString("en-IN")} in stock
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span className="text-xs text-foreground font-semibold">
            {outOfStockCount.toLocaleString("en-IN")} out of stock
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
        <StatCard
          label="Total Products"
          value={items.length.toLocaleString("en-IN")}
          accent
        />
        <StatCard
          label="In Stock"
          value={inStockCount.toLocaleString("en-IN")}
        />
        <StatCard
          label="Out of Stock"
          value={outOfStockCount.toLocaleString("en-IN")}
        />
      </div>
      <div className="mb-3 sm:mb-4">
        <Input
          placeholder="Search by name, brand, or product ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm text-sm"
          data-ocid="inventory-search"
        />
      </div>
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th sticky>Product</Th>
                <Th>Brand</Th>
                <Th>Price</Th>
                <Th>Stock Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {!pageItems.length ? (
                <EmptyRow cols={5} message="No products match your search" />
              ) : (
                pageItems.map((item) => (
                  <CatalogInventoryRow
                    key={item.productId}
                    item={item}
                    onToggleStock={() =>
                      updateStock.mutate({
                        password,
                        productId: item.productId,
                        inStock: !item.inStock,
                      })
                    }
                  />
                ))
              )}
            </tbody>
          </TableWrap>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                Showing {((page - 1) * PAGE_SIZE + 1).toLocaleString("en-IN")}–
                {Math.min(page * PAGE_SIZE, filtered.length).toLocaleString(
                  "en-IN",
                )}{" "}
                of {filtered.length.toLocaleString("en-IN")} products
              </span>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 text-xs"
                  data-ocid="inventory-pagination-prev"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-xs font-medium text-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs"
                  data-ocid="inventory-pagination-next"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CatalogInventoryRow({
  item,
  onToggleStock,
}: {
  item: {
    productId: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    image: string;
    inStock: boolean;
    updatedAt: bigint;
  };
  onToggleStock: () => void;
}) {
  return (
    <tr
      className={`transition-colors ${item.inStock ? "hover:bg-muted/10" : "bg-red-50/30 hover:bg-red-50/50"}`}
      data-ocid={`inventory-row-${item.productId}`}
    >
      <Td sticky>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded bg-muted/40 overflow-hidden shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <span className="text-xs font-medium text-foreground truncate max-w-[120px] sm:max-w-[200px]">
            {item.name}
          </span>
        </div>
      </Td>
      <Td>
        <span className="text-xs text-muted-foreground capitalize">
          {item.brand}
        </span>
      </Td>
      <Td className="text-xs font-semibold whitespace-nowrap">
        ₹{item.price.toLocaleString("en-IN")}
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
              item.inStock
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {item.inStock ? (
              <CheckCircle className="h-3 w-3 shrink-0" />
            ) : (
              <XCircle className="h-3 w-3 shrink-0" />
            )}
            {item.inStock ? "In Stock" : "Out of Stock"}
          </span>
          <button
            type="button"
            onClick={onToggleStock}
            className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline transition-colors min-h-[24px]"
            data-ocid={`stock-toggle-${item.productId}`}
            title="Toggle stock status"
          >
            Toggle
          </button>
        </div>
      </Td>
      <Td>
        <span className="text-xs text-muted-foreground capitalize">
          {item.category}
        </span>
      </Td>
    </tr>
  );
}

// ─── Section: User Logins ─────────────────────────────────────────────────────

function UsersSection({ password }: { password: string }) {
  const { data: events = [], isLoading } = useAdminLoginHistory(password);
  const uniqueUsers = new Set(events.map((e) => e.principal.toString())).size;

  const sorted = [...events].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div>
      <SectionHeader
        title="User Logins"
        subtitle={`All ${events.length} login event${events.length !== 1 ? "s" : ""} — permanently saved`}
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <StatCard
          label="Total Login Events"
          value={events.length}
          accent
          icon={Users}
        />
        <StatCard label="Unique Users" value={uniqueUsers} icon={Users} />
      </div>
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th sticky>User</Th>
              <Th>Display Name</Th>
              <Th>Login Method</Th>
              <Th>Login Time</Th>
            </tr>
          </thead>
          <tbody>
            {!sorted.length ? (
              <EmptyRow cols={4} message="No login events yet" />
            ) : (
              sorted.map((event, idx) => (
                <UserRow
                  key={`${event.principal.toString()}-${event.timestamp.toString()}`}
                  event={event}
                  idx={idx}
                />
              ))
            )}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

function UserRow({ event, idx }: { event: LoginEvent; idx: number }) {
  const ts = new Date(
    Number(event.timestamp / BigInt(1_000_000)),
  ).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const isAdmin = event.method === "admin";
  const principal = event.principal.toString();
  const initial = isAdmin
    ? "A"
    : (event.displayName?.[0]?.toUpperCase() ??
      principal[0]?.toUpperCase() ??
      "U");
  const displayName = event.displayName ?? `User ${principal.slice(0, 8)}…`;

  return (
    <tr
      className="hover:bg-muted/10 transition-colors"
      data-ocid={`users.item.${idx + 1}`}
    >
      <Td sticky>
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${isAdmin ? "bg-red-500" : "bg-primary"}`}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <span className="font-mono text-xs truncate block max-w-[120px] sm:max-w-[180px]">
              {principal.slice(0, 16)}…
            </span>
          </div>
          <CopyButton text={principal} />
        </div>
      </Td>
      <Td>
        <span className="text-xs text-foreground truncate block max-w-[120px] sm:max-w-[160px]">
          {displayName}
        </span>
      </Td>
      <Td>
        <Badge
          className={`text-xs border whitespace-nowrap ${isAdmin ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
        >
          {isAdmin ? "Admin" : "Internet Identity"}
        </Badge>
      </Td>
      <Td className="text-muted-foreground text-xs whitespace-nowrap">{ts}</Td>
    </tr>
  );
}

// ─── Section: Orders ──────────────────────────────────────────────────────────

const STATUS_OPTS = [
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.confirmed, label: "Confirmed" },
  { value: OrderStatus.shipped, label: "Shipped" },
  { value: OrderStatus.delivered, label: "Delivered" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
  { value: OrderStatus.refunded, label: "Refunded" },
];

function OrdersSection({ password }: { password: string }) {
  const { data: allOrders = [], isLoading } = useAdminOrders(password);
  const { data: upiPayments = [] } = useAdminGetUpiPayments(password);
  const { data: altPayments = [] } = useAdminAltPayments(password);
  const updateStatus = useAdminUpdateStatus();
  const flagDamaged = useAdminFlagDamaged();
  const [statusFilter, setStatusFilter] = useState("all");

  const orders =
    statusFilter === "all"
      ? allOrders
      : allOrders.filter((o) => o.status === statusFilter);

  const counts = STATUS_OPTS.reduce(
    (acc, s) => {
      acc[s.value] = allOrders.filter((o) => o.status === s.value).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      <SectionHeader title="All Orders" subtitle="Complete order management" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <StatCard label="Total" value={allOrders.length} accent />
        {STATUS_OPTS.map((s) => (
          <StatCard
            key={s.value}
            label={s.label}
            value={counts[s.value] ?? 0}
          />
        ))}
      </div>

      <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-3 sm:mb-4">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border transition-colors min-h-[32px] ${statusFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/30"}`}
          data-ocid="orders-filter-all"
        >
          All
        </button>
        {STATUS_OPTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatusFilter(s.value)}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border transition-colors min-h-[32px] ${statusFilter === s.value ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/30"}`}
            data-ocid={`orders-filter-${s.value}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <EnhancedOrderTable
          orders={orders}
          password={password}
          updateStatus={updateStatus}
          flagDamaged={flagDamaged}
        />
      )}

      {/* UPI Payments Sub-section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <h3 className="text-sm font-display font-bold text-foreground">
            UPI / QR Payments
          </h3>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs border ml-1">
            {upiPayments.length} record{upiPayments.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <UpiPaymentsTable payments={upiPayments} />
      </div>

      {/* Alt Payments Sub-section (PayPal / Cashfree) */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <h3 className="text-sm font-display font-bold text-foreground">
            Alt Payments (PayPal / Cashfree)
          </h3>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs border ml-1">
            {altPayments.length} record{altPayments.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <AltPaymentsTable payments={altPayments} />
      </div>
    </div>
  );
}

// ─── UPI Payments Table ───────────────────────────────────────────────────────

function UpiPaymentsTable({ payments }: { payments: UpiPaymentRecord[] }) {
  if (!payments.length) {
    return (
      <div
        className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground"
        data-ocid="upi-payments.empty_state"
      >
        No UPI payments recorded yet
      </div>
    );
  }

  const sorted = [...payments].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <TableWrap>
      <thead>
        <tr>
          <Th sticky>Order ID</Th>
          <Th>UPI Transaction ID</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
          <Th>Date</Th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((p, idx) => {
          const ts = new Date(
            Number(p.timestamp / BigInt(1_000_000)),
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const isPaid =
            p.status.toLowerCase() === "paid" ||
            p.status.toLowerCase() === "success";
          return (
            <tr
              key={`${p.orderId.toString()}-${idx}`}
              className="hover:bg-muted/10 transition-colors"
              data-ocid={`upi-payments.item.${idx + 1}`}
            >
              <Td sticky>
                <span className="font-mono text-xs">
                  #{p.orderId.toString()}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-1 min-w-0">
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs border font-mono truncate max-w-[140px]">
                    {p.upiTransactionId}
                  </Badge>
                  <CopyButton text={p.upiTransactionId} />
                </div>
              </Td>
              <Td className="font-semibold whitespace-nowrap">
                ₹{(Number(p.amount) / 100).toLocaleString("en-IN")}
              </Td>
              <Td>
                <Badge
                  className={`text-xs border whitespace-nowrap ${isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
                >
                  {p.status}
                </Badge>
              </Td>
              <Td className="text-muted-foreground text-xs whitespace-nowrap">
                {ts}
              </Td>
            </tr>
          );
        })}
      </tbody>
    </TableWrap>
  );
}

function AltPaymentsTable({ payments }: { payments: AltPaymentRecord[] }) {
  if (!payments.length) {
    return (
      <div
        className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground"
        data-ocid="alt-payments.empty_state"
      >
        No alt payments (PayPal/Razorpay/Cashfree) recorded yet
      </div>
    );
  }

  const sorted = [...payments].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <TableWrap>
      <thead>
        <tr>
          <Th sticky>Order ID</Th>
          <Th>Method</Th>
          <Th>Transaction ID</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
          <Th>Date</Th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((p, idx) => {
          const ts = new Date(
            Number(p.timestamp / BigInt(1_000_000)),
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const isPaid =
            p.status.toLowerCase() === "confirmed" ||
            p.status.toLowerCase() === "paid";
          const methodColors: Record<string, string> = {
            paypal: "bg-blue-50 text-blue-700 border-blue-200",
            razorpay: "bg-indigo-50 text-indigo-700 border-indigo-200",
            cashfree: "bg-green-50 text-green-700 border-green-200",
          };
          return (
            <tr
              key={`${p.orderId.toString()}-${idx}`}
              className="hover:bg-muted/10 transition-colors"
              data-ocid={`alt-payments.item.${idx + 1}`}
            >
              <Td sticky>
                <span className="font-mono text-xs">
                  #{p.orderId.toString()}
                </span>
              </Td>
              <Td>
                <Badge
                  className={`text-xs border whitespace-nowrap capitalize ${methodColors[p.paymentMethod] ?? "bg-muted text-muted-foreground border-border"}`}
                >
                  {p.paymentMethod}
                </Badge>
              </Td>
              <Td>
                <div className="flex items-center gap-1 min-w-0">
                  <Badge className="bg-muted text-foreground border-border text-xs border font-mono truncate max-w-[140px]">
                    {p.transactionId}
                  </Badge>
                  <CopyButton text={p.transactionId} />
                </div>
              </Td>
              <Td className="font-semibold whitespace-nowrap">
                ₹{p.amount.toLocaleString("en-IN")}
              </Td>
              <Td>
                <Badge
                  className={`text-xs border whitespace-nowrap ${isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
                >
                  {p.status}
                </Badge>
              </Td>
              <Td className="text-muted-foreground text-xs whitespace-nowrap">
                {ts}
              </Td>
            </tr>
          );
        })}
      </tbody>
    </TableWrap>
  );
}

// ─── Section: Razorpay Payments ───────────────────────────────────────────────

function RazorpayPaymentsSection({ password }: { password: string }) {
  const { data: payments = [], isLoading } = useAdminRazorpayPayments(password);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const sorted = [...payments].sort((a, b) => b.timestamp - a.timestamp);

  const successPayments = sorted.filter((p) => p.status === "success");
  const failedPayments = sorted.filter((p) => p.status === "failed");
  const totalRevenue = successPayments.reduce(
    (sum, p) => sum + p.amount / 100,
    0,
  );

  return (
    <div>
      <SectionHeader
        title="Razorpay Payments"
        subtitle="All Razorpay Standard Checkout transactions — success and failed"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <StatCard
          label="Total Transactions"
          value={sorted.length}
          accent
          icon={CreditCard}
        />
        <StatCard
          label="Razorpay Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={TrendingUp}
        />
        <StatCard label="Successful" value={successPayments.length} />
        <StatCard label="Failed" value={failedPayments.length} />
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : !sorted.length ? (
        <div
          className="rounded-xl border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground"
          data-ocid="razorpay-payments.empty_state"
        >
          <CreditCard className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium">No Razorpay transactions yet</p>
          <p className="text-xs mt-1 text-muted-foreground/60">
            Transactions will appear here after users pay via Razorpay checkout
          </p>
        </div>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th sticky>Date</Th>
              <Th>Payment ID</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Method</Th>
              <Th>User</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, idx) => {
              const ts = new Date(
                Number(p.timestamp) / 1_000_000,
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const isSuccess = p.status === "success";
              const isExpanded = expandedIdx === idx;
              const rowKey =
                p.razorpayPaymentId || `rzp-${p.orderId}-${p.timestamp}`;

              return (
                <React.Fragment key={rowKey}>
                  <tr
                    className="hover:bg-muted/10 transition-colors cursor-pointer"
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        setExpandedIdx(isExpanded ? null : idx);
                    }}
                    data-ocid={`razorpay-payments.item.${idx + 1}`}
                  >
                    <Td sticky>
                      <div className="flex items-center gap-1">
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {ts}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      {p.razorpayPaymentId ? (
                        <div className="flex items-center gap-1 min-w-0">
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs border font-mono truncate max-w-[120px]">
                            {p.razorpayPaymentId.slice(0, 14)}…
                          </Badge>
                          <CopyButton text={p.razorpayPaymentId} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </Td>
                    <Td className="font-semibold whitespace-nowrap">
                      ₹{(p.amount / 100).toLocaleString("en-IN")}
                    </Td>
                    <Td>
                      <Badge
                        className={`text-xs border whitespace-nowrap ${
                          isSuccess
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {isSuccess ? "✓ Success" : "✗ Failed"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs border capitalize whitespace-nowrap">
                        {p.paymentMethod}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-mono text-xs text-muted-foreground truncate max-w-[80px]">
                          {p.userPrincipal
                            ? `${p.userPrincipal.slice(0, 10)}…`
                            : "—"}
                        </span>
                        {p.userPrincipal && (
                          <CopyButton text={p.userPrincipal} />
                        )}
                      </div>
                    </Td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr key={`${rowKey}-expanded`}>
                      <td
                        colSpan={6}
                        className="bg-muted/20 border-b border-border/50 px-4 sm:px-6 py-3"
                      >
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5 text-xs">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wide">
                              Transaction Details
                            </p>
                            <div className="space-y-1">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground w-24 shrink-0">
                                  Payment ID
                                </span>
                                <span className="font-mono text-foreground break-all">
                                  {p.razorpayPaymentId || "—"}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground w-24 shrink-0">
                                  Order ID
                                </span>
                                <span className="font-mono text-foreground">
                                  {p.razorpayOrderId || "—"}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground w-24 shrink-0">
                                  Shop Order
                                </span>
                                <span className="font-mono text-foreground">
                                  #{p.orderId}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground w-24 shrink-0">
                                  Email
                                </span>
                                <span className="font-mono text-foreground break-all">
                                  {p.email || "—"}
                                </span>
                              </div>
                              {!isSuccess && p.errorMessage && (
                                <div className="flex gap-2">
                                  <span className="text-muted-foreground w-24 shrink-0">
                                    Error
                                  </span>
                                  <span className="text-red-600 break-words">
                                    {p.errorMessage}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wide">
                              Items ({p.items.length})
                            </p>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                              {p.items.map((item, iidx) => (
                                <div
                                  key={`${item.productId}-${p.razorpayPaymentId || idx}-${iidx}`}
                                  className="flex items-center gap-2 bg-card rounded px-2 py-1.5 border border-border/40"
                                >
                                  <div className="w-6 h-6 rounded bg-muted/60 flex items-center justify-center shrink-0">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-muted-foreground">
                                      Qty: {item.quantity.toString()} · ₹
                                      {item.price.toLocaleString("en-IN")}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

function DamagedOrdersSection({ password }: { password: string }) {
  const { data: allOrders = [], isLoading } = useAdminDamagedOrders(password);
  const updateStatus = useAdminUpdateStatus();
  const flagDamaged = useAdminFlagDamaged();

  return (
    <div>
      <SectionHeader
        title="Damaged Orders"
        subtitle="Orders flagged as damaged or problematic"
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 sm:max-w-xs">
        <StatCard label="Damaged Orders" value={allOrders.length} accent />
      </div>
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <EnhancedOrderTable
          orders={allOrders}
          password={password}
          updateStatus={updateStatus}
          flagDamaged={flagDamaged}
          damagedOnly
        />
      )}
    </div>
  );
}

function EnhancedOrderTable({
  orders,
  password,
  updateStatus,
  flagDamaged,
  damagedOnly = false,
}: {
  orders: Order[];
  password: string;
  updateStatus: ReturnType<typeof useAdminUpdateStatus>;
  flagDamaged: ReturnType<typeof useAdminFlagDamaged>;
  damagedOnly?: boolean;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <TableWrap>
      <thead>
        <tr>
          <Th sticky>Order ID</Th>
          <Th>Customer</Th>
          <Th>Date</Th>
          <Th>Items</Th>
          <Th>Total</Th>
          <Th>Payment</Th>
          <Th>Stripe Txn</Th>
          <Th>Status</Th>
          <Th>Damaged</Th>
          {damagedOnly && <Th>Actions</Th>}
        </tr>
      </thead>
      <tbody>
        {!orders.length ? (
          <EmptyRow cols={damagedOnly ? 10 : 9} message="No orders found" />
        ) : (
          orders.map((order) => {
            const idStr = order.id.toString();
            const isExpanded = expandedIds.has(idStr);
            const principal =
              typeof order.userId === "string"
                ? order.userId
                : order.userId.toText();

            return (
              <React.Fragment key={idStr}>
                <tr
                  className="hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(idStr)}
                  onKeyDown={(e) => e.key === "Enter" && toggleExpand(idStr)}
                  data-ocid={`order-row-${order.id}`}
                >
                  <Td sticky>
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-mono text-xs whitespace-nowrap">
                        #{idStr}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-mono text-xs truncate max-w-[80px] text-muted-foreground">
                        {principal.slice(0, 10)}…
                      </span>
                      <CopyButton text={principal} />
                    </div>
                  </Td>
                  <Td className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(
                      Number(order.createdAt / BigInt(1_000_000)),
                    ).toLocaleDateString("en-IN")}
                  </Td>
                  <Td className="text-xs whitespace-nowrap">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </Td>
                  <Td className="font-semibold whitespace-nowrap">
                    ₹{order.total.toLocaleString("en-IN")}
                  </Td>
                  <Td>
                    {order.paymentMethod === "online" ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs border whitespace-nowrap flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Online/Stripe
                      </Badge>
                    ) : order.paymentMethod === "upi" ? (
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs border whitespace-nowrap flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> UPI
                      </Badge>
                    ) : order.paymentMethod === "paypal" ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs border whitespace-nowrap">
                        PayPal
                      </Badge>
                    ) : order.paymentMethod === "razorpay" ? (
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs border whitespace-nowrap">
                        Razorpay
                      </Badge>
                    ) : order.paymentMethod === "cashfree" ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs border whitespace-nowrap">
                        Cashfree
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground border-border text-xs border uppercase whitespace-nowrap">
                        COD
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    {order.stripeTransactionId ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs border font-mono truncate max-w-[100px]">
                          {order.stripeTransactionId.slice(0, 12)}…
                        </Badge>
                        <CopyButton text={order.stripeTransactionId} />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </Td>
                  <Td>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateStatus.mutate({
                          password,
                          orderId: order.id,
                          status: e.target.value as OrderStatus,
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className={`text-xs font-semibold px-1.5 sm:px-2 py-1 rounded-full border cursor-pointer outline-none min-h-[32px] ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground border-border"}`}
                      data-ocid={`status-select-${order.id}`}
                    >
                      {STATUS_OPTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        flagDamaged.mutate({
                          password,
                          orderId: order.id,
                          damaged: !order.isDamaged,
                        });
                      }}
                      className={`text-xs px-1.5 sm:px-2 py-1 rounded-full border font-semibold transition-colors min-h-[32px] whitespace-nowrap ${
                        order.isDamaged
                          ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                      }`}
                      data-ocid={`damage-toggle-${order.id}`}
                    >
                      {order.isDamaged ? "⚠ Dmg" : "OK"}
                    </button>
                  </Td>
                  {damagedOnly && (
                    <Td>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          flagDamaged.mutate({
                            password,
                            orderId: order.id,
                            damaged: false,
                          });
                        }}
                        data-ocid={`unflag-damage-${order.id}`}
                      >
                        Remove Flag
                      </Button>
                    </Td>
                  )}
                </tr>

                {/* Expanded items row */}
                {isExpanded && (
                  <tr key={`${idStr}-expanded`}>
                    <td
                      colSpan={damagedOnly ? 10 : 9}
                      className="bg-muted/20 border-b border-border/50 px-4 sm:px-6 py-3"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Order Items
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={`${item.productId}-${idx}`}
                            className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border/40 text-xs"
                          >
                            <div className="w-8 h-8 rounded bg-muted/60 flex items-center justify-center shrink-0">
                              <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {item.name}
                              </p>
                              <p className="text-muted-foreground">
                                Qty: {item.quantity.toString()} · ₹
                                {item.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <span className="font-semibold text-foreground shrink-0">
                              ₹
                              {(
                                item.price * Number(item.quantity)
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                      {order.address && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📍{" "}
                          {order.address.houseNumber
                            ? `${order.address.houseNumber}, `
                            : ""}
                          {order.address.city}, {order.address.state} —{" "}
                          {order.address.pin}
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })
        )}
      </tbody>
    </TableWrap>
  );
}

// ─── Section: Reviews ─────────────────────────────────────────────────────────

type ReviewSortKey = "newest" | "oldest" | "highest";

function ReviewsSection({ password }: { password: string }) {
  const { data: reviews = [], isLoading } = useAdminAllReviews(password);
  const [sort, setSort] = useState<ReviewSortKey>("newest");

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "newest") return Number(b.timestamp - a.timestamp);
    if (sort === "oldest") return Number(a.timestamp - b.timestamp);
    return b.rating - a.rating;
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div>
      <SectionHeader
        title="Customer Reviews"
        subtitle={`${reviews.length} review${reviews.length !== 1 ? "s" : ""} across all products`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <StatCard
          label="Total Reviews"
          value={reviews.length}
          accent
          icon={Star}
        />
        <StatCard
          label="Average Rating"
          value={reviews.length > 0 ? `${avgRating.toFixed(1)} ★` : "—"}
        />
        <StatCard
          label="5-Star Reviews"
          value={reviews.filter((r) => r.rating === 5).length}
        />
      </div>

      {/* Sort controls */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-3 sm:mb-4">
        {(
          [
            { key: "newest", label: "Newest First" },
            { key: "oldest", label: "Oldest First" },
            { key: "highest", label: "Highest Rating" },
          ] as { key: ReviewSortKey; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border transition-colors min-h-[32px] ${sort === key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/30"}`}
            data-ocid={`reviews-sort-${key}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th sticky>Product ID</Th>
              <Th>Reviewer</Th>
              <Th>Rating</Th>
              <Th>Review</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {!sorted.length ? (
              <EmptyRow
                cols={5}
                message="No reviews yet — customers will leave reviews on product pages"
              />
            ) : (
              sorted.map((review, idx) => (
                <ReviewRow key={review.id} review={review} idx={idx} />
              ))
            )}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

function ReviewRow({ review, idx }: { review: AdminReview; idx: number }) {
  const ts = new Date(
    Number(review.timestamp / BigInt(1_000_000)),
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr
      className="hover:bg-muted/10 transition-colors"
      data-ocid={`reviews.item.${idx + 1}`}
    >
      <Td sticky>
        <span className="font-mono text-xs truncate block max-w-[120px] sm:max-w-[160px]">
          {review.productId}
        </span>
      </Td>
      <Td>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {review.reviewerName[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-xs text-foreground font-medium truncate max-w-[80px] sm:max-w-none">
            {review.reviewerName}
          </span>
        </div>
      </Td>
      <Td>
        <Stars rating={review.rating} />
      </Td>
      <Td>
        <span
          className="line-clamp-2 text-xs text-foreground max-w-[160px] sm:max-w-[240px] block"
          title={review.text}
        >
          {review.text || "—"}
        </span>
      </Td>
      <Td className="text-muted-foreground text-xs whitespace-nowrap">{ts}</Td>
    </tr>
  );
}

// ─── Section: Contact Us ──────────────────────────────────────────────────────

function ContactsSection({ password }: { password: string }) {
  const { data: contacts = [], isLoading } = useAdminContacts(password);
  const markRead = useAdminMarkContactRead();
  const unread = contacts.filter((c) => !c.isRead).length;

  return (
    <div>
      <SectionHeader
        title="Contact Us Submissions"
        subtitle="Customer inquiries and messages"
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <StatCard label="Total Submissions" value={contacts.length} accent />
        <StatCard label="Unread" value={unread} />
      </div>
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th sticky>Name</Th>
              <Th>Email</Th>
              <Th>Message</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {!contacts.length ? (
              <EmptyRow cols={6} message="No contact submissions yet" />
            ) : (
              contacts.map((c) => (
                <ContactRow
                  key={c.id.toString()}
                  contact={c}
                  onMarkRead={() =>
                    markRead.mutate(
                      { password, id: c.id },
                      { onSuccess: () => toast.success("Marked as read.") },
                    )
                  }
                />
              ))
            )}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

function ContactRow({
  contact,
  onMarkRead,
}: {
  contact: ContactSubmission;
  onMarkRead: () => void;
}) {
  const ts = new Date(
    Number(contact.submittedAt / BigInt(1_000_000)),
  ).toLocaleDateString("en-IN");
  return (
    <tr
      className={`hover:bg-muted/10 transition-colors ${!contact.isRead ? "bg-blue-50/30" : ""}`}
      data-ocid={`contact-row-${contact.id}`}
    >
      <Td sticky className="font-medium whitespace-nowrap">
        {contact.name}
      </Td>
      <Td className="text-muted-foreground text-xs max-w-[120px] sm:max-w-none truncate">
        {contact.email}
      </Td>
      <Td>
        <span
          className="line-clamp-2 text-xs text-foreground max-w-[140px] sm:max-w-[200px] block"
          title={contact.message}
        >
          {contact.message}
        </span>
      </Td>
      <Td className="text-muted-foreground text-xs whitespace-nowrap">{ts}</Td>
      <Td>
        <Badge
          className={`text-xs border whitespace-nowrap ${contact.isRead ? "bg-muted text-muted-foreground border-border" : "bg-green-50 text-green-700 border-green-200"}`}
        >
          {contact.isRead ? "Read" : "New"}
        </Badge>
      </Td>
      <Td>
        {!contact.isRead && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMarkRead}
            className="h-8 text-xs whitespace-nowrap"
            data-ocid={`mark-read-${contact.id}`}
          >
            Mark Read
          </Button>
        )}
      </Td>
    </tr>
  );
}

// ─── Section: Out of Stock ────────────────────────────────────────────────────

function OutOfStockSection({ password }: { password: string }) {
  const { data: catalogItems = [], isLoading } =
    useAdminCatalogInventory(password);
  const updateStock = useAdminUpdateStock();

  // Only show items that were explicitly toggled out of stock
  const oosItems = catalogItems.filter((i) => !i.inStock);

  return (
    <div>
      <SectionHeader
        title="Out of Stock Products"
        subtitle="Products explicitly marked unavailable — toggle stock in Inventory to update"
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 sm:max-w-xs">
        <StatCard label="Out of Stock Count" value={oosItems.length} accent />
      </div>
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th sticky>Product</Th>
              <Th>Brand</Th>
              <Th>Price</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {!oosItems.length ? (
              <EmptyRow
                cols={4}
                message="All products are currently in stock! Use Inventory to mark items out of stock."
              />
            ) : (
              oosItems.map((item) => (
                <tr
                  key={item.productId}
                  className="bg-red-50/30 hover:bg-red-50/50 transition-colors"
                  data-ocid={`oos-row-${item.productId}`}
                >
                  <Td sticky>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded bg-muted/40 overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                        {item.name}
                      </span>
                    </div>
                  </Td>
                  <Td className="text-xs text-muted-foreground capitalize">
                    {item.brand}
                  </Td>
                  <Td className="text-xs font-semibold whitespace-nowrap">
                    ₹{item.price.toLocaleString("en-IN")}
                  </Td>
                  <Td>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs whitespace-nowrap"
                      onClick={() =>
                        updateStock.mutate({
                          password,
                          productId: item.productId,
                          inStock: true,
                        })
                      }
                      data-ocid={`restore-stock-${item.productId}`}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-600 shrink-0" />
                      <span className="hidden sm:inline">Restore </span>Stock
                    </Button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ rows }: { rows: number }) {
  const skels = Array.from({ length: rows }, (_, i) => `sk${i}`);
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      {skels.map((id) => (
        <div key={id} className="flex gap-3 items-center">
          <Skeleton className="h-4 flex-1 rounded" />
          <Skeleton className="h-4 w-16 sm:w-24 rounded" />
          <Skeleton className="h-4 w-12 sm:w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar Nav Content ──────────────────────────────────────────────────────

function SidebarContent({
  active,
  onSelect,
  onLogout,
}: {
  active: Section;
  onSelect: (s: Section) => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div
        className="px-5 py-5 border-b shrink-0"
        style={{ borderColor: "oklch(0.25 0.01 260)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-extrabold text-sm shrink-0"
            style={{ background: "oklch(0.48 0.25 254)" }}
          >
            V7
          </div>
          <div className="min-w-0">
            <p className="text-white font-display font-bold text-sm leading-none truncate">
              V-7 Shop
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.55 0.01 260)" }}
            >
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left min-h-[44px]"
              style={{
                background: isActive
                  ? "oklch(0.48 0.25 254 / 0.2)"
                  : "transparent",
                color: isActive
                  ? "oklch(0.78 0.18 254)"
                  : "oklch(0.65 0.01 260)",
              }}
              data-ocid={`sidebar-nav-${id}`}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{
                  color: isActive
                    ? "oklch(0.78 0.18 254)"
                    : "oklch(0.5 0.01 260)",
                }}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5 shrink-0">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
          style={{ color: "oklch(0.6 0.15 25)" }}
          data-ocid="admin-logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </>
  );
}

function DesktopSidebar({
  active,
  onSelect,
  onLogout,
}: {
  active: Section;
  onSelect: (s: Section) => void;
  onLogout: () => void;
}) {
  return (
    <aside
      className="hidden lg:flex w-64 min-h-screen flex-col shrink-0"
      style={{ background: "oklch(0.14 0.005 260)" }}
    >
      <SidebarContent active={active} onSelect={onSelect} onLogout={onLogout} />
    </aside>
  );
}

function MobileDrawer({
  active,
  onSelect,
  onLogout,
  open,
  onClose,
}: {
  active: Section;
  onSelect: (s: Section) => void;
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-ocid="admin-drawer-backdrop"
          />
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden"
            style={{ background: "oklch(0.14 0.005 260)" }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            data-ocid="admin-mobile-drawer"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
              data-ocid="admin-drawer-close"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent
              active={active}
              onSelect={(s) => {
                onSelect(s);
                onClose();
              }}
              onLogout={() => {
                onLogout();
                onClose();
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileTopBar({
  activeSection,
  onMenuOpen,
}: {
  activeSection: Section;
  onMenuOpen: () => void;
}) {
  const current = NAV_ITEMS.find((n) => n.id === activeSection);
  return (
    <div
      className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 z-30 bg-card/95 backdrop-blur-sm"
      data-ocid="admin-mobile-topbar"
    >
      <button
        type="button"
        onClick={onMenuOpen}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted/40 transition-colors"
        aria-label="Open navigation menu"
        data-ocid="admin-menu-open"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-white font-display font-extrabold text-xs shrink-0"
          style={{ background: "oklch(0.48 0.25 254)" }}
        >
          V7
        </div>
        <div className="min-w-0">
          <p className="text-sm font-display font-bold text-foreground leading-none truncate">
            {current?.label ?? "Admin"}
          </p>
          <p className="text-xs text-muted-foreground">V-7 Shop Admin</p>
        </div>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function AdminLogin({ onSuccess }: { onSuccess: (pw: string) => void }) {
  const [inputPw, setInputPw] = useState("");
  const [error, setError] = useState("");
  const verifyPw = useAdminVerifyPassword();

  const handleLogin = async () => {
    setError("");
    const ok = await verifyPw.mutateAsync(inputPw).catch(() => false);
    if (ok) {
      onSuccess(inputPw);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4 py-8"
      data-ocid="admin-login"
    >
      <motion.div
        className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg p-6 sm:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center mb-5 sm:mb-6">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-lg sm:text-xl"
            style={{ background: "oklch(0.48 0.25 254)" }}
          >
            V7
          </div>
        </div>

        <div className="text-center mb-5 sm:mb-6">
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">
            Admin Login
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            V-7 Shop Control Panel
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2 font-mono tracking-wider">
            :: justvishal
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="admin-password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              value={inputPw}
              onChange={(e) => setInputPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="mt-1.5 text-base sm:text-sm"
              data-ocid="admin-password-input"
            />
            {error && (
              <p
                className="text-destructive text-xs mt-1.5"
                data-ocid="admin-login-error"
              >
                {error}
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-full font-bold h-11 sm:h-10"
            disabled={!inputPw || verifyPw.isPending}
            data-ocid="admin-login-btn"
          >
            <Lock className="h-4 w-4 mr-2" />
            {verifyPw.isPending ? "Verifying…" : "Sign In"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!password) {
    return <AdminLogin onSuccess={(pw) => setPassword(pw)} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection password={password} />;
      case "inventory":
        return <InventorySection password={password} />;
      case "users":
        return <UsersSection password={password} />;
      case "orders":
        return <OrdersSection password={password} />;
      case "razorpay_payments":
        return <RazorpayPaymentsSection password={password} />;
      case "reviews":
        return <ReviewsSection password={password} />;
      case "contacts":
        return <ContactsSection password={password} />;
      case "damaged":
        return <DamagedOrdersSection password={password} />;
      case "outofstock":
        return <OutOfStockSection password={password} />;
    }
  };

  return (
    <div
      className="flex min-h-screen bg-background overflow-x-hidden"
      data-ocid="admin-dashboard"
    >
      <DesktopSidebar
        active={activeSection}
        onSelect={setActiveSection}
        onLogout={() => setPassword(null)}
      />

      <MobileDrawer
        active={activeSection}
        onSelect={setActiveSection}
        onLogout={() => setPassword(null)}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar
          activeSection={activeSection}
          onMenuOpen={() => setDrawerOpen(true)}
        />

        <main className="flex-1 min-w-0 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              className="p-4 sm:p-6 max-w-6xl w-full"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
