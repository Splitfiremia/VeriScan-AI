import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Mail, MapPin, Briefcase, Users, Home, History, Bookmark, Share, Flag, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { PeopleProfile } from "@shared/schema";

interface ProfileModalProps {
  profileId: number;
  onClose: () => void;
}

export default function ProfileModal({ profileId, onClose }: ProfileModalProps) {
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/profile', profileId],
    enabled: !!profileId,
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

  if (error && !isUnauthorizedError(error as Error)) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load profile details</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="text-profile-modal-title">Detailed Profile</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-profile"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <div className="text-center mb-6">
                <img 
                  src={profile.profileImageUrl || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&size=200&background=random`}
                  alt={`${profile.firstName} ${profile.lastName} detailed profile`}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                  data-testid="img-profile-avatar"
                />
                <h3 className="text-xl font-bold" data-testid="text-profile-name">
                  {profile.firstName} {profile.middleName} {profile.lastName}
                </h3>
                <p className="text-muted-foreground" data-testid="text-profile-location">
                  {profile.age && `Age ${profile.age} • `}{profile.city}, {profile.state}
                </p>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {Array.isArray(profile.phoneNumbers) && profile.phoneNumbers.length > 0 && (
                    <div className="flex items-center space-x-2" data-testid="contact-phone">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{profile.phoneNumbers[0]}</span>
                    </div>
                  )}
                  {Array.isArray(profile.emailAddresses) && profile.emailAddresses.length > 0 && (
                    <div className="flex items-center space-x-2" data-testid="contact-email">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>{profile.emailAddresses[0]}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    data-testid="button-save-profile"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    data-testid="button-share-profile"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    data-testid="button-report-issue"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Address */}
              {profile.currentAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Home className="w-5 h-5 text-primary" />
                      <span>Current Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="font-medium" data-testid="text-current-address">
                        {profile.currentAddress}
                      </p>
                      <p className="text-muted-foreground">
                        {profile.city}, {profile.state} {profile.zipCode}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Address History */}
              {Array.isArray(profile.addressHistory) && profile.addressHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <History className="w-5 h-5 text-primary" />
                      <span>Address History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {profile.addressHistory.map((address: any, index: number) => (
                        <div key={index} className="flex justify-between" data-testid={`address-history-${index}`}>
                          <div>
                            <p className="font-medium">{address.address}</p>
                            <p className="text-muted-foreground">{address.city}, {address.state}</p>
                          </div>
                          <span className="text-muted-foreground">{address.dateRange}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Associates & Relatives */}
              {(Array.isArray(profile.relatives) && profile.relatives.length > 0) || 
               (Array.isArray(profile.associates) && profile.associates.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Associates & Relatives</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Array.isArray(profile.relatives) && profile.relatives.map((relative: any, index: number) => (
                        <div key={index} data-testid={`relative-${index}`}>
                          <p className="font-medium">{relative.name}</p>
                          <p className="text-muted-foreground">{relative.relationship} • Age {relative.age}</p>
                        </div>
                      ))}
                      {Array.isArray(profile.associates) && profile.associates.map((associate: any, index: number) => (
                        <div key={index} data-testid={`associate-${index}`}>
                          <p className="font-medium">{associate.name}</p>
                          <p className="text-muted-foreground">Associate • Age {associate.age}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Professional Information */}
              {(profile.occupation || profile.employer) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <span>Professional Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      {profile.occupation && (
                        <div>
                          <p className="font-medium" data-testid="text-occupation">{profile.occupation}</p>
                          {profile.employer && (
                            <p className="text-muted-foreground" data-testid="text-employer">{profile.employer}</p>
                          )}
                        </div>
                      )}
                      {Array.isArray(profile.education) && profile.education.length > 0 && (
                        <div className="mt-3">
                          <p className="text-muted-foreground">Education:</p>
                          {profile.education.map((edu: any, index: number) => (
                            <p key={index} className="text-muted-foreground" data-testid={`education-${index}`}>
                              {edu.degree} - {edu.school}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
