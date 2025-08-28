import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCheck, Mail, Phone, Search, Database, Lock, FlaskConical } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'features' | 'auth-options' | 'signup' | 'login' | 'test-login' | 'complete';

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [authMethod, setAuthMethod] = useState<string>('');

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleTestLogin = () => {
    setCurrentStep('complete');
  };

  const handleCompleteOnboarding = () => {
    onComplete();
  };

  const renderWelcomeSlide = () => (
    <div className="p-8 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <UserCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-welcome-title">
          Welcome to VeriScan AI
        </h2>
        <p className="text-muted-foreground">
          Your trusted platform for people verification and search
        </p>
      </div>
      
      <ul className="text-left space-y-3 mb-6">
        <li className="flex items-center space-x-3">
          <Search className="w-5 h-5 text-primary" />
          <span>Advanced people search capabilities</span>
        </li>
        <li className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-primary" />
          <span>Access to comprehensive databases</span>
        </li>
        <li className="flex items-center space-x-3">
          <Lock className="w-5 h-5 text-primary" />
          <span>Privacy-first approach</span>
        </li>
      </ul>
      
      <Button 
        onClick={() => setCurrentStep('features')} 
        className="w-full"
        data-testid="button-get-started"
      >
        Get Started
      </Button>
    </div>
  );

  const renderAuthOptions = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-auth-title">
        Choose Authentication Method
      </h2>
      
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center space-x-3 h-12"
          onClick={handleSignIn}
          data-testid="button-email-auth"
        >
          <Mail className="w-5 h-5 text-primary" />
          <span>Continue with Email</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full flex items-center justify-center space-x-3 h-12"
          onClick={handleSignIn}
          data-testid="button-phone-auth"
        >
          <Phone className="w-5 h-5 text-primary" />
          <span>Continue with Phone</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full flex items-center justify-center space-x-3 h-12"
          onClick={handleSignIn}
          data-testid="button-google-auth"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </Button>
      </div>
      
      <div className="mt-6 text-center space-y-2">
        <Button 
          variant="link" 
          onClick={() => setCurrentStep('login')}
          data-testid="button-existing-account"
        >
          Already have an account? Sign In
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <Button 
            variant="link" 
            size="sm"
            onClick={() => setCurrentStep('test-login')}
            className="text-xs"
            data-testid="button-test-login"
          >
            Test Environment Access
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-login-title">
        Welcome Back
      </h2>
      
      <div className="space-y-4 mb-6">
        <Button 
          className="w-full h-12"
          onClick={handleSignIn}
          data-testid="button-sign-in"
        >
          Sign In with Replit
        </Button>
      </div>
      
      <div className="text-center space-y-2">
        <Button 
          variant="link" 
          size="sm"
          data-testid="button-forgot-password"
        >
          Forgot password?
        </Button>
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('auth-options')}
          data-testid="button-back-to-options"
        >
          Back to options
        </Button>
      </div>
    </div>
  );

  const renderTestLogin = () => (
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
          <FlaskConical className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold" data-testid="text-test-login-title">
          Test Environment
        </h2>
        <p className="text-muted-foreground">
          Staging environment for testing and development
        </p>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="testUser">Test User</Label>
          <Select defaultValue="admin">
            <SelectTrigger data-testid="select-test-user">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">admin@veriscan.ai (Admin)</SelectItem>
              <SelectItem value="tester">tester@veriscan.ai (Tester)</SelectItem>
              <SelectItem value="demo">demo@veriscan.ai (Demo User)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="environment">Environment</Label>
          <Select defaultValue="staging">
            <SelectTrigger data-testid="select-environment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="qa">QA Testing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleTestLogin}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          data-testid="button-access-test-environment"
        >
          Access Test Environment
        </Button>
      </div>
      
      <div className="text-center">
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('auth-options')}
          data-testid="button-back-to-production"
        >
          Back to production login
        </Button>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-features-title">
        Powerful Search Features
      </h2>
      
      <div className="space-y-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Multi-Type Search</h3>
            <p className="text-sm text-muted-foreground">Search by name, phone number, email, or address with AI-powered accuracy</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Comprehensive Results</h3>
            <p className="text-sm text-muted-foreground">Get detailed profiles with contact info, address history, and associated records</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Privacy & Security</h3>
            <p className="text-sm text-muted-foreground">Your searches are confidential and subjects are never notified</p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={() => setCurrentStep('auth-options')} 
        className="w-full"
        data-testid="button-continue-features"
      >
        Continue to Sign Up
      </Button>
    </div>
  );

  const renderComplete = () => (
    <div className="p-8 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <UserCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-complete-title">
          Welcome to VeriScan AI!
        </h2>
        <p className="text-muted-foreground mb-6">
          You're all set to start searching and verifying people with our advanced platform.
        </p>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Quick Start Tips:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 text-left">
          <li>• Try searching by name to find comprehensive profiles</li>
          <li>• Use phone numbers to verify contact information</li>
          <li>• Address searches show current and historical data</li>
          <li>• Email searches reveal associated accounts</li>
        </ul>
      </div>
      
      <Button 
        onClick={handleCompleteOnboarding} 
        className="w-full"
        data-testid="button-start-searching"
      >
        Start Searching Now
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeSlide();
      case 'features':
        return renderFeatures();
      case 'auth-options':
        return renderAuthOptions();
      case 'login':
        return renderLogin();
      case 'test-login':
        return renderTestLogin();
      case 'complete':
        return renderComplete();
      default:
        return renderWelcomeSlide();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" data-testid="modal-onboarding">
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
}
