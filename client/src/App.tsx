import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

import Landing from "@/pages/landing";
import Home from "@/pages/home";
import SearchResults from "@/pages/search-results";
import NotFound from "@/pages/not-found";
import SplashScreen from "@/components/splash-screen";
import OnboardingModal from "@/components/onboarding-modal";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [forceOnboarding, setForceOnboarding] = useState(false);

  useEffect(() => {
    if (!showSplash && !isLoading && !isAuthenticated) {
      setShowOnboarding(true);
    }
  }, [showSplash, isLoading, isAuthenticated]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setForceOnboarding(false);
  };

  const handleForceOnboarding = () => {
    setForceOnboarding(true);
    setShowOnboarding(true);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/search-results" component={() => <SearchResults searchParams={new URLSearchParams(location.search)} />} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      <OnboardingModal 
        open={(showOnboarding && !isAuthenticated && !isLoading) || forceOnboarding}
        onComplete={handleOnboardingComplete}
      />
      
      {/* Test Mode Onboarding Trigger */}
      {process.env.NODE_ENV !== 'production' && isAuthenticated && (
        <button
          onClick={handleForceOnboarding}
          className="fixed bottom-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-accent/90 transition-colors z-50"
          data-testid="button-test-onboarding"
        >
          🧪 Test Onboarding
        </button>
      )}
    </>
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
