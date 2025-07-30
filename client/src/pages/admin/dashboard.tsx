import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/ui/glass-card";
import { SEO } from "@/components/seo";
import { withAdminAuth } from "@/hoc/withAdminAuth";
import { Link } from "wouter";
import { Users, Newspaper, ShoppingBag, Star, ShieldCheck } from 'lucide-react';

const navItems = [
  { href: "/admin/users", label: "Users", Icon: Users, description: "Manage all registered users" },
  { href: "/admin/articles", label: "Articles", Icon: Newspaper, description: "Create and manage news articles" },
  { href: "/admin/classifieds", label: "Classifieds", Icon: ShoppingBag, description: "Manage classified ads" },
  { href: "/admin/reviews", label: "Reviews", Icon: Star, description: "Manage business reviews" },
  { href: "/admin/audit", label: "Audit Log", Icon: ShieldCheck, description: "Review administrative actions" },
];

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Admin Dashboard - SafraReport"
        description="Admin dashboard for SafraReport"
      />
      <Header />
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome! Manage your application from this central hub.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {navItems.map(({ href, label, Icon, description }) => (
            <Link key={href} href={href}>
              <GlassCard className="p-6 hover:bg-gray-100/50 transition-colors duration-300 cursor-pointer h-full">
                <div className="flex items-center gap-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                  <h2 className="text-2xl font-semibold text-gray-800">{label}</h2>
                </div>
                <p className="mt-3 text-gray-600">{description}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default withAdminAuth(AdminDashboard);
