import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminVerifyPassword, useRecordLogin } from "@/hooks/useBackend";
import { useIdentity } from "@/hooks/useIdentity";
import { useStore } from "@/store/useStore";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ChevronRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/** Google "G" SVG icon */
export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

/** Gmail-style avatar circle */
export function GmailAvatar({
  displayName,
  avatarColor,
  size = 40,
}: {
  displayName: string;
  avatarColor: string;
  size?: number;
}) {
  const letter = displayName.charAt(0).toUpperCase() || "G";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: avatarColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {letter}
    </div>
  );
}

type LoginMode = "user" | "admin";

export function LoginPage() {
  const { login, logout, isLoggedIn, isLoading } = useIdentity();
  const { setAdminPassword, adminPassword, userDisplayName, userAvatarColor } =
    useStore();
  const { mutate: recordLogin } = useRecordLogin();
  const { mutateAsync: verifyPassword, isPending: isVerifying } =
    useAdminVerifyPassword();
  const navigate = useNavigate();

  const search = useSearch({ strict: false }) as { returnUrl?: string };
  const returnUrl = search?.returnUrl || "/";

  const [mode, setMode] = useState<LoginMode>("user");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const loginAttempted = useRef(false);

  // Redirect if admin already logged in
  useEffect(() => {
    if (adminPassword) {
      navigate({ to: "/admin" });
    }
  }, [adminPassword, navigate]);

  // Redirect after successful Gmail / Internet Identity login
  useEffect(() => {
    if (isLoggedIn && loginAttempted.current) {
      loginAttempted.current = false;
      recordLogin({ method: "internetIdentity" });
      navigate({ to: returnUrl as "/" });
    }
  }, [isLoggedIn, navigate, returnUrl, recordLogin]);

  const handleIILogin = () => {
    try {
      loginAttempted.current = true;
      login();
    } catch {
      loginAttempted.current = false;
      toast.error("Login cancelled or failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd) return;
    setPwdError("");
    try {
      const ok = await verifyPassword(pwd);
      if (ok) {
        setAdminPassword(pwd);
        recordLogin({ method: "admin" });
        toast.success("Welcome back, Admin!");
        navigate({ to: "/admin" });
      } else {
        setPwdError("Incorrect password. Please try again.");
        setPwd("");
      }
    } catch {
      if (pwd === "justvishal") {
        setAdminPassword(pwd);
        recordLogin({ method: "admin" });
        toast.success("Welcome back, Admin!");
        navigate({ to: "/admin" });
      } else {
        setPwdError("Incorrect password. Please try again.");
        setPwd("");
      }
    }
  };

  const switchToAdmin = () => {
    setMode("admin");
    setPwd("");
    setPwdError("");
  };

  const switchToUser = () => {
    setMode("user");
    setPwd("");
    setPwdError("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Card header */}
          <div className="px-5 sm:px-8 pt-7 sm:pt-8 pb-5 sm:pb-6 text-center border-b border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20">
              {mode === "admin" ? (
                <UserCog className="h-6 w-6 text-primary" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-primary" />
              )}
            </div>
            <h1 className="font-display font-bold text-xl text-foreground tracking-tight">
              {mode === "admin" ? "Admin Login" : "Sign in to V-7 Shop"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "admin"
                ? "Enter admin credentials to access the dashboard"
                : "to continue shopping"}
            </p>
          </div>

          {/* Mode switcher tabs — ALWAYS visible */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={switchToUser}
              data-ocid="login.user_mode_tab"
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                mode === "user"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Users className="h-4 w-4" />
              User Login
            </button>
            <button
              type="button"
              onClick={switchToAdmin}
              data-ocid="login.admin_mode_tab"
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                mode === "admin"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin Login
            </button>
          </div>

          <div className="px-3 sm:px-4 py-3">
            <AnimatePresence mode="wait">
              {mode === "user" ? (
                <motion.div
                  key="user-mode"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Logged-in account display */}
                  {isLoggedIn && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-3 px-3 py-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                    >
                      <GmailAvatar
                        displayName={userDisplayName}
                        avatarColor={userAvatarColor}
                        size={40}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">
                          {userDisplayName}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          ✓ Signed in with Google
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* PRIMARY: Google / Internet Identity login */}
                  <button
                    type="button"
                    onClick={handleIILogin}
                    disabled={isLoading || isLoggedIn}
                    data-ocid="login.google_button"
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-3.5 min-h-[52px] rounded-xl border border-border hover:bg-muted/60 active:bg-muted transition-all group disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mb-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border flex-shrink-0">
                      <GoogleIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-semibold text-sm text-foreground">
                        {isLoggedIn
                          ? "Signed in with Google"
                          : "Sign in with Google"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {isLoggedIn
                          ? userDisplayName
                          : "Use your Internet Identity account"}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground">
                      {isLoading ? (
                        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin block" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {/* Sign Out — ALWAYS visible when on user tab */}
                  <div className="px-1 pb-1 pt-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">
                        account
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      data-ocid="login.logout_button"
                      className="w-full flex items-center gap-3 px-2 sm:px-3 py-3 min-h-[52px] rounded-xl transition-all group hover:bg-destructive/8 hover:text-destructive border border-transparent hover:border-destructive/20"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                        {isLoggedIn ? (
                          <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                        ) : (
                          <RefreshCw className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-sm text-foreground truncate group-hover:text-destructive transition-colors">
                          {isLoggedIn ? "Sign Out" : "Switch Account"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {isLoggedIn
                            ? "Signed in — tap to sign out"
                            : "Clear cached session · sign in fresh"}
                        </div>
                      </div>
                      <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors flex-shrink-0" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="admin-mode"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="py-1"
                >
                  <form
                    onSubmit={handleAdminLogin}
                    className="px-1 sm:px-2 pb-3 pt-1 space-y-3"
                  >
                    {/* Password hint */}
                    <div className="flex items-center gap-2 px-1 py-2 rounded-lg bg-muted/40 border border-border/60">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Hint:{" "}
                        <span className="font-mono text-foreground/70 select-none">
                          ::justvishal
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="admin-pwd"
                        className="text-xs text-muted-foreground font-medium uppercase tracking-wide"
                      >
                        Admin Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-pwd"
                          type={showPwd ? "text" : "password"}
                          value={pwd}
                          onChange={(e) => {
                            setPwd(e.target.value);
                            setPwdError("");
                          }}
                          placeholder="Enter password"
                          className="pr-10 h-11 bg-muted/40 border-input focus:bg-background text-base sm:text-sm"
                          autoFocus
                          data-ocid="login.admin_pwd_input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                          aria-label={
                            showPwd ? "Hide password" : "Show password"
                          }
                        >
                          {showPwd ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {pwdError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive font-medium"
                        data-ocid="login.admin_pwd.error_state"
                      >
                        {pwdError}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-semibold"
                      disabled={!pwd || isVerifying}
                      data-ocid="login.admin_submit_button"
                    >
                      {isVerifying ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Verifying…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Access Dashboard
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Switch back to user — ALWAYS visible on admin tab */}
                  <div className="px-1 pb-2 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <button
                      type="button"
                      onClick={switchToUser}
                      data-ocid="login.switch_to_user_button"
                      className="w-full flex items-center gap-3 px-2 sm:px-3 py-3 min-h-[48px] rounded-xl transition-all group hover:bg-muted/60 border border-transparent hover:border-border"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-sm text-foreground truncate">
                          Switch to User Login
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sign in with your Google account instead
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-8 py-4 bg-muted/30 border-t border-border text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              New to V-7 Shop?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("user");
                  handleIILogin();
                }}
                className="text-primary hover:underline font-medium"
                data-ocid="login.signup_link"
              >
                Sign in with Google
              </button>
            </p>
            <p className="text-xs text-muted-foreground/60">
              <a href="/contact" className="hover:underline">
                Terms of Service
              </a>
              {" · "}
              <a href="/contact" className="hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
