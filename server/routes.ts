import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSearchHistorySchema } from "@shared/schema";
import { SearchOrchestrator, validateSearchInput, generateSearchId } from "./api-services";
import { APIComplianceChecker, generateComplianceReport } from "./api-compliance";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Search routes
  app.post('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { searchType, searchQuery } = req.body;

      // Validate search type
      if (!['name', 'phone', 'address', 'email'].includes(searchType)) {
        return res.status(400).json({ message: "Invalid search type" });
      }

      // API Compliance Check - Validate and format input
      const validation = APIComplianceChecker.validateSearchRequest(searchType, searchQuery);
      
      if (!validation.isValid) {
        console.error("API Compliance Error:", validation.errors);
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: validation.errors,
          complianceReport: generateComplianceReport(searchType, searchQuery)
        });
      }

      // Use formatted/validated data for search
      let formattedQuery = searchQuery;
      if (validation.apiFormat) {
        if (searchType === 'phone') {
          formattedQuery = { phoneNumber: validation.formattedValue };
        } else if (searchType === 'email') {
          formattedQuery = { email: validation.formattedValue };
        } else {
          try {
            formattedQuery = JSON.parse(validation.apiFormat);
          } catch (e) {
            formattedQuery = searchQuery;
          }
        }
      }

      console.log(`✓ API Compliance passed for ${searchType} search:`, validation.formattedValue);

      // Perform search based on type using formatted/validated data
      let results: any[] = [];
      
      if (searchType === 'name') {
        results = await storage.searchPeople({
          firstName: formattedQuery.firstName,
          lastName: formattedQuery.lastName,
          city: formattedQuery.city,
          state: formattedQuery.state,
        });
      } else if (searchType === 'phone') {
        results = await storage.searchPeople({
          phoneNumber: formattedQuery.phoneNumber,
        });
      } else if (searchType === 'address') {
        results = await storage.searchPeople({
          address: formattedQuery.address,
          city: formattedQuery.city,
          state: formattedQuery.state,
        });
      } else if (searchType === 'email') {
        results = await storage.searchPeople({
          email: formattedQuery.email,
        });
      }

      // Save search history with formatted query
      await storage.createSearchHistory({
        userId,
        searchType,
        searchQuery: formattedQuery,
        searchResults: results,
      });

      // Include compliance info in response for debugging
      const responseData = {
        results, 
        total: results.length,
        compliance: {
          isValid: validation.isValid,
          formattedInput: validation.formattedValue,
          warnings: validation.warnings
        }
      };

      res.json(responseData);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Get search history
  app.get('/api/search/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getUserSearchHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  // Get profile details
  app.get('/api/profile/:id', isAuthenticated, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }

      const profile = await storage.getPeopleProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Feature flags routes
  app.get('/api/feature-flags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [allFlags, userFlags] = await Promise.all([
        storage.getFeatureFlags(),
        storage.getUserFeatureFlags(userId),
      ]);

      // Merge flags with user overrides
      const flagsWithOverrides = allFlags.map(flag => {
        const userOverride = userFlags.find(uf => uf.featureFlagId === flag.id);
        return {
          ...flag,
          enabled: userOverride ? userOverride.enabled : flag.enabled,
          hasUserOverride: !!userOverride,
        };
      });

      res.json(flagsWithOverrides);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      res.status(500).json({ message: "Failed to fetch feature flags" });
    }
  });

  app.post('/api/feature-flags/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const featureFlagId = parseInt(req.params.id);
      const { enabled } = req.body;

      if (isNaN(featureFlagId)) {
        return res.status(400).json({ message: "Invalid feature flag ID" });
      }

      const userFlag = await storage.toggleUserFeatureFlag({
        userId,
        featureFlagId,
        enabled,
      });

      res.json(userFlag);
    } catch (error) {
      console.error("Error toggling feature flag:", error);
      res.status(500).json({ message: "Failed to toggle feature flag" });
    }
  });

  // API Compliance Validation Endpoint
  app.post('/api/validate', isAuthenticated, async (req: any, res) => {
    try {
      const { searchType, searchQuery } = req.body;
      
      const validation = APIComplianceChecker.validateSearchRequest(searchType, searchQuery);
      const complianceReport = generateComplianceReport(searchType, searchQuery);
      
      res.json({
        validation,
        complianceReport,
        timestamp: new Date().toISOString(),
        searchType,
        originalInput: searchQuery
      });
    } catch (error) {
      console.error("Error validating input:", error);
      res.status(500).json({ message: "Validation failed" });
    }
  });

  // Professional API Search Endpoint (Enhanced with External APIs)
  app.post('/api/search/pro', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { searchType, searchQuery } = req.body;
      
      // API Compliance Check - Validate before external API calls
      const validation = APIComplianceChecker.validateSearchRequest(searchType, searchQuery);
      
      if (!validation.isValid) {
        console.error("Professional API Compliance Error:", validation.errors);
        return res.status(400).json({ 
          message: "Invalid search parameters for professional search", 
          errors: validation.errors,
          complianceReport: generateComplianceReport(searchType, searchQuery)
        });
      }

      // Use formatted/validated data for external API calls
      let formattedQuery = searchQuery;
      if (validation.apiFormat) {
        if (searchType === 'phone') {
          formattedQuery = { phoneNumber: validation.formattedValue };
        } else if (searchType === 'email') {
          formattedQuery = { email: validation.formattedValue };
        } else {
          try {
            formattedQuery = JSON.parse(validation.apiFormat);
          } catch (e) {
            formattedQuery = searchQuery;
          }
        }
      }

      console.log(`✓ Professional API Compliance passed for ${searchType} search:`, validation.formattedValue);
      
      const orchestrator = new SearchOrchestrator();
      
      // Perform enhanced search using external APIs with validated/formatted data
      const enhancedResults = await orchestrator.performSearch(searchType, formattedQuery);
      
      // Also perform local database search for comparison
      let localResults: any[] = [];
      
      if (searchType === 'name') {
        localResults = await storage.searchPeople({
          firstName: searchQuery.firstName,
          lastName: searchQuery.lastName,
          city: searchQuery.city,
          state: searchQuery.state,
        });
      } else if (searchType === 'phone') {
        localResults = await storage.searchPeople({
          phoneNumber: formattedQuery.phoneNumber,
        });
      } else if (searchType === 'address') {
        localResults = await storage.searchPeople({
          address: searchQuery.address,
          city: searchQuery.city,
          state: searchQuery.state,
        });
      } else if (searchType === 'email') {
        localResults = await storage.searchPeople({
          email: searchQuery.email,
        });
      }

      // Combine results from external APIs and local database
      const combinedResults = {
        external: enhancedResults,
        local: localResults,
        combined: [...localResults, ...(enhancedResults.results || [])],
        searchId: generateSearchId(),
        timestamp: new Date().toISOString()
      };

      // Save search history
      await storage.createSearchHistory({
        userId,
        searchType: `pro_${searchType}`,
        searchQuery,
        searchResults: combinedResults,
      });

      res.json({
        success: true,
        data: combinedResults,
        searchId: combinedResults.searchId,
        timestamp: combinedResults.timestamp,
        sources: ['VeriScan Database', ...(enhancedResults.metadata?.sourcesUsed || [])]
      });
      
    } catch (error) {
      console.error('Professional search endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Professional search operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
