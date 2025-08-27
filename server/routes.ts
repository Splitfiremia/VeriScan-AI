import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSearchHistorySchema } from "@shared/schema";

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
      if (!['name', 'phone', 'address'].includes(searchType)) {
        return res.status(400).json({ message: "Invalid search type" });
      }

      // Perform search based on type
      let results: any[] = [];
      
      if (searchType === 'name') {
        results = await storage.searchPeople({
          firstName: searchQuery.firstName,
          lastName: searchQuery.lastName,
          city: searchQuery.city,
          state: searchQuery.state,
        });
      } else if (searchType === 'phone') {
        results = await storage.searchPeople({
          phoneNumber: searchQuery.phoneNumber,
        });
      } else if (searchType === 'address') {
        results = await storage.searchPeople({
          address: searchQuery.address,
          city: searchQuery.city,
          state: searchQuery.state,
        });
      }

      // Save search history
      await storage.createSearchHistory({
        userId,
        searchType,
        searchQuery,
        searchResults: results,
      });

      res.json({ results, total: results.length });
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

  const httpServer = createServer(app);
  return httpServer;
}
