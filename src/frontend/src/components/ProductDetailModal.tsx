import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_PRODUCTS } from "@/data/products";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { Product, Review } from "@/types";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Send,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onProductChange?: (product: Product) => void;
}

const COLOR_MAP: Record<string, string> = {
  Red: "bg-red-500",
  Black: "bg-neutral-900",
  White: "bg-white border border-border",
  Blue: "bg-blue-500",
  Pink: "bg-pink-400",
  "Rose Gold": "bg-rose-300",
  Silver: "bg-slate-300",
  Titanium: "bg-slate-400",
  Carbon: "bg-neutral-700",
  Grey: "bg-slate-500",
  Orange: "bg-orange-500",
  Green: "bg-green-600",
  "Ice Blue": "bg-sky-300",
  Steel: "bg-slate-400",
  Diamond: "bg-cyan-100 border border-border",
  "Black/Gold": "bg-neutral-900",
  "Black Frame": "bg-neutral-800",
};

const PAGE_SIZE = 8;

// 10 realistic seed reviews spread across products
const SEED_REVIEWS: Review[] = [
  {
    id: 1001,
    productId: "",
    reviewerName: "Aarav S.",
    rating: 5,
    text: "Absolutely love the quality! Exactly as described, fast delivery too. The packaging was premium and the product exceeded my expectations.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 1002,
    productId: "",
    reviewerName: "Priya M.",
    rating: 4,
    text: "Great product for the price. Looks premium and packaging was excellent. Slight delay in delivery but worth the wait.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 1003,
    productId: "",
    reviewerName: "Rohit K.",
    rating: 5,
    text: "Top-notch quality! Would highly recommend to anyone looking for something special. I've ordered twice already.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 1004,
    productId: "",
    reviewerName: "Sneha R.",
    rating: 4,
    text: "Really impressed with the build quality. Ordered as a gift and the recipient was thrilled. Definitely buying again.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },
  {
    id: 1005,
    productId: "",
    reviewerName: "Vikram P.",
    rating: 5,
    text: "Exceeded all my expectations. The attention to detail is remarkable — you can tell this is a premium product. Fast shipping too!",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
  {
    id: 1006,
    productId: "",
    reviewerName: "Ananya T.",
    rating: 3,
    text: "Good product overall but sizing runs slightly smaller than expected. Quality is solid. Customer support was helpful when I reached out.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 22,
  },
  {
    id: 1007,
    productId: "",
    reviewerName: "Karan M.",
    rating: 5,
    text: "Fantastic! I was skeptical at first but this blew me away. The material is premium and the finish is flawless. Worth every rupee.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 28,
  },
  {
    id: 1008,
    productId: "",
    reviewerName: "Divya L.",
    rating: 4,
    text: "Very stylish design and excellent craftsmanship. Delivery was quick and packaging was secure. A few minor points could be better.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 35,
  },
  {
    id: 1009,
    productId: "",
    reviewerName: "Arjun N.",
    rating: 5,
    text: "This is one of the best purchases I've made this year. Incredible quality, fast delivery, and perfect condition. Highly recommended!",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 42,
  },
  {
    id: 1010,
    productId: "",
    reviewerName: "Meera V.",
    rating: 4,
    text: "Beautiful product that matches the photos exactly. Very happy with my purchase. Would appreciate more color options in the future.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 50,
  },
];

function getSeedReviews(productId: string): Review[] {
  // Distribute reviews based on product id hash
  const hash =
    productId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 10;
  // Show 4–7 reviews per product depending on hash
  const count = 4 + (hash % 4);
  return SEED_REVIEWS.slice(0, count).map((r) => ({
    ...r,
    productId,
  }));
}

export function StarPicker({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const iconSize =
    size === "lg" ? "h-8 w-8" : size === "md" ? "h-6 w-6" : "h-5 w-5";
  return (
    <div className="flex gap-1.5" aria-label="Star rating picker">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          data-ocid={`star-pick-${star}`}
        >
          <Star
            className={cn(
              iconSize,
              "transition-colors duration-150",
              star <= (hovered || value)
                ? "fill-accent text-accent"
                : "fill-muted text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {review.reviewerName.charAt(0)}
            </span>
          </div>
          <span className="font-semibold text-sm text-foreground truncate min-w-0">
            {review.reviewerName}
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{date}</span>
      </div>
      <div className="flex items-center gap-0.5 mb-1.5 ml-9">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3.5 w-3.5",
              star <= review.rating
                ? "fill-accent text-accent"
                : "fill-muted text-muted",
            )}
          />
        ))}
        <span className="text-xs font-semibold text-foreground ml-1">
          {review.rating}.0
        </span>
      </div>
      <p className="text-sm text-foreground leading-relaxed break-words ml-9">
        {review.text}
      </p>
    </div>
  );
}

