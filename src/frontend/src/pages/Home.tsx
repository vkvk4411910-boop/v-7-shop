import { HeroBanner } from "@/components/HeroBanner";
import { ProductCard } from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { TrustBadges } from "@/components/TrustBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NEW_ARRIVALS } from "@/data/products";
import { useStore } from "@/store/useStore";
import { CATEGORIES } from "@/types";
import type { Category, Product } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Nike Air Force 1 '07",
    brand: "Nike",
    category: "shoes",
    price: 7495,
    originalPrice: 9999,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=533&fit=crop",
    rating: 4.7,
    reviewCount: 12840,
    badge: "bestseller",
    tags: ["shoes", "men"],
  },
  {
    id: "p2",
    name: "Adidas Ultraboost 22",
    brand: "Adidas",
    category: "shoes",
    price: 11999,
    originalPrice: 16999,
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=533&fit=crop",
    rating: 4.8,
    reviewCount: 8920,
    badge: "sale",
    tags: ["shoes", "sports"],
  },
  {
    id: "p3",
    name: "Relaxed Fit Linen Shirt",
    brand: "H&M",
    category: "men",
    price: 1299,
    originalPrice: 1799,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=533&fit=crop",
    rating: 4.3,
    reviewCount: 2340,
    badge: "new",
    tags: ["men", "shirt"],
  },
  {
    id: "p4",
    name: "Floral Wrap Midi Dress",
    brand: "Zara",
    category: "women",
    price: 2999,
    originalPrice: 3999,
    image:
      "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=533&fit=crop",
    rating: 4.5,
    reviewCount: 5670,
    badge: "hot",
    tags: ["women", "dress"],
  },
  {
    id: "p5",
    name: "Lakme Absolute Foundation",
    brand: "Lakme",
    category: "beauty",
    price: 649,
    originalPrice: 899,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=533&fit=crop",
    rating: 4.4,
    reviewCount: 14200,
    badge: "bestseller",
    tags: ["beauty"],
  },
  {
    id: "p6",
    name: "Puma Training Backpack",
    brand: "Puma",
    category: "sports",
    price: 1999,
    originalPrice: 2799,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=533&fit=crop",
    rating: 4.2,
    reviewCount: 3100,
    badge: "sale",
    tags: ["sports", "accessories"],
  },
  {
    id: "p7",
    name: "Levi's 511 Slim Jeans",
    brand: "Levi's",
    category: "men",
    price: 2999,
    originalPrice: 4299,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=533&fit=crop",
    rating: 4.6,
    reviewCount: 18500,
    badge: "bestseller",
    tags: ["men", "jeans"],
  },
  {
    id: "p8",
    name: "Maybelline Fit Me BB Cream",
    brand: "Maybelline",
    category: "beauty",
    price: 249,
    originalPrice: 349,
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=533&fit=crop",
    rating: 4.5,
    reviewCount: 25600,
    badge: "hot",
    tags: ["beauty"],
  },
];

export const BRANDS = [
  {
    name: "Nike",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
    bg: "bg-muted/40",
  },
  {
    name: "Adidas",
    logo: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&h=200&fit=crop",
    bg: "bg-muted/40",
  },
  {
    name: "Levi's",
    logo: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
    bg: "bg-muted/40",
  },
  {
    name: "Zara",
    logo: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=200&h=200&fit=crop",
    bg: "bg-muted/40",
  },
  {
    name: "H&M",
    logo: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop",
    bg: "bg-muted/40",
  },
  {
    name: "Puma",
    logo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
    bg: "bg-muted/40",
  },
];

