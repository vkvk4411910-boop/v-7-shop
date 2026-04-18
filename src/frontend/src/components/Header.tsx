import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIdentity } from "@/hooks/useIdentity";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Home,
  LayoutDashboard,
  Menu,
  Mic,
  MicOff,
  Package,
  Phone,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

/** Gmail-style avatar circle with first letter */
export function GmailAvatarButton({
  displayName,
  avatarColor,
  onClick,
}: {
  displayName: string;
  avatarColor: string;
  onClick: () => void;
}) {
  const letter = displayName.charAt(0).toUpperCase() || "G";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Account: ${displayName}`}
      data-ocid="user-avatar-btn"
      className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 flex-shrink-0 shadow-md"
      style={{ backgroundColor: avatarColor }}
    >
      {letter}
    </button>
  );
}

/** User dropdown menu */
export function UserDropdown({
  displayName,
  avatarColor,
  onClose,
  onLogout,
}: {
  displayName: string;
  avatarColor: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  const letter = displayName.charAt(0).toUpperCase() || "G";
  const navigate = useNavigate();

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
        aria-hidden="true"
      />
      <div
        data-ocid="user-dropdown"
        className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up"
      >
        <div className="px-4 py-4 border-b border-border flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg text-white flex-shrink-0 shadow"
            style={{ backgroundColor: avatarColor }}
          >
            {letter}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs text-green-600 font-medium mt-0.5">
              ✓ Signed in with Google
            </p>
          </div>
        </div>

        <div className="py-2 px-2">
          <button
            type="button"
            data-ocid="dropdown-orders-link"
            onClick={() => {
              navigate({ to: "/orders" });
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
          >
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              My Orders
            </span>
          </button>

          <button
            type="button"
            data-ocid="dropdown-logout-btn"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 transition-colors text-left group"
          >
            <svg
              className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-sm font-medium text-foreground group-hover:text-destructive transition-colors">
              Sign out
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

/** Mobile nav drawer */
function MobileDrawer({
  isOpen,
  onClose,
  isLoggedIn,
  displayName,
  avatarColor,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  displayName: string;
  avatarColor: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const letter = displayName.charAt(0).toUpperCase() || "G";

  // Lock scroll when drawer open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/products", label: "Products", Icon: ShoppingBag },
    { to: "/cart", label: "Cart", Icon: ShoppingCart },
    { to: "/orders", label: "My Orders", Icon: Package },
    { to: "/contact", label: "Contact", Icon: Phone },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        data-ocid="mobile-drawer"
        className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-card shadow-2xl flex flex-col lg:hidden animate-slide-in-right"
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-display font-extrabold text-xl text-foreground">
            V-7 Shop
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            data-ocid="drawer-close-btn"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User section */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {letter}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-green-600 font-medium">✓ Signed in</p>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 border-b border-border">
            <button
              type="button"
              data-ocid="drawer-login-btn"
              onClick={() => {
                navigate({ to: "/login", search: { returnUrl: "/" } });
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-smooth hover:opacity-90"
            >
              <User className="h-4 w-4" />
              Login with Google
            </button>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navLinks.map(({ to, label, Icon }) => (
            <button
              key={to}
              type="button"
              data-ocid={`drawer-nav-${label.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => {
                navigate({ to: to as "/" });
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/60 transition-colors text-left text-foreground"
            >
              <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}

          {isLoggedIn && (
            <button
              type="button"
              data-ocid="drawer-admin-link"
              onClick={() => {
                navigate({ to: "/admin" });
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/60 transition-colors text-left text-foreground"
            >
              <LayoutDashboard className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </button>
          )}
        </nav>

        {/* Theme switcher */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Theme
          </p>
          <ThemeSwitcher />
        </div>

        {/* Logout */}
        {isLoggedIn && (
          <div className="px-5 pb-6">
            <button
              type="button"
              data-ocid="drawer-logout-btn"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm transition-smooth hover:bg-destructive/20"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/** Expandable mobile search overlay */
function MobileSearchOverlay({
  isOpen,
  onClose,
  inputValue,
  setInputValue,
  suggestions,
  onSearch,
  isListening,
  onVoiceToggle,
}: {
  isOpen: boolean;
  onClose: () => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  suggestions: string[];
  onSearch: (q: string) => void;
  isListening: boolean;
  onVoiceToggle: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      data-ocid="mobile-search-overlay"
      className="fixed inset-0 z-50 bg-card flex flex-col lg:hidden"
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-primary">
        <div className="flex-1 flex items-center bg-card rounded-full overflow-hidden shadow-card-soft">
          <Search className="ml-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, brands..."
            className="flex-1 px-3 py-2.5 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none min-w-0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(inputValue);
                onClose();
              }
            }}
            data-ocid="mobile-search-input"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue("")}
              className="p-1.5 text-muted-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onVoiceToggle}
            className={cn(
              "p-2.5 mr-0.5 rounded-full transition-smooth",
              isListening
                ? "text-destructive animate-pulse-glow bg-destructive/10"
                : "text-muted-foreground hover:text-primary",
            )}
            aria-label={
              isListening ? "Stop voice search" : "Start voice search"
            }
            data-ocid="mobile-voice-btn"
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          data-ocid="mobile-search-close-btn"
          className="h-10 w-10 flex items-center justify-center rounded-full text-primary-foreground hover:bg-white/20 flex-shrink-0"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto bg-card">
        {suggestions.length > 0 ? (
          <>
            <p className="px-4 pt-4 pb-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Suggestions
            </p>
            {suggestions.map((s) => (
              <button
                type="button"
                key={s}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/60 transition-colors flex items-center gap-3 border-b border-border/40 last:border-0"
                onClick={() => {
                  onSearch(s);
                  onClose();
                }}
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-foreground">{s}</span>
              </button>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <Search className="h-8 w-8 opacity-30" />
            <p className="text-sm">Type to search…</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Header() {
  const {
    cartCount,
    searchQuery,
    setSearchQuery,
    userDisplayName,
    userAvatarColor,
  } = useStore();
  const { logout, isLoggedIn } = useIdentity();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const count = cartCount();

  const suggestions =
    inputValue.length > 1
      ? [
          `${inputValue} shirts`,
          `${inputValue} shoes`,
          `${inputValue} for women`,
          `${inputValue} sale`,
        ]
      : [];

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      setInputValue(q);
      setShowSuggestions(false);
      navigate({ to: "/products", search: { q, category: "" } });
    },
    [setSearchQuery, navigate],
  );

  const startVoice = () => {
    const w = window as unknown as Record<string, unknown>;
    const SpeechRecognitionAPI = (w.SpeechRecognition ||
      w.webkitSpeechRecognition) as (new () => unknown) | undefined;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI() as Record<string, unknown>;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (e: {
      results: { 0: SpeechRecognitionAlternative }[];
    }) => {
      const transcript = e.results[0][0].transcript;
      handleSearch(transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition as { stop: () => void };
    (recognition.start as () => void)();
    setIsListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleVoiceToggle = () => {
    if (isListening) stopVoice();
    else startVoice();
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = () => setShowSuggestions(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full bg-primary shadow-glow-primary"
        data-ocid="header"
      >
        <div className="w-full px-3 sm:px-4 lg:px-6 py-2.5 flex items-center gap-2 sm:gap-3">
          {/* Logo — always visible, responsive sizing */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2 group"
            data-ocid="header-logo"
          >
            <img
              src="/assets/generated/shopzone-logo-transparent.dim_200x60.png"
              alt="V-7 Shop"
              className="h-7 w-auto object-contain hidden sm:block"
            />
            <span className="text-primary-foreground font-display font-bold text-lg sm:text-xl tracking-tight group-hover:opacity-90 transition-opacity">
              V-7
              <span className="hidden xs:inline"> Shop</span>
            </span>
          </Link>

          {/* Search Bar — hidden on mobile (< lg), full inline on tablet+ */}
          <div
            className="hidden sm:flex flex-1 relative"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowSuggestions(false);
            }}
          >
            <div
              className={cn(
                "flex items-center bg-card rounded-full overflow-hidden transition-smooth w-full",
                "shadow-card-soft hover:shadow-card-hover",
              )}
            >
              <Search className="ml-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products, brands..."
                className="flex-1 px-3 py-2 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none min-w-0"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(e.target.value.length > 1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(inputValue);
                }}
                onFocus={() => setShowSuggestions(inputValue.length > 1)}
                data-ocid="search-input"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue("");
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={isListening ? stopVoice : startVoice}
                className={cn(
                  "p-2.5 mr-0.5 rounded-full transition-smooth focus-visible:outline-none",
                  isListening
                    ? "text-destructive animate-pulse-glow bg-destructive/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                )}
                aria-label={
                  isListening ? "Stop voice search" : "Start voice search"
                }
                data-ocid="voice-search-btn"
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Desktop suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-card-hover border border-border overflow-hidden z-50 animate-slide-up">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors flex items-center gap-2"
                    onClick={() => handleSearch(s)}
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ml-auto sm:ml-0">
            {/* Mobile search icon — only on small screens */}
            <button
              type="button"
              className="sm:hidden h-10 w-10 flex items-center justify-center rounded-full text-primary-foreground hover:bg-white/20 transition-colors"
              aria-label="Open search"
              data-ocid="mobile-search-btn"
              onClick={() => setShowMobileSearch(true)}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart — always visible */}
            <Link to="/cart" data-ocid="cart-btn">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-primary-foreground hover:bg-white/20 h-10 w-10"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary text-secondary-foreground animate-scale-pop border-0"
                    data-ocid="cart-badge"
                  >
                    {count > 99 ? "99+" : count}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Login / Avatar — desktop only; mobile shows in drawer */}
            <div className="hidden sm:flex items-center gap-1">
              {isLoggedIn ? (
                <div className="relative flex items-center gap-1">
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary-foreground hover:bg-white/20 h-10 w-10 hidden md:flex"
                      aria-label="Admin dashboard"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                    </Button>
                  </Link>
                  <GmailAvatarButton
                    displayName={userDisplayName}
                    avatarColor={userAvatarColor}
                    onClick={() => setShowUserMenu((v) => !v)}
                  />
                  {showUserMenu && (
                    <UserDropdown
                      displayName={userDisplayName}
                      avatarColor={userAvatarColor}
                      onClose={() => setShowUserMenu(false)}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              ) : (
                <Link to="/login" search={{ returnUrl: "/" }}>
                  <Button
                    size="sm"
                    className="bg-card text-primary hover:bg-card/90 font-semibold text-xs px-3 h-9 rounded-full"
                    data-ocid="login-btn"
                  >
                    <User className="h-3.5 w-3.5 mr-1" />
                    Login
                  </Button>
                </Link>
              )}

              {/* Theme switcher — md+ only */}
              <div className="hidden md:flex ml-1">
                <ThemeSwitcher />
              </div>
            </div>

            {/* Hamburger menu — visible below lg */}
            <button
              type="button"
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full text-primary-foreground hover:bg-white/20 transition-colors"
              aria-label="Open menu"
              data-ocid="hamburger-btn"
              onClick={() => setShowMobileDrawer(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      <MobileSearchOverlay
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        inputValue={inputValue}
        setInputValue={setInputValue}
        suggestions={suggestions}
        onSearch={handleSearch}
        isListening={isListening}
        onVoiceToggle={handleVoiceToggle}
      />

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        isLoggedIn={isLoggedIn}
        displayName={userDisplayName}
        avatarColor={userAvatarColor}
        onLogout={handleLogout}
      />
    </>
  );
}