export function SimilarItemCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-smooth text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
      aria-label={`View ${product.name}`}
      data-ocid={`similar-item-${product.id}`}
    >
      <div className="relative aspect-square bg-muted/20 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-2">
        <p className="text-xs text-muted-foreground truncate font-medium">
          {product.brand}
        </p>
        <p className="text-xs font-semibold text-foreground line-clamp-2 mt-0.5 leading-snug">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1 mt-1.5 flex-wrap">
          <span className="text-sm font-bold text-foreground">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {discount > 0 && (
            <span className="text-xs font-bold text-accent">
              {discount}% off
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ProductDetailModal({
  product,
  onClose,
  onProductChange,
}: ProductDetailModalProps) {
  const addToCart = useStore((s) => s.addToCart);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Report damaged state
  const [reportingDamage, setReportingDamage] = useState(false);

  // Similar items infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  // Touch swipe for carousel
  const touchStartX = useRef<number | null>(null);

  const allImages =
    product?.images && product.images.length > 0
      ? product.images
      : product
        ? [product.image]
        : [];

  const similarProducts = product
    ? ALL_PRODUCTS.filter(
        (p) => p.id !== product.id && p.category === product.category,
      )
    : [];

  const fallback = product
    ? ALL_PRODUCTS.filter(
        (p) =>
          p.id !== product.id &&
          p.category !== product.category &&
          p.brand === product.brand,
      )
    : [];

  const allSimilar = [...similarProducts, ...fallback];
  const visibleSimilar = allSimilar.slice(0, visibleCount);
  const hasMore = visibleCount < allSimilar.length;

  const goToImage = useCallback(
    (idx: number) => {
      const next = (idx + allImages.length) % allImages.length;
      setSelectedImageIndex(next);
      const thumbEl = thumbsRef.current?.children[next] as
        | HTMLElement
        | undefined;
      thumbEl?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    [allImages.length],
  );

  // Infinite scroll sentinel
  const handleSentinel = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore) {
        setVisibleCount((c) => c + PAGE_SIZE);
      }
    },
    [hasMore],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleSentinel, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleSentinel]);

  // Reset state on product change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset only on product id change
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setAdding(false);
    setReviews([]);
    setShowForm(false);
    setReviewName("");
    setReviewRating(0);
    setReviewText("");
    setVisibleCount(PAGE_SIZE);
    setReportingDamage(false);
  }, [product?.id]);

  // Load reviews when product changes — seeds 4–7 realistic reviews per product
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset only on product id change
  useEffect(() => {
    if (!product) return;
    const pid = product.id;
    setReviewsLoading(true);
    setTimeout(() => {
      setReviews(getSeedReviews(pid));
      setReviewsLoading(false);
    }, 400);
  }, [product?.id]);

  // Close on Escape + lock scroll
  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${product.name} added to cart!`, {
      duration: 2500,
      icon: "🛒",
    });
    setTimeout(() => {
      setAdding(false);
      onClose();
    }, 600);
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (!reviewName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (reviewRating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review.");
      return;
    }
    setSubmitting(true);
    const newReview: Review = {
      id: Date.now(),
      productId: product.id,
      reviewerName: reviewName.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      timestamp: Date.now(),
    };
    await new Promise((r) => setTimeout(r, 500));
    setReviews((prev) => [newReview, ...prev]);
    setReviewName("");
    setReviewRating(0);
    setReviewText("");
    setShowForm(false);
    setSubmitting(false);
    toast.success("Review submitted! Thank you.", { icon: "⭐" });
  };

  function handleReportDamage() {
    setReportingDamage(true);
    setTimeout(() => {
      setReportingDamage(false);
      toast.success(
        "Damage report submitted. Our team will contact you within 24 hours.",
        { duration: 5000, icon: "📦" },
      );
    }, 1200);
  }

  const handleSimilarClick = (p: Product) => {
    if (onProductChange) onProductChange(p);
  };

  const discount = product
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : (product?.rating ?? 0);

  // Rating distribution for visual bar chart
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...ratingCounts.map((r) => r.count), 1);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          data-ocid="product-detail-modal"
        >
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm cursor-default"
            onClick={onClose}
            aria-label="Close product details"
          />

          {/* Modal panel */}
          <motion.dialog
            key="modal-panel"
            open
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-label={product.name}
            className={cn(
              "relative z-10 bg-background flex flex-col shadow-2xl border-0 p-0 m-0",
              "w-full h-full rounded-none",
              "sm:w-[90vw] sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl",
              "md:max-w-[900px]",
            )}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-card/90 backdrop-blur-sm text-foreground hover:bg-card transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
              aria-label="Close product details"
              data-ocid="modal-close-btn"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              className="overflow-y-auto flex-1 overscroll-contain pb-24 sm:pb-0"
            >
              {/* ── TOP: Image + Details ── */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* IMAGE COLUMN */}
                <div className="flex flex-col bg-muted/20">
                  <div
                    className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-square overflow-hidden"
                    onTouchStart={(e) => {
                      touchStartX.current = e.touches[0]?.clientX ?? null;
                    }}
                    onTouchEnd={(e) => {
                      if (touchStartX.current === null) return;
                      const dx =
                        (e.changedTouches[0]?.clientX ?? 0) -
                        touchStartX.current;
                      if (Math.abs(dx) > 40) {
                        goToImage(selectedImageIndex + (dx < 0 ? 1 : -1));
                      }
                      touchStartX.current = null;
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={allImages[selectedImageIndex]}
                        src={allImages[selectedImageIndex]}
                        alt={`${product.name} view ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover select-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        draggable={false}
                      />
                    </AnimatePresence>

                    {allImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => goToImage(selectedImageIndex - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-card/85 backdrop-blur-sm text-foreground hover:bg-card transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow"
                          aria-label="Previous image"
                          data-ocid="modal-prev-img"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => goToImage(selectedImageIndex + 1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-card/85 backdrop-blur-sm text-foreground hover:bg-card transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow"
                          aria-label="Next image"
                          data-ocid="modal-next-img"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                          {allImages.map((_, idx) => (
                            <button
                              key={`dot-${
                                // biome-ignore lint/suspicious/noArrayIndexKey: static dot indicators
                                idx
                              }`}
                              type="button"
                              onClick={() => goToImage(idx)}
                              aria-label={`Go to image ${idx + 1}`}
                              className={cn(
                                "w-2 h-2 rounded-full transition-smooth",
                                idx === selectedImageIndex
                                  ? "bg-primary w-4"
                                  : "bg-card/70",
                              )}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {allImages.length > 1 && (
                    <div
                      ref={thumbsRef}
                      className="hidden sm:flex items-center gap-2 px-3 py-2.5 overflow-x-auto scrollbar-none bg-card/50 border-t border-border"
                    >
                      {allImages.map((img, idx) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => goToImage(idx)}
                          className={cn(
                            "shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            idx === selectedImageIndex
                              ? "border-primary opacity-100"
                              : "border-transparent opacity-60 hover:opacity-90",
                          )}
                          aria-label={`View image ${idx + 1}`}
                          data-ocid={`modal-thumb-${idx}`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* INFO COLUMN */}
                <div className="flex flex-col p-4 sm:p-5 md:p-6 gap-3 md:overflow-y-auto md:max-h-[90dvh]">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">
                    {product.brand}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-foreground leading-snug">
                    {product.name}
                  </h2>

                  {/* Rating summary */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          // biome-ignore lint/suspicious/noArrayIndexKey: static 5-star display
                          key={starIdx}
                          className={cn(
                            "h-4 w-4",
                            starIdx < Math.round(avgRating)
                              ? "fill-accent text-accent"
                              : "fill-muted text-muted",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (
                      {reviews.length > 0
                        ? reviews.length
                        : product.reviewCount.toLocaleString()}{" "}
                      reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {discount > 0 && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-sm font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                          {discount}% off
                        </span>
                      </>
                    )}
                  </div>

                  <div className="h-px bg-border" />

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Available Colors
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <div
                            key={color}
                            className="flex items-center gap-1.5"
                            title={color}
                          >
                            <span
                              className={cn(
                                "w-7 h-7 rounded-full inline-block shrink-0 border border-border/50",
                                COLOR_MAP[color] ?? "bg-muted",
                              )}
                            />
                            <span className="text-xs text-foreground font-medium">
                              {color}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materials */}
                  {product.materials && product.materials.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Materials
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.materials.map((mat) => (
                          <span
                            key={mat}
                            className="text-xs px-2 py-1 rounded-full bg-muted text-foreground font-medium border border-border"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specs && Object.keys(product.specs).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Specifications
                      </p>
                      <div
                        className="rounded-xl overflow-hidden border border-border text-sm w-full"
                        data-ocid="product-specs-table"
                      >
                        {Object.entries(product.specs).map(
                          ([key, val], specIdx) => (
                            <div
                              key={key}
                              className={cn(
                                "grid grid-cols-2 px-3 py-2 gap-2",
                                specIdx % 2 === 0
                                  ? "bg-muted/30"
                                  : "bg-background",
                              )}
                            >
                              <span className="font-semibold text-muted-foreground text-xs break-words">
                                {key}
                              </span>
                              <span className="text-foreground font-medium text-xs break-words">
                                {val}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quality Description */}
                  {product.qualityDescription && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        About This Product
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {product.qualityDescription}
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Key Features
                      </p>
                      <ul className="space-y-1.5">
                        {product.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <span className="text-primary mt-0.5 shrink-0">
                              ✓
                            </span>
                            <span className="min-w-0 break-words">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="h-px bg-border" />

                  {/* Quantity + Add to Cart — desktop only */}
                  <div className="hidden sm:block space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Qty
                      </p>
                      <div className="flex items-center gap-1 rounded-full border border-input bg-card">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Decrease quantity"
                          data-ocid="modal-qty-dec"
                        >
                          <Minus className="h-3.5 w-3.5 text-foreground" />
                        </button>
                        <span
                          className="w-8 text-center text-sm font-bold text-foreground"
                          data-ocid="modal-qty-display"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Increase quantity"
                          data-ocid="modal-qty-inc"
                        >
                          <Plus className="h-3.5 w-3.5 text-foreground" />
                        </button>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleAddToCart}
                      className={cn(
                        "w-full rounded-full font-bold text-sm h-12 transition-smooth",
                        adding && "scale-95",
                      )}
                      data-ocid="modal-add-to-cart"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {adding ? "Added!" : "Add to Cart"}
                    </Button>

                    {/* Report Damaged Item */}
                    <button
                      type="button"
                      onClick={handleReportDamage}
                      disabled={reportingDamage}
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors py-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-ocid="modal-report-damage-btn"
                    >
                      {reportingDamage ? (
                        <span className="animate-pulse">
                          Submitting report…
                        </span>
                      ) : (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Report damaged / defective item
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs text-primary font-semibold hover:underline text-center w-full py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      data-ocid="modal-continue-shopping"
                    >
                      ← Continue Shopping
                    </button>
                  </div>
                </div>
              </div>

              {/* ── CUSTOMER REVIEWS SECTION ── */}
              <div
                className="px-4 sm:px-6 py-5 border-t border-border bg-muted/20"
                data-ocid="product-reviews-section"
              >
                {/* Header with count badge */}
                <div className="flex items-center justify-between mb-5 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-tight">
                        Customer Reviews
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "h-3 w-3",
                                s <= Math.round(avgRating)
                                  ? "fill-accent text-accent"
                                  : "fill-muted text-muted",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {reviews.length} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm((v) => !v)}
                    className="shrink-0 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    data-ocid="toggle-review-form"
                  >
                    {showForm ? "Cancel" : "⭐ Write a Review"}
                  </button>
                </div>

                {/* Rating distribution bar */}
                {!reviewsLoading && reviews.length > 0 && (
                  <div className="mb-5 space-y-1.5">
                    {ratingCounts.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-3 shrink-0">
                          {star}
                        </span>
                        <Star className="h-3 w-3 fill-accent text-accent shrink-0" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{
                              width: `${(count / maxCount) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-4 shrink-0 text-right">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Review submission form ── */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-card rounded-xl border border-border p-4 mb-5 space-y-4">
                        <p className="text-sm font-bold text-foreground">
                          Rate this product
                        </p>

                        {/* Star rating picker — prominent */}
                        <div className="bg-muted/30 rounded-xl p-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                            Your Rating
                          </p>
                          <fieldset
                            aria-label="Star rating"
                            className="border-0 p-0 m-0"
                          >
                            <StarPicker
                              value={reviewRating}
                              onChange={setReviewRating}
                              size="lg"
                            />
                          </fieldset>
                          {reviewRating > 0 && (
                            <p className="text-xs font-semibold text-accent mt-1.5">
                              {
                                [
                                  "",
                                  "Poor",
                                  "Fair",
                                  "Good",
                                  "Very Good",
                                  "Excellent",
                                ][reviewRating]
                              }
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="review-name"
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5"
                          >
                            Your Name
                          </label>
                          <input
                            id="review-name"
                            type="text"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            placeholder="e.g. Aarav S."
                            className="w-full rounded-lg border border-input bg-background text-foreground text-sm px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
                            data-ocid="review-name-input"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="review-text"
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5"
                          >
                            Your Review
                          </label>
                          <textarea
                            id="review-text"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="What did you think of this product? Quality, fit, delivery…"
                            rows={3}
                            className="w-full rounded-lg border border-input bg-background text-foreground text-sm px-3 py-2.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
                            data-ocid="review-text-input"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSubmitReview}
                          disabled={submitting}
                          className="rounded-full font-semibold h-10 px-5"
                          data-ocid="review-submit-btn"
                        >
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          {submitting ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reviews list */}
                {reviewsLoading ? (
                  <div className="space-y-4" data-ocid="reviews-loading">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2 py-3">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="reviews-empty"
                  >
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No reviews yet</p>
                    <p className="text-xs mt-1">
                      Be the first to review this product!
                    </p>
                  </div>
                ) : (
                  <div
                    className="bg-card rounded-xl border border-border divide-y divide-border px-4"
                    data-ocid="reviews-list"
                  >
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── SIMILAR ITEMS ── */}
              {allSimilar.length > 0 && (
                <div className="px-4 sm:px-6 py-5 border-t border-border">
                  <h3 className="text-base font-bold text-foreground mb-4">
                    Similar Items{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      you may also like
                    </span>
                  </h3>
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    data-ocid="similar-items-grid"
                  >
                    {visibleSimilar.map((p) => (
                      <SimilarItemCard
                        key={p.id}
                        product={p}
                        onClick={() => handleSimilarClick(p)}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div
                      ref={sentinelRef}
                      className="h-10 flex items-center justify-center mt-3"
                      data-ocid="similar-items-sentinel"
                    >
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.2,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasMore && allSimilar.length > PAGE_SIZE && (
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      All {allSimilar.length} similar items shown
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── STICKY ADD-TO-CART BAR (mobile only) ── */}
            <div className="sm:hidden sticky bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 flex flex-col gap-2 shadow-[0_-4px_20px_oklch(0_0_0/0.12)]">
              <div className="flex items-center gap-3">
                {/* Qty controls */}
                <div className="flex items-center gap-0.5 rounded-full border border-input bg-card shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Decrease quantity"
                    data-ocid="modal-qty-dec-mobile"
                  >
                    <Minus className="h-4 w-4 text-foreground" />
                  </button>
                  <span
                    className="w-8 text-center text-sm font-bold text-foreground"
                    data-ocid="modal-qty-display-mobile"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Increase quantity"
                    data-ocid="modal-qty-inc-mobile"
                  >
                    <Plus className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className={cn(
                    "flex-1 rounded-full font-bold text-sm h-12 transition-smooth",
                    adding && "scale-95",
                  )}
                  data-ocid="modal-add-to-cart-mobile"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {adding ? "Added!" : "Add to Cart"}
                </Button>
              </div>

              {/* Report damaged — compact link */}
              <button
                type="button"
                onClick={handleReportDamage}
                disabled={reportingDamage}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                data-ocid="modal-report-damage-btn-mobile"
              >
                <AlertTriangle className="h-3 w-3" />
                {reportingDamage
                  ? "Submitting report…"
                  : "Report damaged / defective item"}
              </button>
            </div>
          </motion.dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
