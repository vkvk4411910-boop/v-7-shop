import { Layout } from "@/components/Layout";
import { CartPage } from "@/pages/Cart";
import { HomePage } from "@/pages/Home";
import { ProductsPage } from "@/pages/Products";
import { useStore } from "@/store/useStore";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy-loaded pages (only load on first visit)
const AdminPage = lazy(() =>
  import("@/pages/Admin").then((m) => ({ default: m.AdminPage })),
);
const LoginPage = lazy(() =>
  import("@/pages/Login").then((m) => ({ default: m.LoginPage })),
);
const OrdersPage = lazy(() =>
  import("@/pages/Orders").then((m) => ({ default: m.OrdersPage })),
);
const ContactPage = lazy(() =>
  import("@/pages/Contact").then((m) => ({ default: m.ContactPage })),
);

// Suspense fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return function SuspenseWrapper() {
    return (
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    );
  };
}

// Route tree
const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? "",
    category: (search.category as string) ?? "",
  }),
  component: ProductsPage,
});

/** Guard: redirect to /login?returnUrl=<path> if not logged in */
function requireAuth(path: string) {
  const isLoggedIn = useStore.getState().isLoggedIn;
  if (!isLoggedIn) {
    throw redirect({
      to: "/login",
      search: { returnUrl: path },
    });
  }
}

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  beforeLoad: () => requireAuth("/cart"),
  component: CartPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  beforeLoad: () => requireAuth("/orders"),
  component: withSuspense(OrdersPage),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: withSuspense(AdminPage),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>) => ({
    returnUrl: (search.returnUrl as string) ?? "/",
  }),
  component: withSuspense(LoginPage),
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: withSuspense(ContactPage),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  cartRoute,
  ordersRoute,
  adminRoute,
  loginRoute,
  contactRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
