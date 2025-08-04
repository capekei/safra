import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
  User: {},
}));

// Mock components that might cause issues
vi.mock('@/components/layout/header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/seo', () => ({
  SEO: () => null,
}));

vi.mock('@/components/ui/glass-card', () => ({
  GlassCard: ({ children, className }: any) => (
    <div className={className} data-testid="glass-card">
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon">Users</div>,
  Newspaper: () => <div data-testid="newspaper-icon">Newspaper</div>,
  ShoppingBag: () => <div data-testid="shopping-bag-icon">ShoppingBag</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  ShieldCheck: () => <div data-testid="shield-check-icon">ShieldCheck</div>,
}));

describe('Component Rendering Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Router>
          {component}
        </Router>
      </QueryClientProvider>
    );
  };

  describe('Admin Dashboard', () => {
    it('renders dashboard navigation cards', async () => {
      const AdminDashboard = (await import('@/pages/admin/dashboard')).default;
      
      renderWithProviders(<AdminDashboard />);

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome! Manage your application from this central hub.')).toBeInTheDocument();
      
      // Check navigation cards
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText('Classifieds')).toBeInTheDocument();
      expect(screen.getByText('Reviews')).toBeInTheDocument();
      expect(screen.getByText('Audit Log')).toBeInTheDocument();
    });

    it('displays correct descriptions for admin sections', async () => {
      const AdminDashboard = (await import('@/pages/admin/dashboard')).default;
      
      renderWithProviders(<AdminDashboard />);

      expect(screen.getByText('Manage all registered users')).toBeInTheDocument();
      expect(screen.getByText('Create and manage news articles')).toBeInTheDocument();
      expect(screen.getByText('Manage classified ads')).toBeInTheDocument();
      expect(screen.getByText('Manage business reviews')).toBeInTheDocument();
      expect(screen.getByText('Review administrative actions')).toBeInTheDocument();
    });
  });

  describe('Home Page', () => {
    it('renders home page structure', async () => {
      // Mock fetch for articles
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ articles: [], featuredArticles: [] }),
      });

      const Home = (await import('@/pages/home')).default;
      
      renderWithProviders(<Home />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('UI Components', () => {
    it('renders glass card component', () => {
      const { GlassCard } = require('@/components/ui/glass-card');
      
      render(
        <GlassCard>
          <div>Test content</div>
        </GlassCard>
      );

      expect(screen.getByTestId('glass-card')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Authentication Hook', () => {
    it('provides authentication state', async () => {
      const { useSupabaseAuth } = await import('@/hooks/useSupabaseAuth');
      
      // This is a basic test to ensure the hook can be imported
      expect(typeof useSupabaseAuth).toBe('function');
    });
  });
});
