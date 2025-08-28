import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, Mail, Phone, Search, Database, Lock, FlaskConical, User, Shield, Settings, Bell, Contact } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/generated_images/Transparent_ornate_gold_logo_02dcc615.png";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

type OnboardingStep = 
  | 'welcome' 
  | 'login-gate'
  | 'signup-auth-method'
  | 'signup-credentials'
  | 'verify-code'
  | 'profile-core'
  | 'profile-additional'
  | 'permissions'
  | 'onboarding-complete'
  | 'login-credentials'
  | 'login-2fa'
  | 'login-complete'
  | 'test-login';

type AuthMethod = 'email' | 'phone' | 'social';
type UserType = 'new' | 'returning';

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  
  // Reset to welcome step when modal is opened
  useEffect(() => {
    if (open) {
      setCurrentStep('welcome');
      // Reset form data
      setFormData({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: '',
        bio: '',
        interests: '',
        notifications: false,
        contacts: false,
        twoFactorEnabled: false,
        twoFactorCode: ''
      });
    }
  }, [open]);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [userType, setUserType] = useState<UserType>('new');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    bio: '',
    interests: '',
    notifications: false,
    contacts: false,
    twoFactorEnabled: false,
    twoFactorCode: ''
  });
  const { toast } = useToast();

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleTestLogin = () => {
    onComplete();
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendVerificationCode = () => {
    if (!formData.email && !formData.phone) {
      toast({
        title: "Missing Information",
        description: `Please enter your ${authMethod}.`,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Verification Code Sent",
      description: `A verification code has been sent to your ${authMethod === 'email' ? 'email' : 'phone'}.`,
    });
    setCurrentStep('verify-code');
  };

  const handleVerifyCode = () => {
    if (formData.verificationCode.length === 6) {
      setCurrentStep('profile-core');
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive"
      });
    }
  };

  const handleProfileCore = () => {
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('profile-additional');
  };

  const handleProfileAdditional = () => {
    setCurrentStep('permissions');
  };

  const handlePermissions = () => {
    setCurrentStep('onboarding-complete');
  };

  const handleLoginCredentials = () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your email and password.",
        variant: "destructive"
      });
      return;
    }
    // Simulate checking if 2FA is enabled
    const has2FA = Math.random() > 0.5; // Simulate 50% chance of 2FA
    if (has2FA) {
      setCurrentStep('login-2fa');
    } else {
      setCurrentStep('login-complete');
    }
  };

  const handleLogin2FA = () => {
    if (formData.twoFactorCode.length === 6) {
      setCurrentStep('login-complete');
    } else {
      toast({
        title: "Invalid 2FA Code",
        description: "Please enter a valid 6-digit 2FA code.",
        variant: "destructive"
      });
    }
  };

  // Welcome / Value Prop Slide
  const renderWelcome = () => (
    <div className="p-8 text-center">
      <DialogTitle className="sr-only">Welcome to VeriScan AI</DialogTitle>
      <div className="mb-6">
        <div className="mb-6">
          <img 
            src={logoUrl} 
            alt="VeriScan AI Logo" 
            className="w-60 h-60 object-contain mx-auto"
            style={{ 
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              background: 'transparent'
            }}
            data-testid="img-welcome-logo"
          />
        </div>
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
        onClick={() => setCurrentStep('login-gate')} 
        className="w-full"
        data-testid="button-get-started"
      >
        Get Started
      </Button>
    </div>
  );

  // Login / Registration Gate
  const renderLoginGate = () => (
    <div className="p-8 text-center">
      <DialogTitle className="sr-only">Sign Up or Log In</DialogTitle>
      <h2 className="text-2xl font-bold mb-6" data-testid="text-login-gate-title">
        Join VeriScan AI
      </h2>
      
      <div className="space-y-4">
        <Button
          onClick={() => {
            setUserType('new');
            setCurrentStep('signup-auth-method');
          }}
          className="w-full h-12 text-lg"
          data-testid="button-sign-up"
        >
          Sign Up - New User
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            setUserType('returning');
            setCurrentStep('login-credentials');
          }}
          className="w-full h-12 text-lg"
          data-testid="button-log-in"
        >
          Log In - Existing User
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('test-login')}
          className="text-xs"
          data-testid="button-test-access"
        >
          Test Environment Access
        </Button>
      </div>
    </div>
  );

  // NEW USER ONBOARDING PATH
  
  // Live Experience: Google, Apple, Traditional Email/Password Signup
  const renderSignupAuthMethod = () => (
    <div className="p-8">
      <DialogTitle className="sr-only">Create Your Account</DialogTitle>
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-auth-method-title">
        Create Your Account
      </h2>
      
      <div className="space-y-4">
        {/* Google Sign Up */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center space-x-3 h-12 border-2 hover:border-primary/20"
          onClick={() => {
            setAuthMethod('social');
            // In live experience, this would redirect to Google OAuth
            toast({
              title: "Google Sign Up",
              description: "Redirecting to Google authentication...",
            });
            setTimeout(() => setCurrentStep('profile-core'), 1500);
          }}
          data-testid="button-google-signup"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </Button>
        
        {/* Apple Sign Up */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center space-x-3 h-12 border-2 hover:border-primary/20 bg-black text-white hover:bg-black/90"
          onClick={() => {
            setAuthMethod('social');
            // In live experience, this would redirect to Apple OAuth
            toast({
              title: "Apple Sign Up",
              description: "Redirecting to Apple authentication...",
            });
            setTimeout(() => setCurrentStep('profile-core'), 1500);
          }}
          data-testid="button-apple-signup"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span>Continue with Apple</span>
        </Button>
        
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        
        {/* Traditional Email/Password Signup */}
        <Button
          variant="default"
          className="w-full flex items-center justify-center space-x-3 h-12"
          onClick={() => {
            setAuthMethod('email');
            setCurrentStep('signup-credentials');
          }}
          data-testid="button-email-signup"
        >
          <Mail className="w-5 h-5" />
          <span>Sign Up with Email</span>
        </Button>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-xs text-muted-foreground mb-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('login-gate')}
          data-testid="button-back-to-gate"
        >
          Back
        </Button>
      </div>
    </div>
  );

  // Enter Credentials
  const renderSignupCredentials = () => (
    <div className="p-8">
      <DialogTitle className="sr-only">Enter Your Credentials</DialogTitle>
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-credentials-title">
        Enter Your Credentials
      </h2>
      
      <div className="space-y-4">
        {authMethod === 'email' && (
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="your@email.com"
              data-testid="input-email"
            />
          </div>
        )}
        
        {authMethod === 'phone' && (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              data-testid="input-phone"
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            placeholder="Create a strong password"
            data-testid="input-password"
          />
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            data-testid="input-confirm-password"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleSendVerificationCode}
        className="w-full mt-6"
        data-testid="button-send-verification"
      >
        Send Verification Code
      </Button>
      
      <div className="text-center mt-4">
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('signup-auth-method')}
          data-testid="button-back-to-auth"
        >
          Back
        </Button>
      </div>
    </div>
  );

  // Verify Code
  const renderVerifyCode = () => (
    <div className="p-8 text-center">
      <DialogTitle className="sr-only">Verify Your Code</DialogTitle>
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-verify-title">
          Verify Your Code
        </h2>
        <p className="text-muted-foreground">
          We sent a 6-digit code to your {authMethod === 'email' ? 'email' : 'phone'}
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="verificationCode">Verification Code</Label>
          <Input
            id="verificationCode"
            type="text"
            maxLength={6}
            value={formData.verificationCode}
            onChange={(e) => updateFormData('verificationCode', e.target.value)}
            placeholder="123456"
            className="text-center text-2xl tracking-widest"
            data-testid="input-verification-code"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleVerifyCode}
        className="w-full mt-6"
        data-testid="button-verify-code"
      >
        Verify Code
      </Button>
      
      <div className="text-center mt-4 space-y-2">
        <Button 
          variant="link" 
          size="sm"
          onClick={handleSendVerificationCode}
          data-testid="button-resend-code"
        >
          Resend Code
        </Button>
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('signup-credentials')}
          data-testid="button-back-to-credentials"
        >
          Back
        </Button>
      </div>
    </div>
  );

  // Profile Setup: Core Info
  const renderProfileCore = () => (
    <div className="p-8">
      <DialogTitle className="sr-only">Profile Setup - Core Information</DialogTitle>
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-profile-core-title">
        Profile Setup: Core Info
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              placeholder="John"
              data-testid="input-first-name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              placeholder="Doe"
              data-testid="input-last-name"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            data-testid="input-date-of-birth"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            placeholder="123 Main St, City, State 12345"
            data-testid="input-address"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleProfileCore}
        className="w-full mt-6"
        data-testid="button-continue-profile"
      >
        Continue
      </Button>
      
      <div className="text-center mt-4">
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('verify-code')}
          data-testid="button-back-to-verify"
        >
          Back
        </Button>
      </div>
    </div>
  );

  // Profile Setup: Additional Details
  const renderProfileAdditional = () => (
    <div className="p-8">
      <DialogTitle className="sr-only">Profile Setup - Additional Details</DialogTitle>
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-profile-additional-title">
        Profile Setup: Additional Details
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="bio">Bio (Optional)</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateFormData('bio', e.target.value)}
            placeholder="Tell us a bit about yourself..."
            rows={3}
            data-testid="input-bio"
          />
        </div>
        
        <div>
          <Label htmlFor="interests">Interests (Optional)</Label>
          <Input
            id="interests"
            value={formData.interests}
            onChange={(e) => updateFormData('interests', e.target.value)}
            placeholder="Technology, Sports, Music..."
            data-testid="input-interests"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleProfileAdditional}
        className="w-full mt-6"
        data-testid="button-continue-additional"
      >
        Continue
      </Button>
      
      <div className="text-center mt-4">
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('profile-core')}
          data-testid="button-back-to-core"
        >
          Back
        </Button>
      </div>
    </div>
  );

  // Request Permissions
  const renderPermissions = () => (
    <div className="p-8">
      <DialogTitle className="sr-only">Request Permissions</DialogTitle>
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-permissions-title">
        Request Permissions
      </h2>
      
      <p className="text-center text-muted-foreground mb-6">
        Help us provide you with the best experience by allowing these permissions
      </p>
      
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <Checkbox
            id="notifications"
            checked={formData.notifications}
            onCheckedChange={(checked) => updateFormData('notifications', checked)}
            data-testid="checkbox-notifications"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="w-5 h-5 text-primary" />
              <Label htmlFor="notifications" className="font-medium">
                Notifications
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive important updates and search alerts
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <Checkbox
            id="contacts"
            checked={formData.contacts}
            onCheckedChange={(checked) => updateFormData('contacts', checked)}
            data-testid="checkbox-contacts"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Contact className="w-5 h-5 text-primary" />
              <Label htmlFor="contacts" className="font-medium">
                Contacts Access
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Help you find people you know in our database
            </p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handlePermissions}
        className="w-full mt-8"
        data-testid="button-complete-permissions"
      >
        Complete Setup
      </Button>
      
      <div className="text-center mt-4">
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('profile-additional')}
          data-testid="button-back-to-additional"
        >
          Back
        </Button>
      </div>
    </div>
  );

  // Onboarding Complete
  const renderOnboardingComplete = () => (
    <div className="p-8 text-center">
      <DialogTitle className="sr-only">Welcome to VeriScan AI</DialogTitle>
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <UserCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-onboarding-complete-title">
          Welcome to VeriScan AI!
        </h2>
        <p className="text-muted-foreground mb-6">
          Your account is set up and ready. You can now access our powerful search features.
        </p>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Quick Start Tips:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 text-left">
          <li>• Search by name to find comprehensive profiles</li>
          <li>• Use phone numbers to verify contact information</li>
          <li>• Address searches show current and historical data</li>
          <li>• Email searches reveal associated accounts</li>
        </ul>
      </div>
      
      <Button 
        onClick={onComplete}
        className="w-full"
        data-testid="button-start-searching"
      >
        Start Searching Now
      </Button>
    </div>
  );

  // RETURNING USER LOGIN PATH

  // Enter Credentials (Username & Password)
  const renderLoginCredentials = () => (
    <div className="p-8">
      <DialogTitle className="sr-only">Sign In to Your Account</DialogTitle>
      <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-login-credentials-title">
        Welcome Back
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="loginEmail">Email Address</Label>
          <Input
            id="loginEmail"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="your@email.com"
            data-testid="input-login-email"
          />
        </div>
        
        <div>
          <Label htmlFor="loginPassword">Password</Label>
          <Input
            id="loginPassword"
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            placeholder="Enter your password"
            data-testid="input-login-password"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleLoginCredentials}
        className="w-full mt-6"
        data-testid="button-sign-in"
      >
        Sign In
      </Button>
      
      <div className="text-center mt-4 space-y-2">
        <Button 
          variant="link" 
          size="sm"
          data-testid="button-forgot-password"
        >
          Forgot Password?
        </Button>
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('login-gate')}
          data-testid="button-back-to-gate-login"
        >
          Back
        </Button>
      </div>
    </div>
  );

  // 2FA Verification
  const renderLogin2FA = () => (
    <div className="p-8 text-center">
      <DialogTitle className="sr-only">Two-Factor Authentication</DialogTitle>
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-2fa-title">
          Two-Factor Authentication
        </h2>
        <p className="text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="twoFactorCode">2FA Code</Label>
          <Input
            id="twoFactorCode"
            type="text"
            maxLength={6}
            value={formData.twoFactorCode}
            onChange={(e) => updateFormData('twoFactorCode', e.target.value)}
            placeholder="123456"
            className="text-center text-2xl tracking-widest"
            data-testid="input-2fa-code"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleLogin2FA}
        className="w-full mt-6"
        data-testid="button-verify-2fa"
      >
        Verify & Sign In
      </Button>
      
      <div className="text-center mt-4">
        <Button 
          variant="link" 
          size="sm"
          onClick={() => setCurrentStep('login-credentials')}
          data-testid="button-back-to-login"
        >
          Back to Login
        </Button>
      </div>
    </div>
  );

  // Login Complete
  const renderLoginComplete = () => (
    <div className="p-8 text-center">
      <DialogTitle className="sr-only">Login Successful</DialogTitle>
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <UserCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2" data-testid="text-login-complete-title">
          Welcome Back!
        </h2>
        <p className="text-muted-foreground mb-6">
          You're successfully signed in and ready to start searching.
        </p>
      </div>
      
      <Button 
        onClick={onComplete}
        className="w-full"
        data-testid="button-continue-to-app"
      >
        Continue to Main Feed
      </Button>
    </div>
  );

  // Test Login (Original implementation)
  const renderTestLogin = () => (
    <div className="p-8">
      <DialogTitle className="sr-only">Test Environment Access</DialogTitle>
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
          onClick={() => setCurrentStep('login-gate')}
          data-testid="button-back-to-production"
        >
          Back to production login
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcome();
      case 'login-gate':
        return renderLoginGate();
      case 'signup-auth-method':
        return renderSignupAuthMethod();
      case 'signup-credentials':
        return renderSignupCredentials();
      case 'verify-code':
        return renderVerifyCode();
      case 'profile-core':
        return renderProfileCore();
      case 'profile-additional':
        return renderProfileAdditional();
      case 'permissions':
        return renderPermissions();
      case 'onboarding-complete':
        return renderOnboardingComplete();
      case 'login-credentials':
        return renderLoginCredentials();
      case 'login-2fa':
        return renderLogin2FA();
      case 'login-complete':
        return renderLoginComplete();
      case 'test-login':
        return renderTestLogin();
      default:
        return renderWelcome();
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