import { createBrowserRouter, Navigate } from "react-router";

function PlaceholderPage() {
  return (
    <main className="p-4 md:p-6">
      <h1 className="text-lg font-semibold">Migration in progress</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        RouteForge is being aligned to the back-office design canon.
      </p>
    </main>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/integrations" replace /> },
  { path: "/integrations", element: <PlaceholderPage /> },
  { path: "/integrations/:name", element: <PlaceholderPage /> },
  { path: "/schemas", element: <PlaceholderPage /> },
  { path: "/karavan", element: <PlaceholderPage /> },
  { path: "/swagger", element: <PlaceholderPage /> },
  { path: "/login", element: <PlaceholderPage /> },
  { path: "/logout", element: <PlaceholderPage /> },
]);
