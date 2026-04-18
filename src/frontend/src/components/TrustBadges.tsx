import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const badges = [
  {
    icon: Truck,
    label: "Free Shipping",
    sub: "On orders over ₹499",
    color: "text-accent",
  },
  {
    icon: ShieldCheck,
    label: "Secure Checkout",
    sub: "100% protected",
    color: "text-accent",
  },
  {
    icon: RotateCcw,
    label: "Easy Returns",
    sub: "30-day hassle free",
    color: "text-accent",
  },
  {
    icon: Headphones,
    label: "24/7 Support",
    sub: "Always here to help",
    color: "text-accent",
  },
];

export function TrustBadges() {
  return (
    <section
      className="bg-card border-b border-border py-3"
      data-ocid="trust-badges"
    >
      {/* Mobile: horizontal scroll row; md+: centered flex-wrap */}
      <div className="w-full overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-3 px-4 sm:px-6 min-w-max md:min-w-0 md:justify-center md:flex-wrap md:gap-6 mx-auto">
          {badges.map(({ icon: Icon, label, sub, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 flex-shrink-0 min-w-[130px] md:min-w-0"
            >
              <div
                className={`flex-shrink-0 p-1.5 rounded-full bg-accent/10 ${color} animate-pulse-glow`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight whitespace-nowrap">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground leading-tight whitespace-nowrap hidden sm:block">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
