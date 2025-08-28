import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Database, Clock, KeyRound, Search, CheckCircle, Zap } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6" style={{ background: 'transparent' }}>
              <img 
                src={logoUrl} 
                alt="VeriScan AI Logo" 
                className="w-24 h-24 object-contain drop-shadow-lg"
                style={{ 
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  background: 'transparent'
                }}
                data-testid="img-hero-logo"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">VeriScan AI</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Advanced People Search & Verification Platform
            </p>
          </div>
          
          <div className="flex justify-center space-x-8 text-sm mb-12">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Accurate</span>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-get-started"
          >
            Get Started - Sign In
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose VeriScan AI?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced technology meets comprehensive data for unparalleled results in people search and verification
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:border-primary/20 transition-colors">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">AI-Powered Search</h3>
                <p className="text-muted-foreground">
                  Advanced artificial intelligence algorithms deliver more accurate and relevant results than traditional search methods
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 hover:border-primary/20 transition-colors">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Database className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Comprehensive Database</h3>
                <p className="text-muted-foreground">
                  Access to over 20 billion public records from verified and trusted sources across the United States
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 hover:border-primary/20 transition-colors">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Privacy Protected</h3>
                <p className="text-muted-foreground">
                  Your searches are completely confidential and the subjects are never notified of your inquiries
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-8">Trusted by Millions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-primary mb-2" />
              <span className="font-semibold">SSL Secured</span>
              <span className="text-sm text-muted-foreground">256-bit encryption</span>
            </div>
            <div className="flex flex-col items-center">
              <Database className="w-8 h-8 text-primary mb-2" />
              <span className="font-semibold">20B+ Records</span>
              <span className="text-sm text-muted-foreground">Comprehensive data</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-primary mb-2" />
              <span className="font-semibold">Instant Results</span>
              <span className="text-sm text-muted-foreground">Real-time search</span>
            </div>
            <div className="flex flex-col items-center">
              <KeyRound className="w-8 h-8 text-primary mb-2" />
              <span className="font-semibold">100% Confidential</span>
              <span className="text-sm text-muted-foreground">Anonymous searches</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Search Today</h2>
          <p className="text-xl opacity-90 mb-8">
            Join millions of users who trust VeriScan AI for their people search and verification needs
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-start-search"
          >
            Sign In to Start Searching
          </Button>
        </div>
      </section>
    </div>
  );
}
