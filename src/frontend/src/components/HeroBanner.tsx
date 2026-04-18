import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "motion/react";

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
