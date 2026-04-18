import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useCreateStripeSession,
  usePlaceOrder,
  useRecordAltPayment,
  useRecordUpiPayment,
  useVerifyStripePayment,
} from "@/hooks/useBackend";
import { useIdentity } from "@/hooks/useIdentity";
import { useStore } from "@/store/useStore";
import type { Address } from "@/types";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  LogIn,
  MapPin,
  Minus,
  Navigation,
  Package,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Trash2,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

type PaymentMethodType =
  | "cod"
  | "online"
  | "upi"
  | "gpay"
  | "paypal"
  | "razorpay"
  | "cashfree";

interface AddressForm {
  fullName: string;
  phone: string;
  houseNumber: string;
  state: string;
  city: string;
  pinCode: string;
}

export const EMPTY_FORM: AddressForm = {
  fullName: "",
  phone: "",
  houseNumber: "",
  state: "",
  city: "",
  pinCode: "",
};

export function validate(
  form: AddressForm,
): Partial<Record<keyof AddressForm, string>> {
  const errors: Partial<Record<keyof AddressForm, string>> = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!/^[6-9]\d{9}$/.test(form.phone))
    errors.phone = "Enter a valid 10-digit mobile number";
  if (!form.state) errors.state = "Please select a state";
  if (!form.city.trim()) errors.city = "City is required";
  if (!/^\d{6}$/.test(form.pinCode))
    errors.pinCode = "Enter a valid 6-digit pin code";
  return errors;
}

interface NominatimAddress {
  state?: string;
  city?: string;
  town?: string;
  village?: string;
  postcode?: string;
  house_number?: string;
  road?: string;
  suburb?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
}

function normalizeState(raw?: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const match = INDIAN_STATES.find(
    (s) => s.toLowerCase() === trimmed.toLowerCase(),
  );
  return match ?? trimmed;
}

// Simple inline QR SVG (static demo pattern)
function DemoQrSvg({ size = 120 }: { size?: number }) {
  // A visually recognizable QR-like grid pattern (not a real scannable QR)
  const cells = [
    "1110111011101",
    "1000100010001",
    "1011101110101",
    "1000110001001",
    "1110001000111",
    "0000111000000",
    "1011010101011",
    "0100001010010",
    "1010101010101",
    "0000110100000",
    "1110101011101",
    "1000001010001",
    "1110111011101",
  ];
  const cellSize = size / cells.length;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Demo UPI QR Code"
    >
      <title>Demo UPI QR Code</title>
      <rect width={size} height={size} fill="white" rx="4" />
      {cells.map((row, ri) =>
        row.split("").map((cell, ci) =>
          cell === "1" ? (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey: static QR grid cells
              key={`qr-${ri}-${ci}`}
              x={ci * cellSize + 1}
              y={ri * cellSize + 1}
              width={cellSize - 1}
              height={cellSize - 1}
              fill="#1a1a1a"
              rx="0.5"
            />
          ) : null,
        ),
      )}
      {/* Corner finder patterns */}
      <rect
        x="1"
        y="1"
        width={cellSize * 3 - 1}
        height={cellSize * 3 - 1}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        rx="1"
      />
      <rect
        x={size - cellSize * 3}
        y="1"
        width={cellSize * 3 - 1}
        height={cellSize * 3 - 1}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        rx="1"
      />
      <rect
        x="1"
        y={size - cellSize * 3}
        width={cellSize * 3 - 1}
        height={cellSize * 3 - 1}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        rx="1"
      />
    </svg>
  );
}

