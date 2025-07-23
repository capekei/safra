import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import AdminTest from "@/pages/admin-test";
import SafraAdmin from "@/pages/safra-admin";
import UserDashboard from "@/pages/user/dashboard";
import PostClassified from "@/pages/user/post-classified";
import PostReview from "@/pages/user/post-review";
import NewsPreferences from "@/pages/user/news-preferences";
import AdminLogin from "@/pages/admin/login";
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

function Router() {
  return (
    <Switch>
      {/* Home page */}
      <Route path="/" component={Home} />
      
      {/* Article pages */}
      <Route path="/articulo/preview" component={ArticlePreview} />
      <Route path="/articulo/:slug" component={Article} />
      
      {/* Category pages */}
      <Route path="/seccion/:slug" component={Category} />
      
      {/* Classifieds */}
      <Route path="/clasificados" component={Clasificados} />
      
      {/* Business reviews */}
      <Route path="/resenas" component={Resenas} />
      
      {/* UI Showcase */}
      <Route path="/ui-showcase" component={UIShowcase} />
      
      {/* User Account */}
      <Route path="/cuenta" component={Cuenta} />
      <Route path="/cuenta/panel" component={UserDashboard} />
      <Route path="/cuenta/preferencias" component={NewsPreferences} />
      <Route path="/login" component={Login} />
      <Route path="/admin-test" component={AdminTest} />
      <Route path="/safra-admin" component={SafraAdmin} />
      
      {/* User Content Creation */}
      <Route path="/clasificados/nuevo" component={PostClassified} />
      <Route path="/resenas/nueva" component={PostReview} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/articles" component={AdminArticles} />
      <Route path="/admin/authors" component={AdminAuthors} />
      <Route path="/admin/classifieds" component={AdminClassifieds} />
      <Route path="/admin/moderation" component={AdminModeration} />
      <Route path="/admin/database" component={AdminDatabase} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/audit" component={AdminAudit} />
      <Route path="/admin/ads" component={AdminAds} />
      <Route path="/admin/articles-test" component={AdminArticlesTest} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
