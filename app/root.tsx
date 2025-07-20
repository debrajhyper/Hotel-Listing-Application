import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./styles.css";
import { ThemeProvider } from "./components/theme/theme-provider";
import { ModeToggle } from "./components/theme/mode-toggle";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { TooltipProvider } from "./components/ui/tooltip";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Provider store={store}>
          <ThemeProvider
          defaultTheme="dark"
          storageKey="vite-ui-theme"
        >
          <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <header className="border-b">
              <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="font-semibold text-lg">Hotel Booking</Link>
                <ModeToggle />
              </nav>
            </header>

            <main className="flex-1">
              {children}
            </main>

            <footer className="border-t mt-12">
              <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
                © 2025 Hotel Booking. All rights reserved.
              </div>
            </footer>
          </div>
          </TooltipProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        </Provider>
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Outlet />
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
