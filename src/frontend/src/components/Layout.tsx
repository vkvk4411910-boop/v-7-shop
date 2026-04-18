import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/store/useStore";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { Header } from "./Header";

const SOCIAL_LINKS = [
  { Icon: SiFacebook, label: "Facebook", href: "https://facebook.com" },
  { Icon: SiInstagram, label: "Instagram", href: "https://instagram.com" },
  { Icon: SiX, label: "X (Twitter)", href: "https://x.com" },
];

const FOOTER_LINKS = {
  About: ["About Us", "Careers", "Press", "Blog"],
  Support: ["Contact Us", "FAQ", "Shipping Policy", "Return Policy"],
  Categories: ["Men's Fashion", "Women's Fashion", "Shoes", "Beauty"],
};

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "shopzone";

  return (
    <footer
      className="bg-foreground text-background/80 mt-12"
      data-ocid="footer"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
        {/* Grid: 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center sm:items-start">
            <h2 className="text-background font-display font-extrabold text-2xl mb-2">
              V-7 Shop
            </h2>
            <p className="text-sm leading-relaxed opacity-70 max-w-xs">
              India's vibrant marketplace for fashion, shoes, beauty &amp;
              lifestyle products.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-background/10 text-background hover:bg-primary transition-smooth min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, items]) => (
            <div
              key={title}
              className="flex flex-col items-center sm:items-start"
            >
              <h3 className="text-background font-semibold text-sm mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-xs hover:text-background transition-colors opacity-70 hover:opacity-100"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-60 text-center sm:text-left">
          <p>
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-100 transition-opacity"
            >
              caffeine.ai
            </a>
          </p>
          <p>Cash on Delivery available across India</p>
        </div>
      </div>
    </footer>
  );
}

export function Layout() {
  const { activeTheme } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 bg-background w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
