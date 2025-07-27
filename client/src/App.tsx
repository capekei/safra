import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, Component, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Article from "@/pages/article";
import ArticlePreview from "@/pages/article-preview";
import Category from "@/pages/category";
import Clasificados from "@/pages/clasificados";
import Resenas from "@/pages/resenas";
import UIShowcase from "@/pages/ui-showcase";
import Cuenta from "@/pages/cuenta";
import Login from "@/pages/login";

import SafraAdmin from "@/pages/safra-admin";
import UserDashboard from "@/pages/user/dashboard";
import PostClassified from "@/pages/user/post-classified";
import PostReview from "@/pages/user/post-review";
import NewsPreferences from "@/pages/user/news-preferences";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminArticles from "@/pages/admin/articles";
import AdminAuthors from "@/pages/admin/authors";
import AdminClassifieds from "@/pages/admin/classifieds";
import AdminModeration from "@/pages/admin/moderation";
import AdminDatabase from "@/pages/admin/database";
import AdminReviews from "@/pages/admin/reviews";
import AdminUsers from "@/pages/admin/users";
import AdminAudit from "@/pages/admin/audit";
import AdminAds from "@/pages/admin/ads";
import AdminArticlesTest from "@/pages/admin-articles-test";

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Oops! Algo salió mal</h2>
        <p className="text-gray-600 mb-4">Ha ocurrido un error inesperado. Por favor, intenta nuevamente.</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Intentar de nuevo
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">Detalles del error</summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Loading Component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Auth Guard for User Routes
function ProtectedUserRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingFallback />;
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  return <>{children}</>;
}



// Route wrapper with error boundary
function RouteWithErrorBoundary({ component: Component, ...props }: any) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Router() {
  return (
    <Switch>
      {/* Home page */}
      <Route path="/">
        <RouteWithErrorBoundary component={Home} />
      </Route>
      
      {/* Article pages - Handle special chars in slugs */}
      <Route path="/articulo/preview">
        <RouteWithErrorBoundary component={ArticlePreview} />
      </Route>
      <Route path="/articulo/:slug">
        {(params) => <RouteWithErrorBoundary component={Article} slug={decodeURIComponent(params.slug)} />}
      </Route>
      
      {/* Category pages - Handle special chars in slugs */}
      <Route path="/seccion/:slug">
        {(params) => <RouteWithErrorBoundary component={Category} slug={decodeURIComponent(params.slug)} />}
      </Route>
      
      {/* Public pages */}
      <Route path="/clasificados">
        <RouteWithErrorBoundary component={Clasificados} />
      </Route>
      <Route path="/resenas">
        <RouteWithErrorBoundary component={Resenas} />
      </Route>
      <Route path="/ui-showcase">
        <RouteWithErrorBoundary component={UIShowcase} />
      </Route>
      
      {/* Auth pages */}
      <Route path="/login">
        <RouteWithErrorBoundary component={Login} />
      </Route>
      
      {/* Protected User Routes */}
      <Route path="/cuenta">
        <ProtectedUserRoute>
          <RouteWithErrorBoundary component={Cuenta} />
        </ProtectedUserRoute>
      </Route>
      <Route path="/cuenta/panel">
        <ProtectedUserRoute>
          <RouteWithErrorBoundary component={UserDashboard} />
        </ProtectedUserRoute>
      </Route>
      <Route path="/cuenta/preferencias">
        <ProtectedUserRoute>
          <RouteWithErrorBoundary component={NewsPreferences} />
        </ProtectedUserRoute>
      </Route>
      <Route path="/clasificados/nuevo">
        <ProtectedUserRoute>
          <RouteWithErrorBoundary component={PostClassified} />
        </ProtectedUserRoute>
      </Route>
      <Route path="/resenas/nueva">
        <ProtectedUserRoute>
          <RouteWithErrorBoundary component={PostReview} />
        </ProtectedUserRoute>
      </Route>
      
      {/* Test routes (development) */}

      <Route path="/safra-admin">
        <RouteWithErrorBoundary component={SafraAdmin} />
      </Route>

      {/* Development Admin Access (bypasses Auth0) */}
      {import.meta.env.DEV && (
        <Route path="/dev-admin/:path*">
          <DevAdminRoutes />
        </Route>
      )}

      {/* Protected Admin Routes */}
      <Route path="/admin/:path*">
        <ProtectedAdminRoutes />
      </Route>
      
      {/* 404 Fallback */}
      <Route>
        <RouteWithErrorBoundary component={NotFound} />
      </Route>
    </Switch>
  );
}

function ProtectedAdminRoutes() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingFallback />;
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  // Check if user has admin role
  const isAdmin = user?.role === 'admin';
  
  if (!isAdmin) {
    console.log('❌ Access denied: User does not have admin role');
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/admin/dashboard">
        <RouteWithErrorBoundary component={AdminDashboard} />
      </Route>
      <Route path="/admin/articles">
        <RouteWithErrorBoundary component={AdminArticles} />
      </Route>
      <Route path="/admin/authors">
        <RouteWithErrorBoundary component={AdminAuthors} />
      </Route>
      <Route path="/admin/classifieds">
        <RouteWithErrorBoundary component={AdminClassifieds} />
      </Route>
      <Route path="/admin/moderation">
        <RouteWithErrorBoundary component={AdminModeration} />
      </Route>
      <Route path="/admin/database">
        <RouteWithErrorBoundary component={AdminDatabase} />
      </Route>
      <Route path="/admin/reviews">
        <RouteWithErrorBoundary component={AdminReviews} />
      </Route>
      <Route path="/admin/users">
        <RouteWithErrorBoundary component={AdminUsers} />
      </Route>
      <Route path="/admin/audit">
        <RouteWithErrorBoundary component={AdminAudit} />
      </Route>
      <Route path="/admin/ads">
        <RouteWithErrorBoundary component={AdminAds} />
      </Route>
      <Route path="/admin/articles-test">
        <RouteWithErrorBoundary component={AdminArticlesTest} />
      </Route>
      <Route>
        <Redirect to="/admin/dashboard" />
      </Route>
    </Switch>
  );
}

// Development Admin Routes (bypasses Auth0)
function DevAdminRoutes() {
  return (
    <Switch>
      <Route path="/dev-admin/dashboard">
        <RouteWithErrorBoundary component={AdminDashboard} />
      </Route>
      <Route path="/dev-admin/articles">
        <RouteWithErrorBoundary component={AdminArticles} />
      </Route>
      <Route path="/dev-admin/authors">
        <RouteWithErrorBoundary component={AdminAuthors} />
      </Route>
      <Route path="/dev-admin/classifieds">
        <RouteWithErrorBoundary component={AdminClassifieds} />
      </Route>
      <Route path="/dev-admin/moderation">
        <RouteWithErrorBoundary component={AdminModeration} />
      </Route>
      <Route path="/dev-admin/database">
        <RouteWithErrorBoundary component={AdminDatabase} />
      </Route>
      <Route path="/dev-admin/reviews">
        <RouteWithErrorBoundary component={AdminReviews} />
      </Route>
      <Route path="/dev-admin/users">
        <RouteWithErrorBoundary component={AdminUsers} />
      </Route>
      <Route path="/dev-admin/audit">
        <RouteWithErrorBoundary component={AdminAudit} />
      </Route>
      <Route path="/dev-admin/ads">
        <RouteWithErrorBoundary component={AdminAds} />
      </Route>
      <Route>
        <Redirect to="/dev-admin/dashboard" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary 
              FallbackComponent={ErrorFallback} 
              onReset={reset}
            >
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
