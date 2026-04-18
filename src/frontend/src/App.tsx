import { Layout } from "@/components/Layout";
import { AdminPage } from "@/pages/Admin";
import { CartPage } from "@/pages/Cart";
import { ContactPage } from "@/pages/Contact";
import { HomePage } from "@/pages/Home";
import { LoginPage } from "@/pages/Login";
import { OrdersPage } from "@/pages/Orders";
import { ProductsPage } from "@/pages/Products";
import { useStore } from "@/store/useStore";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

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
  component: OrdersPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>) => ({
    returnUrl: (search.returnUrl as string) ?? "/",
  }),
  component: LoginPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
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
