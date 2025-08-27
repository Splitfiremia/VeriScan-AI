import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface SearchFiltersProps {
  showSuggestions: boolean;
  onApplyFilters: (filters: any) => void;
}

export default function SearchFilters({ showSuggestions, onApplyFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    ageRange: "",
    location: "",
    associatedWith: "",
    hasPhone: false,
    hasEmail: false,
  });

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Refine Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ageRange" className="text-sm font-medium mb-2 block">
              Age Range
            </Label>
            <Select 
              value={filters.ageRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}
            >
              <SelectTrigger data-testid="select-age-range">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="18-25">18-25</SelectItem>
                <SelectItem value="26-35">26-35</SelectItem>
                <SelectItem value="36-45">36-45</SelectItem>
                <SelectItem value="46-55">46-55</SelectItem>
                <SelectItem value="56-65">56-65</SelectItem>
                <SelectItem value="65+">65+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium mb-2 block">
              Location
            </Label>
            <Input
              id="location"
              placeholder="City, State"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              data-testid="input-location-filter"
            />
          </div>

          <div>
            <Label htmlFor="associatedWith" className="text-sm font-medium mb-2 block">
              Associated With
            </Label>
            <Input
              id="associatedWith"
              placeholder="Relative or associate name"
              value={filters.associatedWith}
              onChange={(e) => setFilters(prev => ({ ...prev, associatedWith: e.target.value }))}
              data-testid="input-associated-with"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPhone"
                checked={filters.hasPhone}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasPhone: !!checked }))}
                data-testid="checkbox-has-phone"
              />
              <Label htmlFor="hasPhone" className="text-sm">
                Include only results with phone numbers
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasEmail"
                checked={filters.hasEmail}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasEmail: !!checked }))}
                data-testid="checkbox-has-email"
              />
              <Label htmlFor="hasEmail" className="text-sm">
                Include only results with email addresses
              </Label>
            </div>
          </div>

          <Button 
            onClick={handleApplyFilters}
            className="w-full"
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Suggestions Panel */}
      {showSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              <span>Search Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full text-left justify-start h-auto p-3"
              data-testid="suggestion-middle-initial"
            >
              <div>
                <div className="font-medium text-sm">Try "John A Smith"</div>
                <div className="text-xs text-muted-foreground">Include middle initial</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full text-left justify-start h-auto p-3"
              data-testid="suggestion-location"
            >
              <div>
                <div className="font-medium text-sm">Search in California only</div>
                <div className="text-xs text-muted-foreground">Narrow by location</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full text-left justify-start h-auto p-3"
              data-testid="suggestion-age-range"
            >
              <div>
                <div className="font-medium text-sm">Age range 30-40</div>
                <div className="text-xs text-muted-foreground">Filter by age</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