export function HomePage() {
  const { setActiveCategory } = useStore();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Flash sale countdown — starts at 4 hours from page load
  const [saleSeconds, setSaleSeconds] = useState(4 * 60 * 60);
  useEffect(() => {
    const timer = setInterval(() => {
      setSaleSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const hh = String(Math.floor(saleSeconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((saleSeconds % 3600) / 60)).padStart(2, "0");
  const ss = String(saleSeconds % 60).padStart(2, "0");

  const handleCategory = (cat: Category) => {
    setActiveCategory(cat);
    navigate({ to: "/products", search: { q: "", category: cat } });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroBanner />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Category Navigation */}
      <section
        className="py-5 sm:py-6 bg-background"
        data-ocid="categories-section"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
              Shop by Category
            </h2>
            <Link to="/products" search={{ q: "", category: "" }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-xs font-semibold"
              >
                View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          {/* 2 cols on 320px, 3 at sm, 4 at md, 6 at lg */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => handleCategory(cat.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-3 rounded-2xl bg-card hover:bg-primary/5 border border-border hover:border-primary/30 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[72px]"
                data-ocid={`category-${cat.id}`}
              >
                <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </span>
                <span className="text-xs font-semibold text-foreground text-center leading-tight">
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section
        className="bg-gradient-to-r from-destructive via-destructive/90 to-secondary py-3 sm:py-4"
        data-ocid="flash-sale-banner"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stacked on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">⚡</span>
              <div>
                <p className="text-primary-foreground font-display font-extrabold text-base sm:text-lg leading-none">
                  Flash Sale
                </p>
                <p className="text-primary-foreground/80 text-xs sm:text-sm">
                  Up to 70% OFF on top brands
                </p>
              </div>
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs animate-pulse-glow ml-1 sm:ml-2 whitespace-nowrap">
                Ends in{" "}
                <span className="font-mono ml-1">
                  {hh}:{mm}:{ss}
                </span>
              </Badge>
            </div>
            <Link to="/products" search={{ q: "sale", category: "" }}>
              <Button
                size="sm"
                className="bg-card text-foreground hover:bg-card/90 rounded-full font-bold text-xs min-h-[44px] sm:min-h-[36px] px-4"
                data-ocid="flash-sale-cta"
              >
                Grab Deals <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section
        id="new-arrivals"
        className="py-8 sm:py-10 bg-background"
        data-ocid="new-arrivals-section"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading row */}
          <motion.div
            className="flex items-center justify-between mb-5 sm:mb-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-display font-extrabold text-foreground leading-tight">
                  New Arrivals
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Fresh styles added daily — be first to wear them
                </p>
              </div>
            </div>
            <Link to="/products" search={{ q: "new", category: "" }}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0"
                data-ocid="new-arrivals-view-all"
              >
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Badge strip */}
          <motion.div
            className="flex items-center gap-2 mb-4 sm:mb-5 overflow-x-auto pb-1 scrollbar-hide"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            {["All", "Shoes", "Men", "Women", "Beauty", "Sports"].map(
              (label) => (
                <Link
                  key={label}
                  to="/products"
                  search={{
                    q: label === "All" ? "new" : label.toLowerCase(),
                    category:
                      label === "All" ? "" : (label.toLowerCase() as Category),
                  }}
                  className="shrink-0 px-3.5 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth whitespace-nowrap"
                  data-ocid={`new-arrivals-filter-${label.toLowerCase()}`}
                >
                  {label}
                </Link>
              ),
            )}
          </motion.div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {NEW_ARRIVALS.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <ProductCard
                  product={product}
                  index={i}
                  onViewDetails={setSelectedProduct}
                />
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <motion.div
            className="mt-6 sm:mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link to="/products" search={{ q: "new", category: "" }}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 font-bold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                data-ocid="new-arrivals-explore-all"
              >
                Explore All New Arrivals <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        className="py-6 sm:py-8 bg-muted/30"
        data-ocid="featured-products"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-foreground">
                Trending Now
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Hand-picked popular products
              </p>
            </div>
            <Link to="/products" search={{ q: "", category: "" }}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                data-ocid="view-all-products"
              >
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          {/* 2 cols mobile (tight gap), 3 at md, 4 at lg */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {SAMPLE_PRODUCTS.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section
        className="py-6 sm:py-8 bg-background"
        data-ocid="brands-section"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-foreground">
              Top Brands
            </h2>
            <Link to="/products" search={{ q: "", category: "" }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-xs"
              >
                All Brands <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          {/* 3 cols mobile, 6 at sm */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {BRANDS.map((brand, i) => (
              <Link
                key={brand.name}
                to="/products"
                search={{ q: brand.name, category: "" }}
                className="group flex flex-col items-center gap-1.5 sm:gap-2"
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="w-full"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border group-hover:border-primary/40 group-hover:shadow-glow-primary transition-smooth">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground block text-center mt-1.5">
                    {brand.name}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-8 sm:py-10 bg-gradient-to-br from-primary/10 via-background to-accent/10"
        data-ocid="cta-section"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-foreground mb-2 sm:mb-3">
              Your Style, Your Way
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xs sm:max-w-md mx-auto mb-5 sm:mb-6">
              Join 2 million+ shoppers who trust V-7 Shop for the best fashion
              deals. New arrivals every day. COD available across India.
            </p>
            <Link to="/products" search={{ q: "", category: "" }}>
              <Button
                size="lg"
                className="rounded-full px-6 sm:px-8 font-bold shadow-glow-primary min-h-[48px]"
                data-ocid="cta-start-shopping"
              >
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Product detail modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
