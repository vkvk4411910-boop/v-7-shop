import { CrystalCube } from "@/components/CrystalCube";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "motion/react";

const OFFER_CARDS = [
  {
    label: "UP TO 70% OFF",
    category: "Men's Fashion",
    bg: "linear-gradient(135deg, #7C3AED, #a855f7)",
    img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "FLAT 50% OFF",
    category: "Women's Wear",
    bg: "linear-gradient(135deg, #db2777, #f472b6)",
    img: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "NEW SEASON",
    category: "Sneakers",
    bg: "linear-gradient(135deg, #0891b2, #22d3ee)",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "BUY 2 GET 1",
    category: "Accessories",
    bg: "linear-gradient(135deg, #ea580c, #fb923c)",
    img: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "60% OFF",
    category: "Beauty & Skin",
    bg: "linear-gradient(135deg, #16a34a, #4ade80)",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "FLASH SALE",
    category: "Sports Gear",
    bg: "linear-gradient(135deg, #d97706, #fbbf24)",
    img: "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "40% OFF",
    category: "Watches",
    bg: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "MEGA DEALS",
    category: "Ethnic Wear",
    bg: "linear-gradient(135deg, #be185d, #e879a0)",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "30% OFF",
    category: "Sunglasses",
    bg: "linear-gradient(135deg, #0f766e, #2dd4bf)",
    img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=96&h=96&fit=crop&q=80",
  },
  {
    label: "BIG SALE",
    category: "Formal Shoes",
    bg: "linear-gradient(135deg, #6d28d9, #8b5cf6)",
    img: "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=96&h=96&fit=crop&q=80",
  },
];

export function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden bg-primary min-h-[280px] sm:min-h-[360px] md:min-h-[420px]"
      data-ocid="hero-banner"
    >
      {/* Background image */}
      <img
        src="/assets/generated/hero-banner.dim_1200x450.jpg"
        alt="V-7 Shop marketplace banner"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 flex flex-col items-start justify-center gap-3 sm:gap-4 min-h-[280px] sm:min-h-[360px] md:min-h-[420px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-secondary/90 text-secondary-foreground border-0 text-xs font-semibold px-3 py-1 mb-2 sm:mb-3 inline-flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Flash Sale — Up to 70% Off!
          </Badge>
        </motion.div>

        <motion.h1
          className="text-2xl sm:text-4xl md:text-5xl font-display font-extrabold text-primary-foreground leading-tight max-w-xs sm:max-w-md md:max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Style That Speaks
          <br />
          <span className="text-secondary">Your Language</span>
        </motion.h1>

        <motion.p
          className="text-primary-foreground/80 text-xs sm:text-sm md:text-base max-w-xs sm:max-w-md leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Explore 15,000+ products across fashion, shoes, beauty &amp; sports.
          Trusted by millions. Delivered fast.
        </motion.p>

        {/* 3D Crystal Cube — discount posters, drag to rotate */}
        <motion.div
          className="w-full max-w-xs sm:max-w-sm md:max-w-md mt-2"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          data-ocid="hero-crystal-cube"
        >
          <CrystalCube />
        </motion.div>

        {/* Style Offers Marquee — scrolls left to right infinitely */}
        <motion.div
          className="w-full max-w-xs sm:max-w-sm md:max-w-md overflow-hidden rounded-xl mt-2"
          style={{ height: "88px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          data-ocid="hero-offers-marquee"
        >
          <div className="marquee-track flex items-center gap-3 h-full">
            {OFFER_CARDS.concat(OFFER_CARDS).map((card, i) => (
              <div
                key={`${card.category}-${i < OFFER_CARDS.length ? "a" : "b"}`}
                className="flex-shrink-0 flex items-center gap-2.5 rounded-xl px-3 py-2 h-[72px] w-[150px]"
                style={{ background: card.bg }}
              >
                <img
                  src={card.img}
                  alt={card.category}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-extrabold text-xs leading-tight truncate">
                    {card.label}
                  </span>
                  <span className="text-white/80 text-[10px] font-medium leading-tight truncate mt-0.5">
                    {card.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/products" search={{ q: "", category: "" }}>
            <Button
              size="default"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-5 sm:px-6 rounded-full shadow-lg hover:shadow-xl transition-smooth text-sm min-h-[44px]"
              data-ocid="hero-shop-now"
            >
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/products" search={{ q: "new arrivals", category: "" }}>
            <Button
              variant="ghost"
              size="default"
              className="text-primary-foreground hover:bg-white/20 rounded-full px-5 sm:px-6 text-sm min-h-[44px]"
              data-ocid="hero-new-arrivals"
              onClick={() =>
                document
                  .getElementById("new-arrivals")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              New Arrivals
            </Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="flex items-center gap-4 sm:gap-6 mt-2 sm:mt-4 text-primary-foreground/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          {[
            { num: "15K+", label: "Products" },
            { num: "500+", label: "Brands" },
            { num: "2M+", label: "Customers" },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <p className="text-base sm:text-lg font-display font-extrabold text-primary-foreground leading-none">
                {num}
              </p>
              <p className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
