import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import SearchTabs from "@/components/search-tabs";
import FeatureFlags from "@/components/feature-flags";
import { Shield, Database, Clock, KeyRound } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [showDevMode, setShowDevMode] = useState(false);

  // Listen for dev mode key combination
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' && e.ctrlKey && e.shiftKey) {
        setShowDevMode(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FeatureFlags visible={showDevMode} />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Anyone, Verify Everything
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Welcome back, {user?.firstName || 'User'}! Advanced AI-powered people search and verification platform
            </p>
            
            <SearchTabs />

            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-8 mt-8 text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>20B+ Records</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4" />
                <span>100% Confidential</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose VeriScan AI?</h2>
              <p className="text-xl text-muted-foreground">
                Advanced technology meets comprehensive data for unparalleled results
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Search</h3>
                <p className="text-muted-foreground">
                  Advanced artificial intelligence algorithms deliver more accurate and relevant results
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Database</h3>
                <p className="text-muted-foreground">
                  Access to over 20 billion public records from verified and trusted sources
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy Protected</h3>
                <p className="text-muted-foreground">
                  Your searches are completely confidential and the subjects are never notified
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
