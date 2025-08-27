import { useEffect, useState } from "react";
import { Search, Shield, Zap, CheckCircle } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-primary to-secondary">
      <div className="text-center text-white animate-fadeIn">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-pulse">
            <Search className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2" data-testid="text-splash-title">
            VeriScan AI
          </h1>
          <p className="text-xl opacity-90" data-testid="text-splash-subtitle">
            Advanced People Search & Verification
          </p>
        </div>
        
        <div className="flex justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2 animate-fadeInUp animation-delay-100">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-2 animate-fadeInUp animation-delay-200">
            <Zap className="w-4 h-4" />
            <span>Fast</span>
          </div>
          <div className="flex items-center space-x-2 animate-fadeInUp animation-delay-300">
            <CheckCircle className="w-4 h-4" />
            <span>Accurate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
