import ProductDetailModal from "@/components/ProductDetailModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import type { Product } from "@/types";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
  onViewDetails?: (product: Product) => void;
}

const BADGE_STYLES: Record<string, string> = {
  new: "bg-accent text-accent-foreground",
  sale: "bg-secondary text-secondary-foreground",
  hot: "bg-destructive text-destructive-foreground",
  bestseller: "bg-primary text-primary-foreground",
};

export function ProductCard({
  product,
  index = 0,
  onViewDetails,
}: ProductCardProps) {
  const addToCart = useStore((s) => s.addToCart);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [localSelected, setLocalSelected] = useState<Product | null>(null);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      duration: 2000,
      icon: "🛒",
    });
    setTimeout(() => setAdding(false), 600);
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      setLocalSelected(product);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted((w) => !w);
  };

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: index * 0.06 }}
        className="group relative bg-card rounded-xl overflow-hidden card-elevated hover:card-elevated-hover transition-smooth cursor-pointer text-left w-full"
        onClick={handleCardClick}
        aria-label={`View details for ${product.name}`}
        data-ocid={`product-card-${product.id}`}
      >
        {/* Wishlist — always visible on mobile (touch), hover on desktop */}
        <button
          type="button"
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 right-2 z-10 p-2 rounded-full transition-smooth min-w-[36px] min-h-[36px] flex items-center justify-center",
            wishlisted
              ? "bg-destructive/10 text-destructive"
              : "bg-card/80 text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 opacity-100",
          )}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          data-ocid="wishlist-btn"
        >
          <Heart className={cn("h-3.5 w-3.5", wishlisted && "fill-current")} />
        </button>

        {/* Badge */}
        {product.badge && (
          <Badge
            className={cn(
              "absolute top-2 left-2 z-10 text-xs font-bold px-2 py-0.5 border-0",
              BADGE_STYLES[product.badge],
            )}
          >
            {product.badge === "sale" && discount > 0
              ? `-${discount}%`
              : product.badge.toUpperCase()}
          </Badge>
        )}

        {/* Image — fixed aspect ratio prevents distortion */}
        <div className="relative overflow-hidden bg-muted/30 aspect-[3/4]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info */}
        <div className="p-2.5 sm:p-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
            {product.brand}
          </p>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-tight mt-0.5 line-clamp-2 min-h-[2.25rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center gap-0.5 bg-accent/10 px-1.5 py-0.5 rounded text-accent text-xs font-bold">
              <Star className="h-3 w-3 fill-current" />
              {product.rating.toFixed(1)}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-foreground font-display">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {discount > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through hidden sm:inline">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-bold text-accent">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          {/* Add to cart — min-height 44px for touch targets */}
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={cn(
              "w-full mt-2 rounded-full font-semibold text-xs min-h-[44px] sm:min-h-[36px] transition-smooth",
              adding && "scale-95",
            )}
            data-ocid="add-to-cart-btn"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            {adding ? "Added!" : "Add to Cart"}
          </Button>
        </div>
      </motion.button>

      {/* Local modal (when no parent handler) */}
      <ProductDetailModal
        product={localSelected}
        onClose={() => setLocalSelected(null)}
        onProductChange={(p) => setLocalSelected(p)}
      />
    </>
  );
}
