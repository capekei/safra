import { useState } from "react";
import { Link, useLocation } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { BreakingTicker } from "@/components/news/breaking-ticker";
import { 
  ChevronDown, 
  Menu, 
  Languages,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { MobileBottomNav } from "@/components/layout/mobile-nav";

export function Header() {
  const [location] = useLocation();
  const [language, setLanguage] = useState("ES");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = language === "ES" ? "EN" : "ES";
    setLanguage(newLang);
    // TODO: Implement actual language switching logic
    localStorage.setItem("language", newLang);
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-50 glass-effect mt-[-3px] mb-[-3px]">
      {/* Breaking News Ticker */}
      <BreakingTicker />
      {/* Main Navigation */}
      <div className="flex items-center justify-between p-4 mt-[-3px] mb-[-3px]">
        {/* Enhanced Logo */}
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="ghost-logo"></div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                SafraReport
              </h1>
              <span className="text-xs text-gray-500 font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Tu fuente confiable
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-primary font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-primary/5"
              >
                <span className="text-base">Noticias</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-dropdown border-0 mt-2">
              {NEWS_CATEGORIES.map((category, index) => (
                <div key={category.slug}>
                  <DropdownMenuItem asChild className="glass-dropdown-item p-0">
                    <Link href={`/seccion/${category.slug}`} className="block">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <i className={`fas ${category.icon} text-primary text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">{category.name}</span>
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  {index === 4 && <div className="glass-dropdown-separator" />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link href="/clasificados">
            <Button 
              variant="ghost" 
              className={cn(
                "text-gray-700 hover:text-primary font-medium nav-underline transition-all duration-300",
                location.startsWith("/clasificados") && "text-primary"
              )}
            >
              Clasificados
            </Button>
          </Link>
          
          <Link href="/resenas">
            <Button 
              variant="ghost" 
              className={cn(
                "text-gray-700 hover:text-primary font-medium nav-underline transition-all duration-300",
                location.startsWith("/resenas") && "text-primary"
              )}
            >
              Reseñas
            </Button>
          </Link>
          
          <GlassCard variant="button">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleLanguage}
              className="text-gray-700 hover:text-primary"
            >
              <Languages className="h-4 w-4 mr-1" />
              {language}
            </Button>
          </GlassCard>

          <Link href="/cuenta">
            <GlassCard variant="button" className="group hover:scale-105 transition-all duration-300">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-700 hover:text-primary group-hover:bg-primary/5 p-2 rounded-full"
              >
                <User className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
            </GlassCard>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="sm"
          className="mobile-nav md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      {isMobileMenuOpen && <MobileBottomNav />}
    </header>
  );
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
