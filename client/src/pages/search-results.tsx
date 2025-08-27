import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import SearchFilters from "@/components/search-filters";
import ProfileModal from "@/components/profile-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Phone, Mail, MapPin, Briefcase, Filter, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { PeopleProfile } from "@shared/schema";

interface SearchResultsProps {
  searchParams?: URLSearchParams;
}

export default function SearchResults({ searchParams }: SearchResultsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);

  // Extract search parameters
  const searchType = searchParams?.get('type') || 'name';
  const query = searchParams?.get('q') || '';

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/search', { type: searchType, query }],
    enabled: !!query,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (!query) {
    setLocation("/");
    return null;
  }

  const results: PeopleProfile[] = (searchResults as any)?.results || [];
  const total = (searchResults as any)?.total || 0;

  const getMatchPercentage = (profile: PeopleProfile, index: number) => {
    // Simple match calculation for demo purposes
    return Math.max(95 - index * 8, 65);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <button 
                  onClick={() => setLocation("/")}
                  className="hover:text-primary"
                  data-testid="link-home"
                >
                  Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <span>Search Results</span>
              </nav>
              <h1 className="text-2xl font-bold" data-testid="text-search-title">
                Search Results for "{query}"
              </h1>
              <p className="text-muted-foreground" data-testid="text-results-count">
                Found {total} possible matches
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="flex items-center space-x-2"
                data-testid="button-show-suggestions"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Show Suggestions</span>
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
                data-testid="button-toggle-filters"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="lg:w-80">
                <SearchFilters 
                  showSuggestions={showSuggestions}
                  onApplyFilters={(filters) => {
                    // TODO: Apply filters to search
                    console.log('Applying filters:', filters);
                  }}
                />
              </aside>
            )}

            {/* Results Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="w-16 h-16 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <div className="grid grid-cols-2 gap-4">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-muted-foreground">
                      <p className="text-lg font-medium mb-2">No results found</p>
                      <p>Try adjusting your search criteria or check the spelling</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {results.map((result, index) => (
                    <Card 
                      key={result.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedProfile(result.id)}
                      data-testid={`card-profile-${result.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={result.profileImageUrl || `https://ui-avatars.com/api/?name=${result.firstName}+${result.lastName}&size=64&background=random`}
                            alt={`${result.firstName} ${result.lastName} profile`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold" data-testid={`text-name-${result.id}`}>
                                {result.firstName} {result.middleName} {result.lastName}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" data-testid={`badge-match-${result.id}`}>
                                  {getMatchPercentage(result, index)}% Match
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="text-muted-foreground text-sm mb-3" data-testid={`text-location-${result.id}`}>
                              {result.age && `Age: ${result.age} • `}{result.city}, {result.state}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                {Array.isArray(result.phoneNumbers) && result.phoneNumbers.length > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span data-testid={`text-phone-${result.id}`}>
                                      {result.phoneNumbers[0]}
                                    </span>
                                  </div>
                                )}
                                {Array.isArray(result.emailAddresses) && result.emailAddresses.length > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span data-testid={`text-email-${result.id}`}>
                                      {result.emailAddresses[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                {result.currentAddress && (
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="truncate" data-testid={`text-address-${result.id}`}>
                                      {result.currentAddress}
                                    </span>
                                  </div>
                                )}
                                {result.occupation && (
                                  <div className="flex items-center space-x-2">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    <span data-testid={`text-occupation-${result.id}`}>
                                      {result.occupation}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {Array.isArray(result.relatives) && result.relatives.length > 0 && (
                              <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
                                <span data-testid={`text-relatives-${result.id}`}>
                                  Relatives: {result.relatives.slice(0, 3).map((r: any) => r.name).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Load More */}
                  <div className="text-center py-8">
                    <Button 
                      size="lg"
                      data-testid="button-load-more"
                    >
                      Load More Results
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal 
          profileId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}
