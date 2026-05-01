import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { CloudSync } from "@/components/complee/CloudSync";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Complee — AI Compliance Consultant for FinTech" },
      {
        name: "description",
        content:
          "From licence in one country to readiness assessment in another — in five minutes, not five months.",
      },
      { property: "og:title", content: "Complee — AI Compliance Consultant for FinTech" },
      {
        property: "og:description",
        content: "AI-powered cross-border compliance readiness for European fintechs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Complee — AI Compliance Consultant for FinTech" },
      { name: "description", content: "Complee is an AI Compliance Consultant for European FinTechs expanding internationally." },
      { property: "og:description", content: "Complee is an AI Compliance Consultant for European FinTechs expanding internationally." },
      { name: "twitter:description", content: "Complee is an AI Compliance Consultant for European FinTechs expanding internationally." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/45ba0e0a-01dc-465e-b933-75655ba7774a/id-preview-28d3e9ec--ce3ef39b-7456-4be0-ac15-412efb91d103.lovable.app-1777180447828.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/45ba0e0a-01dc-465e-b933-75655ba7774a/id-preview-28d3e9ec--ce3ef39b-7456-4be0-ac15-412efb91d103.lovable.app-1777180447828.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-navy focus:text-navy-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <CloudSync />
      <Outlet />
      <Toaster position="bottom-right" richColors closeButton visibleToasts={3} />
    </AuthProvider>
  );
}
