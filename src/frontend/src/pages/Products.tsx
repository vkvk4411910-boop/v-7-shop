import { ProductCard } from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALL_PRODUCTS, BRANDS } from "@/data/products";
import { CATEGORIES } from "@/types";
import type { Category, Product } from "@/types";
import { useSearch } from "@tanstack/react-router";
import { ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

export const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "discount", label: "Biggest Discount" },
  { value: "new", label: "New Arrivals" },
];

export const PRICE_RANGES = [
  { label: "Under ₹1K", min: 0, max: 1000 },
  { label: "₹1K–5K", min: 1000, max: 5000 },
  { label: "₹5K–10K", min: 5000, max: 10000 },
  { label: "₹10K+", min: 10000, max: Number.POSITIVE_INFINITY },
];

// ── Filter Panel Content (shared by drawer + sidebar) ──────────────────────
interface FilterContentProps {
  selectedBrand: string | null;
  setSelectedBrand: (b: string | null) => void;
  priceRange: number | null;
  setPriceRange: (p: number | null) => void;
}

function FilterContent({
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
}: FilterContentProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Brand filter */}
      <div>
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
          Brand
        </p>
        <div className="flex flex-col gap-1">
          {BRANDS.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-3 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-muted/60 transition-smooth"
            >
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === brand}
                onChange={() =>
                  setSelectedBrand(selectedBrand === brand ? null : brand)
                }
                onClick={() =>
                  selectedBrand === brand && setSelectedBrand(null)
                }
                className="w-4 h-4 accent-primary cursor-pointer"
                data-ocid={`filter-brand-${brand.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              />
              <span className="text-sm text-foreground">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
          Price Range
        </p>
        <div className="flex flex-col gap-1">
          {PRICE_RANGES.map((range, i) => (
            <label
              key={range.label}
              className="flex items-center gap-3 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-muted/60 transition-smooth"
            >
              <input
                type="radio"
                name="price"
                checked={priceRange === i}
                onChange={() => setPriceRange(priceRange === i ? null : i)}
                onClick={() => priceRange === i && setPriceRange(null)}
                className="w-4 h-4 accent-primary cursor-pointer"
                data-ocid={`filter-price-${i}`}
              />
              <span className="text-sm text-foreground">{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export function ProductsPage() {
  const search = useSearch({ from: "/products" });
  const [sort, setSort] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    (search.category as Category) || "all",
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const searchQuery = (search.q || "").toLowerCase();

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const filtered = useMemo(() => {
    let items = [...ALL_PRODUCTS];
    if (selectedCategory !== "all") {
      items = items.filter((p) => p.category === selectedCategory);
    }
    if (selectedBrand) {
      items = items.filter((p) => p.brand === selectedBrand);
    }
    if (priceRange !== null) {
      const range = PRICE_RANGES[priceRange];
      items = items.filter((p) => p.price >= range.min && p.price < range.max);
    }
    if (searchQuery) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.brand.toLowerCase().includes(searchQuery) ||
          p.tags.some((t) => t.includes(searchQuery)),
      );
    }
    switch (sort) {
      case "price-asc":
        return [...items].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...items].sort((a, b) => b.price - a.price);
      case "rating":
        return [...items].sort((a, b) => b.rating - a.rating);
      case "discount":
        return [...items].sort(
          (a, b) =>
            (b.originalPrice - b.price) / b.originalPrice -
            (a.originalPrice - a.price) / a.originalPrice,
        );
      case "new":
        return [...items]
          .filter((p) => p.badge === "new")
          .concat([...items].filter((p) => p.badge !== "new"));
      default:
        return [...items].sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }, [selectedCategory, selectedBrand, priceRange, searchQuery, sort]);

  const hasFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedBrand ||
    priceRange !== null;

  const clearAll = () => {
    setSelectedCategory("all");
    setSelectedBrand(null);
    setPriceRange(null);
  };

  const pageTitle = selectedBrand
    ? selectedBrand
    : selectedCategory === "all"
      ? "All Products"
      : (CATEGORIES.find((c) => c.id === selectedCategory)?.label ??
        "Products");

  return (
    <div className="min-w-0 w-full overflow-x-hidden" data-ocid="products-page">
      {/* ── Mobile Drawer Overlay ─────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
              data-ocid="filter-drawer-backdrop"
            />
            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-[320px] bg-card shadow-2xl flex flex-col md:hidden"
              data-ocid="filter-drawer"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-bold text-base text-foreground">
                    Filters
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-smooth"
                  aria-label="Close filters"
                  data-ocid="filter-drawer-close"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <FilterContent
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </div>

              {/* Drawer footer */}
              <div className="flex gap-3 px-5 py-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 min-h-[44px] rounded-full"
                  onClick={() => {
                    clearAll();
                    setDrawerOpen(false);
                  }}
                  data-ocid="filter-drawer-clear"
                >
                  Clear All
                </Button>
                <Button
                  type="button"
                  className="flex-1 min-h-[44px] rounded-full"
                  onClick={() => setDrawerOpen(false)}
                  data-ocid="filter-drawer-apply"
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page Container ───────────────────────────────── */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Category chips — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`flex-shrink-0 min-h-[36px] px-4 py-1.5 rounded-full text-xs font-semibold border transition-smooth ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/50"
            }`}
            data-ocid="category-all"
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 min-h-[36px] flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-smooth ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              }`}
              data-ocid={`filter-category-${cat.id}`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Main Layout: sidebar + content ─────────────── */}
        <div className="flex gap-4 lg:gap-6 items-start">
          {/* ── Desktop sidebar (lg+): always visible ─────── */}
          <aside className="hidden lg:flex flex-col gap-0 w-56 xl:w-64 flex-shrink-0 bg-card rounded-xl border border-border overflow-hidden sticky top-20">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="font-display font-bold text-sm text-foreground">
                Filters
              </h2>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-auto text-xs text-primary font-medium hover:underline"
                  data-ocid="sidebar-clear-btn"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="px-4 py-4">
              <FilterContent
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </div>
          </aside>

          {/* ── Main content column ──────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Header row — responsive */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-display font-extrabold text-foreground leading-tight truncate">
                  {pageTitle}
                  {searchQuery && (
                    <span className="text-muted-foreground font-normal text-sm sm:text-base ml-2">
                      for &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {filtered.length.toLocaleString()} products
                </p>
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Filter button: shown on mobile + tablet (hidden on desktop where sidebar exists) */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold border border-border bg-card text-foreground hover:border-primary/50 transition-smooth"
                  data-ocid="filter-open-btn"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {(selectedBrand !== null || priceRange !== null) && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      {(selectedBrand ? 1 : 0) + (priceRange !== null ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="min-h-[44px] text-xs border border-input rounded-full px-3 py-1.5 bg-card text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer w-full sm:w-auto max-w-[180px]"
                    data-ocid="sort-select"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div
                className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap"
                data-ocid="active-filters"
              >
                <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {searchQuery}
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/10 transition-smooth"
                    onClick={() => setSelectedCategory("all")}
                    data-ocid="chip-category"
                  >
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {selectedBrand && (
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/10 transition-smooth"
                    onClick={() => setSelectedBrand(null)}
                    data-ocid="chip-brand"
                  >
                    {selectedBrand}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {priceRange !== null && (
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/10 transition-smooth"
                    onClick={() => setPriceRange(null)}
                    data-ocid="chip-price"
                  >
                    {PRICE_RANGES[priceRange].label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-primary font-medium hover:underline min-h-[32px] px-1"
                  data-ocid="clear-filters-btn"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Brand spotlight chips */}
            {selectedCategory === "all" && !selectedBrand && !searchQuery && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide -mx-1 px-1">
                {BRANDS.map((brand) => (
                  <motion.button
                    key={brand}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedBrand(brand)}
                    className="flex-shrink-0 min-h-[36px] flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full text-xs font-semibold text-foreground hover:border-primary/60 hover:bg-primary/5 transition-smooth"
                    data-ocid={`brand-chip-${brand.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  >
                    {brand}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Product grid */}
            {filtered.length === 0 ? (
              <div
                className="text-center py-16 sm:py-20 bg-card rounded-2xl border border-border"
                data-ocid="empty-products"
              >
                <p className="text-4xl sm:text-5xl mb-4">🔍</p>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground text-sm mb-6 px-4">
                  Try adjusting your search or filters
                </p>
                <Button
                  type="button"
                  onClick={clearAll}
                  variant="outline"
                  className="rounded-full"
                  data-ocid="empty-clear-btn"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i % 10}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>
            )}

            {/* Results footer */}
            {filtered.length > 0 && (
              <p className="text-center text-xs text-muted-foreground mt-8 pb-4">
                Showing all {filtered.length.toLocaleString()} results
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product detail modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProductChange={setSelectedProduct}
      />
    </div>
  );
}
