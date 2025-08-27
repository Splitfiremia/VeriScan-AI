import { Request, Response, NextFunction } from 'express';

export interface SearchResult {
  source: string;
  results: any[];
  metadata: {
    timestamp: string;
    source: string;
    sourcesUsed?: string[];
    totalResults?: number;
  };
}

export interface EnhancedSearchResult extends SearchResult {
  enhancedData: {
    confidenceScore: number;
    timestamp: string;
    verified: boolean;
  };
}

export class APIServiceFactory {
  static getService(inputType: string, query: any): BaseAPIService;
}

export class BaseAPIService {
  constructor();
  search(query: any): Promise<SearchResult>;
  normalizeQuery(query: any): any;
  makeAPICall(query: any): Promise<any>;
  buildHeaders(): Record<string, string>;
  transformResponse(apiResponse: any): SearchResult;
  extractResults(response: any): any[];
  extractMetadata(response: any): SearchResult['metadata'];
}

export class SearchOrchestrator {
  constructor();
  performSearch(searchType: string, searchQuery: any): Promise<EnhancedSearchResult>;
  logSearch(searchType: string, query: any, results: SearchResult): Promise<void>;
  enhanceResults(rawResults: SearchResult): EnhancedSearchResult;
  calculateConfidence(results: SearchResult): number;
  verifyResults(results: SearchResult): boolean;
  fallbackSearch(searchType: string, query: any): Promise<EnhancedSearchResult>;
}

export class EmailLookupService extends BaseAPIService {}
export class PhoneLookupService extends BaseAPIService {}
export class NameLookupService extends BaseAPIService {}
export class AddressLookupService extends BaseAPIService {}
export class ComprehensiveSearchService extends BaseAPIService {}

export function validateSearchInput(req: Request, res: Response, next: NextFunction): void;
export function generateSearchId(): string;