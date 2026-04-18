import type { Order } from "@/backend";
import { OrderStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancelOrder, useUserOrders } from "@/hooks/useBackend";
import { useIdentity } from "@/hooks/useIdentity";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    style: { background: string; color: string };
    icon: typeof Clock;
  }
> = {
  [OrderStatus.pending]: {
    label: "Pending",
    style: {
      background: "oklch(0.92 0.12 85 / 0.25)",
      color: "oklch(0.55 0.16 82)",
    },
    icon: Clock,
  },
  [OrderStatus.confirmed]: {
    label: "Confirmed",
    style: {
      background: "oklch(0.88 0.1 240 / 0.25)",
      color: "oklch(0.48 0.18 242)",
    },
    icon: CheckCircle,
  },
  [OrderStatus.shipped]: {
    label: "Shipped",
    style: {
      background: "oklch(0.88 0.1 295 / 0.25)",
      color: "oklch(0.5 0.2 295)",
    },
    icon: Truck,
  },
  [OrderStatus.delivered]: {
    label: "Delivered",
    style: {
      background: "oklch(0.88 0.1 142 / 0.25)",
      color: "oklch(0.48 0.18 142)",
    },
    icon: CheckCircle,
  },
  [OrderStatus.cancelled]: {
    label: "Cancelled",
    style: {
      background: "oklch(0.88 0.1 25 / 0.25)",
      color: "oklch(0.5 0.2 25)",
    },
    icon: XCircle,
  },
  [OrderStatus.refunded]: {
    label: "Refunded",
    style: {
      background: "oklch(0.88 0.08 165 / 0.25)",
      color: "oklch(0.5 0.15 165)",
    },
    icon: CheckCircle,
  },
};

export function OrderCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 card-elevated">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-full max-w-[200px]" />
          <Skeleton className="h-3 w-full max-w-[140px]" />
        </div>
        <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
      </div>
    </div>
  );
}

export function OrderCard({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cancelOrder = useCancelOrder();
  const status =
    STATUS_CONFIG[order.status] ?? STATUS_CONFIG[OrderStatus.pending];
  const StatusIcon = status.icon;

  const date = new Date(
    Number(order.createdAt / BigInt(1_000_000)),
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      className="bg-card rounded-xl overflow-hidden card-elevated"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-ocid={`order-card-${order.id}`}
    >
      {/* Order header toggle */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 sm:px-4 py-4 cursor-pointer hover:bg-muted/20 transition-colors text-left min-h-[64px]"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">
              Order #{order.id.toString()}
            </p>
            <Badge
              className="text-xs font-semibold border-0 whitespace-nowrap"
              style={status.style}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {date} · {order.items.length} item
            {order.items.length !== 1 ? "s" : ""} · ₹
            {order.total.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex-shrink-0 text-muted-foreground ml-1">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          className="px-3 sm:px-4 pb-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
        >
          <Separator className="mb-3" />

          {/* Items list */}
          <div className="space-y-2 mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Items
            </p>
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-wrap justify-between items-start text-sm gap-x-3 gap-y-1"
              >
                <span className="text-foreground min-w-0 break-words leading-snug flex-1 basis-40">
                  {item.name}
                </span>
                <span className="text-muted-foreground flex-shrink-0 whitespace-nowrap">
                  ×{item.quantity.toString()} ·{" "}
                  <span className="font-medium text-foreground">
                    ₹
                    {(item.price * Number(item.quantity)).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <Separator className="mb-3" />

          {/* Order meta */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div>
              <p className="text-muted-foreground font-medium mb-0.5">
                Payment
              </p>
              <p className="text-foreground font-semibold">Cash on Delivery</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-0.5">Total</p>
              <p className="text-foreground font-semibold text-sm">
                ₹{order.total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Delivery address */}
          <div className="flex items-start gap-2 mb-3 p-2.5 bg-muted/30 rounded-lg text-xs">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground break-words min-w-0">
              {order.address.city}, {order.address.state} – {order.address.pin}
            </p>
          </div>

          {/* Cancel action */}
          {order.status === OrderStatus.pending && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => cancelOrder.mutate(order.id)}
              disabled={cancelOrder.isPending}
              className="rounded-full text-xs w-full sm:w-auto min-h-[40px]"
              data-ocid="cancel-order-btn"
            >
              {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export function OrdersPage() {
  const { isLoggedIn, login } = useIdentity();
  const { data: orders, isLoading } = useUserOrders();

  if (!isLoggedIn) {
    return (
      <div
        className="container mx-auto px-4 py-16 sm:py-24 text-center max-w-sm"
        data-ocid="orders-login-required"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-5 bg-primary/10 rounded-full w-fit mx-auto mb-5">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-foreground mb-2">
            View Your Orders
          </h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Login to track and manage all your purchases in one place.
          </p>
          <Button
            onClick={login}
            className="rounded-full px-8 font-bold w-full sm:w-auto"
            data-ocid="orders-login-btn"
          >
            Login with Internet Identity
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-3 sm:px-4 py-5 sm:py-6 max-w-2xl"
      data-ocid="orders-page"
    >
      {/* Page header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-display font-extrabold text-foreground leading-tight">
            My Orders
          </h1>
          {orders?.length ? (
            <p className="text-xs text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>
          ) : null}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : !orders?.length ? (
        <motion.div
          className="text-center py-16 sm:py-20 px-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="orders-empty"
        >
          <div className="p-5 bg-muted/40 rounded-full w-fit mx-auto mb-5">
            <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-display font-bold text-foreground mb-2">
            No orders yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Looks like you haven't placed any orders. Start exploring!
          </p>
          <Button
            asChild
            className="rounded-full px-8 font-bold w-full sm:w-auto"
            data-ocid="start-shopping-btn"
          >
            <Link to="/products" search={{ q: "", category: "" }}>
              Start Shopping
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <OrderCard key={order.id.toString()} order={order} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
