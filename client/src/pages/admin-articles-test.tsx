import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "wouter";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ArticleData {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    firstName: string;
    lastName: string;
  };
  category?: {
    name: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function AdminArticlesTest() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    auth: 'pending' | 'success' | 'error';
    fetch: 'pending' | 'success' | 'error';
    message: string;
  }>({ auth: 'pending', fetch: 'pending', message: '' });
  
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      setTestResults(prev => ({
        ...prev,
        auth: 'success',
        message: `Authenticated as ${user.firstName} ${user.lastName} (${user.role})`
      }));
    } else if (!isLoading && !isAuthenticated) {
      setTestResults(prev => ({
        ...prev,
        auth: 'error',
        message: 'Not authenticated'
      }));
    }
  }, [isAuthenticated, user, isLoading]);

  const testLogin = async () => {
    setLoading(true);
    setTestResults({ auth: 'pending', fetch: 'pending', message: 'Testing authentication...' });
    
    try {
      // Test with demo credentials (replace with actual test credentials)
      const result = await login('admin@safrareport.com', 'admin123');
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          auth: 'success',
          message: 'Authentication successful!'
        }));
        toast({
          title: "Authentication Test Passed",
          description: "Successfully logged in with test credentials",
        });
        // Automatically test article fetching after successful login
        setTimeout(() => fetchArticles(), 1000);
      } else {
        setTestResults(prev => ({
          ...prev,
          auth: 'error',
          message: result.error || 'Authentication failed'
        }));
        toast({
          title: "Authentication Test Failed",
          description: result.error || 'Login failed',
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        auth: 'error',
        message: 'Network error during authentication'
      }));
      toast({
        title: "Authentication Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in first to test article fetching",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTestResults(prev => ({ ...prev, fetch: 'pending', message: 'Fetching articles...' }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles`, {
        method: 'GET',
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setArticles(data);
      
      setTestResults(prev => ({
        ...prev,
        fetch: 'success',
        message: `Successfully fetched ${data.length} articles`
      }));
      
      toast({
        title: "Article Fetch Test Passed",
        description: `Loaded ${data.length} articles from API`,
      });
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        fetch: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      toast({
        title: "Article Fetch Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setArticles([]);
    setTestResults({ auth: 'pending', fetch: 'pending', message: 'Logged out' });
    toast({
      title: "Logged Out",
      description: "Successfully signed out",
    });
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Articles API Test
          </h1>
          <p className="text-gray-600">
            Test the new secure backend authentication and article API endpoints.
          </p>
        </div>

        <GlassCard className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication & API Tests</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.auth)}
              <span className="font-medium">Authentication Test:</span>
              <span className={`text-sm ${
                testResults.auth === 'success' ? 'text-green-600' :
                testResults.auth === 'error' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {testResults.auth === 'success' ? 'PASSED' :
                 testResults.auth === 'error' ? 'FAILED' : 'PENDING'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusIcon(testResults.fetch)}
              <span className="font-medium">Article Fetch Test:</span>
              <span className={`text-sm ${
                testResults.fetch === 'success' ? 'text-green-600' :
                testResults.fetch === 'error' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {testResults.fetch === 'success' ? 'PASSED' :
                 testResults.fetch === 'error' ? 'FAILED' : 'PENDING'}
              </span>
            </div>
          </div>

          {testResults.message && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{testResults.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Status: {isAuthenticated ? 
                  `✅ Authenticated as ${user?.firstName} ${user?.lastName} (${user?.role})` : 
                  '❌ Not authenticated'
                }
              </p>
            </div>
            <div className="space-x-4">
              {!isAuthenticated ? (
                <Button 
                  onClick={testLogin} 
                  disabled={loading || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Testing...' : 'Test Login & Fetch'}
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={fetchArticles} 
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? 'Fetching...' : 'Test Article Fetch'}
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline"
                  >
                    Logout
                  </Button>
                </>
              )}
              <Link href="/admin/dashboard">
                <Button variant="outline">
                  Go to Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>

        {articles.length > 0 && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Articles ({articles.length})
            </h2>
            <div className="grid gap-4">
              {articles.slice(0, 10).map((article) => (
                <div 
                  key={article.id} 
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Slug: {article.slug}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Views: {article.views}</span>
                        <span>Likes: {article.likes}</span>
                        <span>Category: {article.category?.name || 'N/A'}</span>
                        <span>Author: {article.author ? `${article.author.firstName} ${article.author.lastName}` : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {article.published && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Published
                        </span>
                      )}
                      {article.isFeatured && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Featured
                        </span>
                      )}
                      {article.isBreaking && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Breaking
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {articles.length > 10 && (
                <div className="text-center text-gray-500 text-sm">
                  ... and {articles.length - 10} more articles
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}