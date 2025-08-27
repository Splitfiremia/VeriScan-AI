import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Phone, MapPin, Search, Mail, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

const US_STATES = [
  { value: "ALL", label: "All States" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export default function SearchTabs() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("name");
  
  // Form states
  const [nameSearch, setNameSearch] = useState({
    firstName: "",
    lastName: "",
    city: "",
    state: "ALL",
  });
  
  const [phoneSearch, setPhoneSearch] = useState({
    phoneNumber: "",
  });
  
  const [formattedPhoneDisplay, setFormattedPhoneDisplay] = useState("");
  
  const [addressSearch, setAddressSearch] = useState({
    address: "",
    city: "",
    state: "ALL",
    zipCode: "",
  });
  
  const [emailSearch, setEmailSearch] = useState({
    email: "",
  });

  const [useProfessionalSearch, setUseProfessionalSearch] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (searchData: { searchType: string; searchQuery: any }) => {
      const endpoint = useProfessionalSearch ? "/api/search/pro" : "/api/search";
      return await apiRequest("POST", endpoint, searchData);
    },
    onSuccess: () => {
      // Navigate to results page with search params
      const searchParams = new URLSearchParams();
      searchParams.set('type', activeTab);
      searchParams.set('pro', useProfessionalSearch.toString());
      
      if (activeTab === 'name') {
        searchParams.set('q', `${nameSearch.firstName} ${nameSearch.lastName}`.trim());
      } else if (activeTab === 'phone') {
        searchParams.set('q', phoneSearch.phoneNumber);
      } else if (activeTab === 'address') {
        searchParams.set('q', `${addressSearch.address} ${addressSearch.city}`.trim());
      } else if (activeTab === 'email') {
        searchParams.set('q', emailSearch.email);
      }
      
      setLocation(`/search-results?${searchParams.toString()}`);
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
        title: "Search Failed",
        description: "There was an error performing your search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNameSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameSearch.lastName.trim()) {
      toast({
        title: "Last Name Required",
        description: "Please enter a last name to search.",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      searchType: 'name',
      searchQuery: nameSearch,
    });
  };

  // Phone number formatting functions
  const formatPhoneForDisplay = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    let formatted = '';
    
    // Format based on length
    if (numbers.length > 0) {
      formatted = '(' + numbers.substring(0, 3);
    }
    if (numbers.length > 3) {
      formatted += ') ' + numbers.substring(3, 6);
    }
    if (numbers.length > 6) {
      formatted += '-' + numbers.substring(6, 10);
    }
    
    return formatted;
  };
  
  const formatPhoneForAPI = (value: string) => {
    // Remove all non-digit characters and add US country code
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 10) {
      return '+1' + numbers.substring(0, 10);
    }
    return '';
  };
  
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (numbers.length <= 10) {
      const formattedDisplay = formatPhoneForDisplay(value);
      setPhoneSearch(prev => ({ ...prev, phoneNumber: formattedDisplay }));
      
      // Update the API format display
      const apiFormat = formatPhoneForAPI(value);
      setFormattedPhoneDisplay(apiFormat || '+1XXXXXXXXXX');
    }
  };

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneSearch.phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to search.",
        variant: "destructive",
      });
      return;
    }
    
    // Format phone number for API
    const formattedPhone = formatPhoneForAPI(phoneSearch.phoneNumber);
    if (!formattedPhone) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a complete 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      searchType: 'phone',
      searchQuery: { phoneNumber: formattedPhone },
    });
  };

  const handleAddressSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressSearch.address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to search.",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      searchType: 'address',
      searchQuery: addressSearch,
    });
  };

  const handleEmailSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSearch.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to search.",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      searchType: 'email',
      searchQuery: emailSearch,
    });
  };

  return (
    <div className="space-y-6">
      {/* Professional Search Toggle */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <Label htmlFor="professional-search" className="text-white font-medium">
                  Professional Search Mode
                </Label>
                <p className="text-sm text-white/70">
                  Enhanced results using premium data sources
                </p>
              </div>
            </div>
            <Switch
              id="professional-search"
              checked={useProfessionalSearch}
              onCheckedChange={setUseProfessionalSearch}
              data-testid="toggle-professional-search"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/15 border border-white/20">
            <TabsTrigger 
              value="name" 
              className="text-white font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              data-testid="tab-name-search"
            >
              <User className="w-4 h-4 mr-2" />
              Name Search
            </TabsTrigger>
            <TabsTrigger 
              value="phone"
              className="text-white font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              data-testid="tab-phone-search"
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone Search
            </TabsTrigger>
            <TabsTrigger 
              value="address"
              className="text-white font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              data-testid="tab-address-search"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Address Search
            </TabsTrigger>
            <TabsTrigger 
              value="email"
              className="text-white font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              data-testid="tab-email-search"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="name">
            <form onSubmit={handleNameSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white mb-2 block">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={nameSearch.firstName}
                    onChange={(e) => setNameSearch(prev => ({ ...prev, firstName: e.target.value }))}
                    className="bg-white border-0 text-foreground placeholder-muted-foreground"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white mb-2 block">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name *"
                    value={nameSearch.lastName}
                    onChange={(e) => setNameSearch(prev => ({ ...prev, lastName: e.target.value }))}
                    className="bg-white border-0 text-foreground placeholder-muted-foreground"
                    required
                    data-testid="input-last-name"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-white mb-2 block">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={nameSearch.city}
                    onChange={(e) => setNameSearch(prev => ({ ...prev, city: e.target.value }))}
                    className="bg-white border-0 text-foreground placeholder-muted-foreground"
                    data-testid="input-city"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-white mb-2 block">State</Label>
                  <Select 
                    value={nameSearch.state} 
                    onValueChange={(value) => setNameSearch(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger 
                      className="bg-white border-0 text-foreground"
                      data-testid="select-state"
                    >
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                type="submit" 
                size="lg"
                disabled={searchMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90 mt-4"
                data-testid="button-search-name"
              >
                <Search className="w-4 h-4 mr-2" />
                {searchMutation.isPending ? "Searching..." : "Search Now"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            <form onSubmit={handlePhoneSearch} className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-md space-y-4">
                  <div>
                    <Label htmlFor="phoneNumber" className="text-white mb-2 block">Phone Number</Label>
                    <div className="flex">
                      <div className="px-3 py-2 bg-white/20 border border-white/30 border-r-0 rounded-l-md text-white font-medium">
                        +1
                      </div>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="(212) 555-0123"
                        value={phoneSearch.phoneNumber}
                        onChange={handlePhoneInputChange}
                        className="bg-white border-0 text-foreground placeholder-muted-foreground rounded-l-none"
                        data-testid="input-phone-number"
                      />
                    </div>
                  </div>
                  
                  {/* Visual Feedback */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-700 text-sm font-medium">Auto-formatted for API</span>
                    </div>
                    <div className="text-green-600 text-sm mt-1">
                      Numbers are automatically formatted with country code for API lookup
                    </div>
                  </div>
                  
                  {/* API Format Display */}
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <div className="text-white/70 text-sm mb-1">API will receive:</div>
                    <div className="text-white font-mono text-lg" data-testid="formatted-phone-display">
                      {formattedPhoneDisplay || '+1XXXXXXXXXX'}
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                size="lg"
                disabled={searchMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-search-phone"
              >
                <Search className="w-4 h-4 mr-2" />
                {searchMutation.isPending ? "Searching..." : "Search Phone"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="address">
            <form onSubmit={handleAddressSearch} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-white mb-2 block">
                    Street Address *
                  </Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main Street"
                    value={addressSearch.address}
                    onChange={(e) => setAddressSearch(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-white border-0 text-foreground placeholder-muted-foreground"
                    required
                    data-testid="input-street-address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="addressCity" className="text-white mb-2 block">City</Label>
                    <Input
                      id="addressCity"
                      placeholder="City"
                      value={addressSearch.city}
                      onChange={(e) => setAddressSearch(prev => ({ ...prev, city: e.target.value }))}
                      className="bg-white border-0 text-foreground placeholder-muted-foreground"
                      data-testid="input-address-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressState" className="text-white mb-2 block">State</Label>
                    <Select 
                      value={addressSearch.state} 
                      onValueChange={(value) => setAddressSearch(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger 
                        className="bg-white border-0 text-foreground"
                        data-testid="select-address-state"
                      >
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.slice(1).map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-white mb-2 block">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="12345 or 12345-6789"
                      value={addressSearch.zipCode}
                      onChange={(e) => setAddressSearch(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="bg-white border-0 text-foreground placeholder-muted-foreground"
                      data-testid="input-zip-code"
                    />
                  </div>
                </div>

                {/* Smarty Streets API Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-700 text-sm font-medium">Smarty Streets API Integration</span>
                  </div>
                  <div className="text-blue-600 text-sm mt-1">
                    Address will be validated and standardized for accurate property data lookup
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                size="lg"
                disabled={searchMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-search-address"
              >
                <Search className="w-4 h-4 mr-2" />
                {searchMutation.isPending ? "Searching..." : "Search Address"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="email">
            <form onSubmit={handleEmailSearch} className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <Label htmlFor="emailAddress" className="text-white mb-2 block">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    placeholder="Enter email address (e.g., john@example.com)"
                    value={emailSearch.email}
                    onChange={(e) => setEmailSearch(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white border-0 text-foreground placeholder-muted-foreground"
                    data-testid="input-email-address"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                size="lg"
                disabled={searchMutation.isPending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-search-email"
              >
                <Search className="w-4 h-4 mr-2" />
                {searchMutation.isPending ? "Searching..." : "Search Email"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
}
