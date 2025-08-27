import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold" data-testid="text-logo">VeriScan AI</span>
            </div>
            
            {/* Test Environment Badge */}
            {process.env.NODE_ENV !== 'production' && (
              <div 
                className="bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium"
                data-testid="badge-test-environment"
              >
                TEST ENVIRONMENT
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <a 
                href="/" 
                className="text-foreground hover:text-primary transition-colors"
                data-testid="link-search"
              >
                Search
              </a>
              <a 
                href="/reports" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-reports"
              >
                Reports
              </a>
              <a 
                href="/history" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-history"
              >
                History
              </a>
              <a 
                href="/help" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-help"
              >
                Help
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                data-testid="button-notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={(user as any)?.profileImageUrl} />
                  <AvatarFallback data-testid="avatar-fallback">
                    {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium" data-testid="text-username">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-2">
              <a href="/" className="text-foreground hover:text-primary px-2 py-1">Search</a>
              <a href="/reports" className="text-muted-foreground hover:text-primary px-2 py-1">Reports</a>
              <a href="/history" className="text-muted-foreground hover:text-primary px-2 py-1">History</a>
              <a href="/help" className="text-muted-foreground hover:text-primary px-2 py-1">Help</a>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-fit"
                onClick={() => window.location.href = "/api/logout"}
              >
                Logout
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