// Google colored "G" icon
function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  } = useStore();
  const { isLoggedIn } = useIdentity();
  const placeOrder = usePlaceOrder();
  const createStripeSession = useCreateStripeSession();
  const verifyStripePayment = useVerifyStripePayment();
  const recordUpiPayment = useRecordUpiPayment();
  const recordAltPayment = useRecordAltPayment();
  const navigate = useNavigate();

  // Read URL search params for Stripe return
  const search = useSearch({ strict: false }) as Record<string, string>;
  const stripeSuccess = search.stripe_success === "true";
  const stripeCancelled = search.stripe_cancelled === "true";
  const sessionId = search.session_id ?? "";

  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressForm, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof AddressForm, boolean>>
  >({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cod");
  const [locating, setLocating] = useState(false);
  const [locateSuccess, setLocateSuccess] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [stripeProcessing, setStripeProcessing] = useState(false);

  // UPI / GPay state
  const [upiTxnId, setUpiTxnId] = useState("");
  const [upiOrderId, setUpiOrderId] = useState<bigint | null>(null);
  const [upiPaid, setUpiPaid] = useState(false);

  // Alt payment state (PayPal / Razorpay / Cashfree)
  const [altOrderId, setAltOrderId] = useState<bigint | null>(null);
  const [altTxnId, setAltTxnId] = useState("");
  const [altPayerEmail, setAltPayerEmail] = useState("");
  const [altPayStep, setAltPayStep] = useState(false);

  const total = cartTotal();
  const count = cartCount();
  const savings = cartItems.reduce(
    (sum, i) => sum + (i.product.originalPrice - i.product.price) * i.quantity,
    0,
  );

  // Handle Stripe return URLs on mount — snapshot params at mount time
  const stripeSuccessRef = stripeSuccess;
  const stripeCancelledRef = stripeCancelled;
  const sessionIdRef = sessionId;

  useEffect(() => {
    if (stripeSuccessRef && sessionIdRef) {
      setStripeProcessing(true);
      verifyStripePayment.mutate(sessionIdRef, {
        onSuccess: (status) => {
          setStripeProcessing(false);
          if (status.__kind__ === "paid") {
            toast.success("Payment confirmed! Your order is placed. 🎉");
            void navigate({ to: "/orders" });
          } else if (status.__kind__ === "expired") {
            toast.error("Payment session expired. Please try again.");
          } else {
            toast.error("Payment not completed. Please try again.");
          }
        },
        onError: () => {
          setStripeProcessing(false);
          toast.error("Could not verify payment. Please contact support.");
        },
      });
    } else if (stripeCancelledRef) {
      toast.info("Payment cancelled — you can try again anytime.");
      void navigate({ to: "/cart" });
    }
  }, [
    stripeSuccessRef,
    stripeCancelledRef,
    sessionIdRef,
    navigate,
    verifyStripePayment.mutate,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(field: keyof AddressForm, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      setErrors(validate(updated));
    }
  }

  function handleBlur(field: keyof AddressForm) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(form));
  }

  async function handleLocateMe() {
    if (!navigator.geolocation) {
      const msg = "Geolocation is not supported by your browser.";
      setLocateError(msg);
      toast.error(msg);
      return;
    }
    setLocating(true);
    setLocateSuccess(false);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
                "X-Requested-With": "V7Shop/1.0",
              },
            },
          );
          if (!res.ok) throw new Error("Nominatim API error");
          const data: NominatimResponse = await res.json();
          const addr = data.address;
          const city =
            addr.city ?? addr.town ?? addr.village ?? addr.suburb ?? "";
          const state = normalizeState(addr.state);
          const pinCode = addr.postcode ?? "";
          const roadSuffix = addr.road ? ` ${addr.road}` : "";
          const houseNumber = addr.house_number
            ? `${addr.house_number},${roadSuffix}`.trim().replace(/,$/, "")
            : (addr.road ?? addr.suburb ?? "");

          const updated: AddressForm = {
            ...form,
            city,
            state,
            pinCode,
            houseNumber,
          };
          setForm(updated);
          setErrors(validate(updated));
          setLocateSuccess(true);
          setTimeout(() => setLocateSuccess(false), 4000);
          toast.success(
            "📍 Location filled! Address auto-filled from your GPS.",
          );
        } catch {
          const msg = "Could not fetch address details. Please fill manually.";
          setLocateError(msg);
          toast.error(msg);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        let msg =
          "Location access denied. Please enable location in browser settings.";
        if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please try again.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location unavailable. Check your device's GPS settings.";
        }
        setLocateError(msg);
        toast.error(msg);
      },
      { timeout: 12000, enableHighAccuracy: false },
    );
  }

  async function handlePlaceOrder() {
    setTouched({
      fullName: true,
      phone: true,
      houseNumber: false,
      state: true,
      city: true,
      pinCode: true,
    });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const address: Address = {
      city: form.city.trim(),
      state: form.state,
      pin: form.pinCode.trim(),
      houseNumber: form.houseNumber.trim(),
    };

    const orderItems = cartItems.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      quantity: BigInt(i.quantity) as unknown as bigint,
      price: i.product.price,
    }));

    if (paymentMethod === "online") {
      try {
        const order = await placeOrder.mutateAsync({
          items: orderItems,
          address,
          paymentMethod: undefined,
        });

        const lineItems = cartItems.map((i) => ({
          name: i.product.name,
          priceRupees: i.product.price,
          quantity: BigInt(i.quantity),
        }));

        const origin = window.location.origin;
        const successUrl = `${origin}/cart?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin}/cart?stripe_cancelled=true`;

        const checkoutUrl = await createStripeSession.mutateAsync({
          orderId: order.id,
          lineItems,
          successUrl,
          cancelUrl,
        });

        clearCart();
        setForm(EMPTY_FORM);
        setTouched({});
        toast.success("Redirecting to secure Stripe payment…");
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 800);
      } catch {
        toast.error("Failed to create payment session — please try again.");
      }
      return;
    }

    if (paymentMethod === "upi" || paymentMethod === "gpay") {
      // Place order first, then show "I've Paid" flow
      try {
        const order = await placeOrder.mutateAsync({
          items: orderItems,
          address,
        });
        setUpiOrderId(order.id);
        setUpiPaid(true);
        clearCart();
        setForm(EMPTY_FORM);
        setTouched({});
        toast.info(
          paymentMethod === "gpay"
            ? "Order placed! Complete your Google Pay transfer and confirm below."
            : "Order placed! Scan the QR & confirm your payment below.",
        );
      } catch {
        // error toast handled in hook
      }
      return;
    }

    // PayPal / Razorpay / Cashfree flow
    if (
      paymentMethod === "paypal" ||
      paymentMethod === "razorpay" ||
      paymentMethod === "cashfree"
    ) {
      try {
        const order = await placeOrder.mutateAsync({
          items: orderItems,
          address,
        });
        setAltOrderId(order.id);
        setAltTxnId("");
        setAltPayerEmail("");
        setAltPayStep(true);
        clearCart();
        setForm(EMPTY_FORM);
        setTouched({});
        toast.info("Order placed! Complete your payment below to confirm.");
      } catch {
        // error toast handled in hook
      }
      return;
    }

    // COD flow
    try {
      await placeOrder.mutateAsync({ items: orderItems, address });
      clearCart();
      setForm(EMPTY_FORM);
      setTouched({});
      toast.success("Order placed successfully! 🎉");
      void navigate({ to: "/orders" });
    } catch {
      // error toast handled in hook
    }
  }

  async function handleConfirmUpiPayment() {
    if (!upiTxnId.trim()) {
      toast.error("Please enter your UPI transaction ID.");
      return;
    }
    if (!upiOrderId) return;
    recordUpiPayment.mutate(
      {
        orderId: upiOrderId,
        upiTransactionId: upiTxnId.trim(),
        amount: BigInt(Math.round(total * 100)),
      },
      {
        onSuccess: () => {
          setUpiPaid(false);
          setUpiOrderId(null);
          setUpiTxnId("");
          void navigate({ to: "/orders" });
        },
      },
    );
  }

  async function handleConfirmAltPayment() {
    if (!altOrderId) return;
    const isPaypal = paymentMethod === "paypal";
    if (isPaypal && !altPayerEmail.trim()) {
      toast.error("Please enter your PayPal email.");
      return;
    }
    if (!isPaypal && !altTxnId.trim()) {
      toast.error("Please enter your transaction / reference ID.");
      return;
    }
    const txnId = isPaypal ? `PAYPAL-${Date.now()}` : altTxnId.trim();
    recordAltPayment.mutate(
      {
        orderId: altOrderId,
        paymentMethod,
        transactionId: txnId,
        amount: total,
        password: "",
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded! Your order is confirmed. 🎉");
          setAltPayStep(false);
          setAltOrderId(null);
          setAltTxnId("");
          setAltPayerEmail("");
          void navigate({ to: "/orders" });
        },
      },
    );
  }

  const isPlacingOrder =
    placeOrder.isPending || createStripeSession.isPending || stripeProcessing;

  // ─── UPI confirmation screen (after order placed, awaiting payment confirm) ──
  if (upiPaid && upiOrderId) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-sm text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-lg space-y-5"
          data-ocid="cart.upi_confirm.panel"
        >
          <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
            {paymentMethod === "gpay" ? (
              <GoogleIcon size={28} />
            ) : (
              <QrCode className="h-7 w-7 text-purple-600" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">
              {paymentMethod === "gpay"
                ? "Complete Google Pay Transfer"
                : "Scan & Pay via UPI"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentMethod === "gpay"
                ? `Send ₹${total.toLocaleString("en-IN")} to the UPI ID below`
                : `Scan the QR code and pay ₹${total.toLocaleString("en-IN")}`}
            </p>
          </div>

          {paymentMethod === "upi" && (
            <div className="flex justify-center">
              <div className="p-3 bg-background rounded-xl border border-border inline-block">
                <DemoQrSvg size={140} />
              </div>
            </div>
          )}

          <div className="py-2 px-4 bg-muted/40 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground mb-0.5">UPI ID</p>
            <p className="text-sm font-bold text-foreground font-mono">
              {paymentMethod === "gpay" ? "v7shop@gpay" : "v7shop@paytm"}
            </p>
            <p className="text-base font-extrabold text-foreground mt-1">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="upi-txn-id"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block text-left"
            >
              Enter Transaction / UTR ID
            </label>
            <Input
              id="upi-txn-id"
              placeholder="e.g. 424242424242"
              value={upiTxnId}
              onChange={(e) => setUpiTxnId(e.target.value)}
              className="h-11 font-mono"
              data-ocid="cart.upi_txn_id.input"
            />
          </div>

          <Button
            onClick={handleConfirmUpiPayment}
            disabled={recordUpiPayment.isPending || !upiTxnId.trim()}
            size="lg"
            className="w-full rounded-full font-bold"
            data-ocid="cart.upi_confirm.button"
          >
            {recordUpiPayment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Confirming…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I've Paid — Confirm Order
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setUpiPaid(false);
              setUpiOrderId(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Alt payment confirmation screen (PayPal / Razorpay / Cashfree) ──────────
  if (altPayStep && altOrderId) {
    const isPaypal = paymentMethod === "paypal";
    const isRazorpay = paymentMethod === "razorpay";
    const isCashfree = paymentMethod === "cashfree";

    const altConfig = {
      paypal: {
        label: "PayPal",
        color: "bg-blue-600/10 border-blue-600/20",
        iconBg: "bg-blue-600/10",
        icon: (
          <span
            className="text-2xl font-extrabold"
            style={{ color: "#003087" }}
          >
            Pay<span style={{ color: "#009cde" }}>Pal</span>
          </span>
        ),
        upiId: "v7shop@paypal.com",
        description: "Enter your PayPal email — we'll send a payment request.",
      },
      razorpay: {
        label: "Razorpay",
        color: "bg-blue-500/10 border-blue-500/20",
        iconBg: "bg-blue-500/10",
        icon: (
          <span className="text-xl font-extrabold text-blue-600">Razorpay</span>
        ),
        upiId: "v7shop@razorpay",
        description:
          "Pay via Razorpay UPI or scan the QR. Enter your transaction ID.",
      },
      cashfree: {
        label: "Cashfree",
        color: "bg-green-600/10 border-green-600/20",
        iconBg: "bg-green-600/10",
        icon: (
          <span className="text-xl font-extrabold text-green-700">
            Cashfree
          </span>
        ),
        upiId: "v7shop@cashfree",
        description:
          "Pay via Cashfree payment link. Enter your reference number.",
      },
    };

    const cfg = altConfig[paymentMethod as "paypal" | "razorpay" | "cashfree"];

    return (
      <div className="container mx-auto px-4 py-16 max-w-sm text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-card rounded-2xl p-6 border shadow-lg space-y-5 ${cfg.color}`}
          data-ocid="cart.alt_payment_confirm.panel"
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${cfg.iconBg} border border-border`}
          >
            {cfg.icon}
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">
              Complete {cfg.label} Payment
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {cfg.description}
            </p>
          </div>

          {(isRazorpay || isCashfree) && (
            <div className="flex justify-center">
              <div className="p-3 bg-background rounded-xl border border-border inline-block">
                <DemoQrSvg size={130} />
              </div>
            </div>
          )}

          <div className="py-2 px-4 bg-muted/40 rounded-xl border border-border text-left">
            {isPaypal ? (
              <>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Send payment to
                </p>
                <p className="text-sm font-bold text-foreground font-mono">
                  payments@v7shop.in
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-0.5">
                  UPI / Payment ID
                </p>
                <p className="text-sm font-bold text-foreground font-mono">
                  {cfg.upiId}
                </p>
              </>
            )}
            <p className="text-base font-extrabold text-foreground mt-1">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="space-y-2 text-left">
            {isPaypal ? (
              <>
                <label
                  htmlFor="alt-email"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block"
                >
                  Your PayPal Email
                </label>
                <Input
                  id="alt-email"
                  type="email"
                  placeholder="you@example.com"
                  value={altPayerEmail}
                  onChange={(e) => setAltPayerEmail(e.target.value)}
                  className="h-11"
                  data-ocid="cart.alt_payment_email.input"
                />
              </>
            ) : (
              <>
                <label
                  htmlFor="alt-txn-id"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block"
                >
                  {isRazorpay
                    ? "Razorpay Transaction ID"
                    : "Cashfree Reference Number"}
                </label>
                <Input
                  id="alt-txn-id"
                  placeholder="e.g. RZP-123456789"
                  value={altTxnId}
                  onChange={(e) => setAltTxnId(e.target.value)}
                  className="h-11 font-mono"
                  data-ocid="cart.alt_payment_txnid.input"
                />
              </>
            )}
          </div>

          <Button
            onClick={handleConfirmAltPayment}
            disabled={
              recordAltPayment.isPending ||
              (isPaypal ? !altPayerEmail.trim() : !altTxnId.trim())
            }
            size="lg"
            className="w-full rounded-full font-bold"
            data-ocid="cart.alt_payment_confirm.button"
          >
            {recordAltPayment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Confirming…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isPaypal
                  ? "Confirm PayPal Payment"
                  : `Confirm ${cfg.label} Payment`}
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setAltPayStep(false);
              setAltOrderId(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="cart.alt_payment_cancel.button"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Empty cart ────────────────────────────────────────────────────────────
  if (cartItems.length === 0 && !stripeProcessing) {
    return (
      <div
        className="container mx-auto px-4 py-16 sm:py-20 text-center"
        data-ocid="cart.empty_state"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-xs mx-auto"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Looks like you haven't added anything yet. Explore our collection!
          </p>
          <Link to="/products" search={{ q: "", category: "" }}>
            <Button
              className="rounded-full px-8 font-bold w-full sm:w-auto"
              size="lg"
              data-ocid="cart.start-shopping.button"
            >
              Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Stripe verification loading screen
  if (stripeProcessing) {
    return (
      <div className="container mx-auto px-4 py-16 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xs mx-auto"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-lg font-display font-bold text-foreground mb-2">
            Verifying your payment…
          </h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we confirm your Stripe payment.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Order summary component ───────────────────────────────────────────────
  const OrderSummaryCard = () => (
    <div
      className="bg-card rounded-xl p-4 sm:p-5 border border-border/60 shadow-sm"
      data-ocid="cart.order_summary.card"
    >
      <h2 className="text-base font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Package className="h-4 w-4 text-primary flex-shrink-0" />
        Order Summary
      </h2>

      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex gap-2 text-xs">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-foreground font-medium">
                {item.product.name}
              </p>
              <p className="text-muted-foreground">
                {item.quantity} × ₹{item.product.price.toLocaleString("en-IN")}
              </p>
            </div>
            <span className="font-semibold text-foreground flex-shrink-0">
              ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <Separator className="mb-4" />

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">MRP ({count} items)</span>
          <span>
            ₹
            {cartItems
              .reduce((s, i) => s + i.product.originalPrice * i.quantity, 0)
              .toLocaleString("en-IN")}
          </span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-accent font-semibold">
            <span>Discount</span>
            <span>-₹{savings.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span className="text-accent font-semibold">FREE</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Total Payable</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {savings > 0 && (
        <div className="mt-3 p-2.5 bg-accent/10 rounded-lg text-accent text-xs font-semibold text-center">
          🎉 You save ₹{savings.toLocaleString("en-IN")} on this order!
        </div>
      )}
    </div>
  );

  // ─── Place Order / Login CTA ───────────────────────────────────────────────
  const PlaceOrderCta = () =>
    !isLoggedIn ? (
      <motion.div
        className="bg-card rounded-xl p-4 sm:p-5 border border-border/60 shadow-sm text-center"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        data-ocid="cart.login_prompt.card"
      >
        <LogIn className="mx-auto h-8 w-8 text-primary mb-3" />
        <p className="text-sm font-semibold text-foreground mb-1">
          Login required to place order
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Sign in with your Google account to continue
        </p>
        <Button
          onClick={() =>
            navigate({ to: "/login", search: { returnUrl: "/cart" } })
          }
          className="w-full rounded-full font-bold"
          data-ocid="cart.login_to_checkout.button"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login &amp; Checkout
        </Button>
      </motion.div>
    ) : (
      <div className="space-y-3">
        <Button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          size="lg"
          className="w-full rounded-full font-bold text-base py-6 min-h-[52px]"
          data-ocid="cart.place_order.button"
        >
          {isPlacingOrder ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {paymentMethod === "online"
                ? createStripeSession.isPending
                  ? "Creating Stripe session…"
                  : "Processing…"
                : "Placing Order…"}
            </>
          ) : paymentMethod === "online" ? (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Pay ₹{total.toLocaleString("en-IN")} Online
            </>
          ) : paymentMethod === "upi" ? (
            <>
              <QrCode className="h-5 w-5 mr-2" />
              Place Order · Pay via UPI
            </>
          ) : paymentMethod === "gpay" ? (
            <>
              <Smartphone className="h-5 w-5 mr-2" />
              Place Order · Pay via GPay
            </>
          ) : paymentMethod === "paypal" ? (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Place Order · Pay via PayPal
            </>
          ) : paymentMethod === "razorpay" ? (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Place Order · Pay via Razorpay
            </>
          ) : paymentMethod === "cashfree" ? (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Place Order · Pay via Cashfree
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Place Order · ₹{total.toLocaleString("en-IN")}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent flex-shrink-0" />
          {paymentMethod === "online"
            ? "Secure payment via Stripe — you'll be redirected"
            : paymentMethod === "upi"
              ? "Pay via Paytm / PhonePe / any UPI app"
              : paymentMethod === "gpay"
                ? "Pay via Google Pay UPI"
                : paymentMethod === "paypal"
                  ? "Complete PayPal payment after order is placed"
                  : paymentMethod === "razorpay"
                    ? "Pay via Razorpay UPI or QR code"
                    : paymentMethod === "cashfree"
                      ? "Pay via Cashfree payment gateway"
                      : "Secure checkout · Cash on Delivery"}
        </p>
      </div>
    );

  // ─── Payment method options config ────────────────────────────────────────
  const paymentOptions: Array<{
    id: PaymentMethodType;
    label: string;
    sublabel: string;
    badge: string;
    badgeStyle: string;
    selectedBorder: string;
    selectedBg: string;
    icon: React.ReactNode;
    ocid: string;
  }> = [
    {
      id: "cod",
      label: "Cash on Delivery",
      sublabel: "Pay when delivered",
      badge: "FREE",
      badgeStyle:
        "text-accent text-xs font-bold bg-accent/10 px-2 py-0.5 rounded-full",
      selectedBorder: "border-primary",
      selectedBg: "bg-primary/5",
      icon: <Truck className="h-4 w-4 text-accent flex-shrink-0" />,
      ocid: "cart.cod.toggle",
    },
    {
      id: "online",
      label: "Card / Stripe",
      sublabel: "Secure card payment via Stripe",
      badge: "Secure",
      badgeStyle:
        "text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1",
      selectedBorder: "border-primary",
      selectedBg: "bg-primary/5",
      icon: <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />,
      ocid: "cart.online_payment.toggle",
    },
    {
      id: "upi",
      label: "UPI / Paytm QR",
      sublabel: "Scan & pay with any UPI app",
      badge: "QR",
      badgeStyle:
        "text-purple-600 text-xs font-bold bg-purple-500/10 px-2 py-0.5 rounded-full",
      selectedBorder: "border-purple-500",
      selectedBg: "bg-purple-500/5",
      icon: <QrCode className="h-4 w-4 text-purple-600 flex-shrink-0" />,
      ocid: "cart.upi_payment.toggle",
    },
    {
      id: "gpay",
      label: "Google Pay",
      sublabel: "Pay using Google Pay UPI",
      badge: "GPay",
      badgeStyle:
        "text-foreground text-xs font-bold bg-muted px-2 py-0.5 rounded-full flex items-center gap-1",
      selectedBorder: "border-foreground/40",
      selectedBg: "bg-muted/30",
      icon: <GoogleIcon size={16} />,
      ocid: "cart.gpay_payment.toggle",
    },
    {
      id: "paypal",
      label: "PayPal",
      sublabel: "Pay securely via PayPal",
      badge: "PayPal",
      badgeStyle:
        "text-blue-700 text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200",
      selectedBorder: "border-blue-500",
      selectedBg: "bg-blue-50/50",
      icon: (
        <span
          className="text-xs font-extrabold leading-none"
          style={{ color: "#003087" }}
        >
          Pay<span style={{ color: "#009cde" }}>Pal</span>
        </span>
      ),
      ocid: "cart.paypal_payment.toggle",
    },
    {
      id: "razorpay",
      label: "Razorpay",
      sublabel: "UPI, cards & net banking via Razorpay",
      badge: "Razorpay",
      badgeStyle:
        "text-blue-600 text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-300",
      selectedBorder: "border-blue-400",
      selectedBg: "bg-blue-50/40",
      icon: (
        <span className="text-xs font-extrabold text-blue-600 leading-none">
          RP
        </span>
      ),
      ocid: "cart.razorpay_payment.toggle",
    },
    {
      id: "cashfree",
      label: "Cashfree",
      sublabel: "Pay via Cashfree payment gateway",
      badge: "Cashfree",
      badgeStyle:
        "text-green-700 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200",
      selectedBorder: "border-green-500",
      selectedBg: "bg-green-50/40",
      icon: (
        <span className="text-xs font-extrabold text-green-700 leading-none">
          CF
        </span>
      ),
      ocid: "cart.cashfree_payment.toggle",
    },
  ];

  // ─── Main layout ───────────────────────────────────────────────────────────
  return (
    <div
      className="w-full min-w-0 max-w-screen overflow-x-hidden"
      data-ocid="cart.page"
    >
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Page header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
          <h1 className="text-lg sm:text-xl font-display font-extrabold text-foreground">
            My Cart
            <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
              {count} {count === 1 ? "item" : "items"}
            </Badge>
          </h1>
        </div>

        {/* Two-column on lg+, single column below */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-4 sm:gap-6 items-start">
          {/* ── LEFT col: items + address + payment ── */}
          <div className="space-y-4 min-w-0">
            {/* Cart items */}
            <div className="space-y-3">
              <AnimatePresence>
                {cartItems.map((item, i) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 border border-border/60 shadow-sm min-w-0"
                    data-ocid={`cart.item.${i + 1}`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-semibold uppercase tracking-wide truncate">
                        {item.product.brand}
                      </p>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug break-words">
                        {item.product.name}
                      </h3>
                      <div className="flex flex-wrap items-baseline gap-1.5 mt-1">
                        <span className="font-bold text-foreground text-sm">
                          ₹
                          {(item.product.price * item.quantity).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ₹
                          {(
                            item.product.originalPrice * item.quantity
                          ).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-semibold text-accent">
                          {Math.round(
                            ((item.product.originalPrice - item.product.price) /
                              item.product.originalPrice) *
                              100,
                          )}
                          % off
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2.5">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 hover:bg-muted/60 transition-colors active:bg-muted"
                            aria-label="Decrease quantity"
                            data-ocid={`cart.qty_decrease.${i + 1}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 sm:px-3 py-1 text-sm font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 hover:bg-muted/60 transition-colors active:bg-muted"
                            aria-label="Increase quantity"
                            data-ocid={`cart.qty_increase.${i + 1}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-destructive hover:text-destructive/70 transition-colors flex items-center gap-1 text-xs font-medium min-h-[32px] px-1 active:opacity-60"
                          aria-label="Remove item"
                          data-ocid={`cart.remove_item.${i + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden xs:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Delivery address form */}
            <motion.div
              className="bg-card rounded-xl p-4 sm:p-5 border border-border/60 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              data-ocid="cart.address_form.card"
            >
              <div className="flex flex-col xs:flex-row xs:items-center gap-3 mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      locateSuccess ? "bg-green-500/15" : "bg-primary/10"
                    }`}
                  >
                    <MapPin
                      className={`h-4 w-4 transition-colors ${
                        locateSuccess ? "text-green-600" : "text-primary"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-display font-bold text-foreground leading-tight">
                      Delivery Address
                    </h2>
                    {locateSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-green-600 font-medium"
                        data-ocid="cart.locate_me.success_state"
                      >
                        ✓ Location filled automatically!
                      </motion.p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full xs:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLocateMe}
                    disabled={locating}
                    className={`w-full xs:w-auto gap-1.5 text-xs font-semibold transition-all min-h-[40px] ${
                      locateSuccess
                        ? "border-green-500/40 text-green-600 bg-green-500/5 hover:bg-green-500/10"
                        : "border-accent/40 text-accent hover:bg-accent/10 hover:border-accent/70"
                    }`}
                    data-ocid="cart.locate_me.button"
                  >
                    {locating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : locateSuccess ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Navigation className="h-3.5 w-3.5" />
                    )}
                    {locating
                      ? "Getting your location…"
                      : locateSuccess
                        ? "Location filled!"
                        : "Locate Me"}
                  </Button>
                  {locateError && !locating && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive text-center xs:text-right leading-tight"
                      data-ocid="cart.locate_me.error_state"
                    >
                      {locateError}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. Rahul Sharma"
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    className={`h-11 ${
                      errors.fullName && touched.fullName
                        ? "border-destructive"
                        : ""
                    }`}
                    data-ocid="cart.addr_fullname.input"
                  />
                  {errors.fullName && touched.fullName && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="cart.addr_fullname.field_error"
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      handleChange("phone", e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={() => handleBlur("phone")}
                    className={`h-11 ${
                      errors.phone && touched.phone ? "border-destructive" : ""
                    }`}
                    data-ocid="cart.addr_phone.input"
                  />
                  {errors.phone && touched.phone && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="cart.addr_phone.field_error"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pinCode" className="text-sm font-medium">
                    Pin Code
                  </Label>
                  <Input
                    id="pinCode"
                    inputMode="numeric"
                    placeholder="6-digit pin"
                    maxLength={6}
                    value={form.pinCode}
                    onChange={(e) =>
                      handleChange("pinCode", e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={() => handleBlur("pinCode")}
                    className={`h-11 transition-all ${
                      errors.pinCode && touched.pinCode
                        ? "border-destructive"
                        : locateSuccess && form.pinCode
                          ? "border-green-500/60 ring-1 ring-green-500/30"
                          : ""
                    }`}
                    data-ocid="cart.addr_pin.input"
                  />
                  {errors.pinCode && touched.pinCode && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="cart.addr_pin.field_error"
                    >
                      {errors.pinCode}
                    </p>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <Label htmlFor="houseNumber" className="text-sm font-medium">
                    House No. / Flat / Street{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="houseNumber"
                    placeholder="e.g. 42B, MG Road, Sector 14"
                    value={form.houseNumber}
                    onChange={(e) =>
                      handleChange("houseNumber", e.target.value)
                    }
                    className={`h-11 transition-all ${
                      locateSuccess && form.houseNumber
                        ? "border-green-500/60 ring-1 ring-green-500/30"
                        : ""
                    }`}
                    data-ocid="cart.addr_housenumber.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-sm font-medium">
                    State
                  </Label>
                  <select
                    id="state"
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    onBlur={() => handleBlur("state")}
                    className={`w-full h-11 rounded-md border px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none ${
                      errors.state && touched.state
                        ? "border-destructive"
                        : locateSuccess && form.state
                          ? "border-green-500/60 ring-1 ring-green-500/30"
                          : "border-input"
                    }`}
                    data-ocid="cart.addr_state.select"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && touched.state && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="cart.addr_state.field_error"
                    >
                      {errors.state}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    onBlur={() => handleBlur("city")}
                    className={`h-11 transition-all ${
                      errors.city && touched.city
                        ? "border-destructive"
                        : locateSuccess && form.city
                          ? "border-green-500/60 ring-1 ring-green-500/30"
                          : ""
                    }`}
                    data-ocid="cart.addr_city.input"
                  />
                  {errors.city && touched.city && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="cart.addr_city.field_error"
                    >
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Payment method — 4 options grid */}
            <motion.div
              className="bg-card rounded-xl p-4 sm:p-5 border border-border/60 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              data-ocid="cart.payment_method.card"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                </div>
                <h2 className="text-base font-display font-bold text-foreground">
                  Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((opt) => {
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all w-full min-h-[64px] active:scale-[0.98] ${
                        isSelected
                          ? `${opt.selectedBorder} ${opt.selectedBg}`
                          : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                      }`}
                      data-ocid={opt.ocid}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? opt.selectedBorder
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {opt.icon}
                          <p className="font-semibold text-foreground text-sm">
                            {opt.label}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {opt.sublabel}
                        </p>
                      </div>
                      <span
                        className={`${opt.badgeStyle} flex-shrink-0 text-xs`}
                      >
                        {opt.id === "online" && (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                        {opt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Expanded detail for selected method */}
              <AnimatePresence mode="wait">
                {paymentMethod === "online" && (
                  <motion.div
                    key="stripe-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-2 overflow-hidden"
                  >
                    <CreditCard className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You'll be redirected to Stripe's secure checkout page. We
                      accept Visa, Mastercard, UPI, and more. Your order will be
                      saved automatically.
                    </p>
                  </motion.div>
                )}

                {paymentMethod === "upi" && (
                  <motion.div
                    key="upi-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                      <div className="flex gap-3 items-start">
                        <div className="flex-shrink-0 p-1.5 bg-background rounded-lg border border-border">
                          <DemoQrSvg size={72} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground mb-0.5">
                            Scan with Paytm / PhonePe / any UPI app
                          </p>
                          <p className="text-xs text-muted-foreground mb-1">
                            UPI ID:{" "}
                            <span className="font-mono font-semibold text-foreground">
                              v7shop@paytm
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            After placing the order, you'll be asked to enter
                            your transaction ID to confirm payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "gpay" && (
                  <motion.div
                    key="gpay-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="p-3 bg-muted/30 rounded-lg border border-border flex items-start gap-2">
                      <GoogleIcon size={18} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground mb-0.5">
                          Send payment to UPI ID:{" "}
                          <span className="font-mono">v7shop@gpay</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          After placing the order, enter your Google Pay
                          transaction ID to confirm payment.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "paypal" && (
                  <motion.div
                    key="paypal-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 flex items-start gap-2">
                      <span
                        className="text-sm font-extrabold shrink-0 mt-0.5"
                        style={{ color: "#003087" }}
                      >
                        Pay<span style={{ color: "#009cde" }}>Pal</span>
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground mb-0.5">
                          Pay to:{" "}
                          <span className="font-mono">payments@v7shop.in</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          After placing the order, enter your PayPal email.
                          We'll record the payment — complete it at paypal.com.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "razorpay" && (
                  <motion.div
                    key="razorpay-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-300/50 flex items-start gap-2">
                      <span className="text-xs font-extrabold text-blue-600 shrink-0 mt-0.5">
                        RP
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground mb-0.5">
                          UPI ID:{" "}
                          <span className="font-mono">v7shop@razorpay</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pay via Razorpay UPI / QR code and enter your
                          transaction ID to confirm.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "cashfree" && (
                  <motion.div
                    key="cashfree-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="p-3 bg-green-50/40 rounded-lg border border-green-200 flex items-start gap-2">
                      <span className="text-xs font-extrabold text-green-700 shrink-0 mt-0.5">
                        CF
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground mb-0.5">
                          UPI / Payment ID:{" "}
                          <span className="font-mono">v7shop@cashfree</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pay via Cashfree gateway and enter your reference
                          number to confirm.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mobile: order summary + CTA */}
            <div
              className="lg:hidden space-y-4"
              data-ocid="cart.mobile_summary.panel"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
              >
                <OrderSummaryCard />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44 }}
              >
                <PlaceOrderCta />
              </motion.div>
              <Link to="/products" search={{ q: "", category: "" }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground"
                  data-ocid="cart.continue_shopping.button"
                >
                  ← Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* ── RIGHT col: sticky sidebar (lg+) ── */}
          <motion.div
            className="hidden lg:block space-y-4 sticky top-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <OrderSummaryCard />
            <PlaceOrderCta />
            <Link to="/products" search={{ q: "", category: "" }}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                data-ocid="cart.continue_shopping_desktop.button"
              >
                ← Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
