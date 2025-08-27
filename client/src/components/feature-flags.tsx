import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface FeatureFlagsProps {
  visible: boolean;
}

interface FeatureFlag {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  hasUserOverride: boolean;
}

export default function FeatureFlags({ visible }: FeatureFlagsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDevMode, setShowDevMode] = useState(visible);

  useEffect(() => {
    setShowDevMode(visible);
  }, [visible]);

  const { data: featureFlags = [] } = useQuery({
    queryKey: ['/api/feature-flags'],
    enabled: showDevMode,
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      await apiRequest("POST", `/api/feature-flags/${id}/toggle`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feature-flags'] });
      toast({
        title: "Feature Flag Updated",
        description: "The feature flag has been successfully updated.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to update feature flag. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!showDevMode) {
    return null;
  }

  const handleToggle = (flag: FeatureFlag) => {
    toggleMutation.mutate({
      id: flag.id,
      enabled: !flag.enabled,
    });
  };

  return (
    <>
      {/* Developer Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Developer Mode</span>
              <Switch
                checked={showDevMode}
                onCheckedChange={setShowDevMode}
                data-testid="switch-dev-mode"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags Panel */}
      {showDevMode && (
        <div className="fixed right-4 top-20 z-30 w-72">
          <Card className="shadow-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Feature Flags</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featureFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No feature flags available</p>
              ) : (
                featureFlags.map((flag: FeatureFlag) => (
                  <div 
                    key={flag.id} 
                    className="flex items-center justify-between"
                    data-testid={`feature-flag-${flag.name}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{flag.name}</span>
                        {flag.hasUserOverride && (
                          <Badge variant="outline" className="text-xs">
                            Override
                          </Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-xs text-muted-foreground">{flag.description}</p>
                      )}
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag)}
                      disabled={toggleMutation.isPending}
                      data-testid={`switch-${flag.name}`}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
