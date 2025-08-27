// API SERVICE ARCHITECTURE FOR PEOPLE SEARCH

// 1. API Service Factory Pattern
class APIServiceFactory {
  static getService(inputType, query) {
    switch(inputType) {
      case 'email':
        return new EmailLookupService();
      case 'phone':
        return new PhoneLookupService();
      case 'name':
        return new NameLookupService();
      case 'address':
        return new AddressLookupService();
      default:
        return new ComprehensiveSearchService();
    }
  }
}

// 2. Base API Service Template
class BaseAPIService {
  constructor() {
    this.apiKey = process.env[this.constructor.API_KEY_NAME];
    this.baseURL = this.constructor.BASE_URL;
  }

  async search(query) {
    try {
      const normalizedQuery = this.normalizeQuery(query);
      const response = await this.makeAPICall(normalizedQuery);
      return this.transformResponse(response);
    } catch (error) {
      console.error(`API search failed: ${error.message}`);
      throw new Error(`API search failed: ${error.message}`);
    }
  }

  normalizeQuery(query) {
    return query;
  }

  async makeAPICall(query) {
    const response = await fetch(this.buildRequestURL(query), {
      headers: this.buildHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  buildHeaders() {
    return {
      'Content-Type': 'application/json',
      ...this.constructor.ADDITIONAL_HEADERS
    };
  }

  transformResponse(apiResponse) {
    return {
      source: this.constructor.SERVICE_NAME,
      results: this.extractResults(apiResponse),
      metadata: this.extractMetadata(apiResponse)
    };
  }

  extractResults(response) {
    return [];
  }

  extractMetadata(response) {
    return {
      timestamp: new Date().toISOString(),
      source: this.constructor.SERVICE_NAME
    };
  }
}

// 3. Email Lookup Service (Hunter.io)
class EmailLookupService extends BaseAPIService {
  static SERVICE_NAME = 'Hunter.io Email API';
  static API_KEY_NAME = 'HUNTER_API_KEY';
  static BASE_URL = 'https://api.hunter.io/v2/';

  normalizeQuery(email) {
    return email.toLowerCase().trim();
  }

  buildRequestURL(email) {
    return `${this.baseURL}email-finder?email=${email}&api_key=${this.apiKey}`;
  }

  extractResults(response) {
    if (response.data) {
      return [{
        email: response.data.email,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        confidence: response.data.confidence,
        position: response.data.position,
        company: response.data.company,
        phone: response.data.phone,
        sources: response.data.sources
      }];
    }
    return [];
  }
}

// 4. Phone Lookup Service (NumVerify)
class PhoneLookupService extends BaseAPIService {
  static SERVICE_NAME = 'NumVerify Phone API';
  static API_KEY_NAME = 'NUMVERIFY_API_KEY';
  static BASE_URL = 'http://apilayer.net/api/';

  normalizeQuery(phone) {
    return phone.replace(/[^\d]/g, '');
  }

  buildRequestURL(phone) {
    return `${this.baseURL}validate?access_key=${this.apiKey}&number=${phone}`;
  }

  extractResults(response) {
    if (response.valid) {
      return [{
        phone: response.international_format,
        localFormat: response.local_format,
        country: response.country_name,
        location: response.location,
        carrier: response.carrier,
        lineType: response.line_type,
        valid: response.valid
      }];
    }
    return [];
  }
}

// 5. Name Lookup Service (Smarty + WebScraping.ai)
class NameLookupService extends BaseAPIService {
  static SERVICE_NAME = 'Name Search API';
  static API_KEY_NAME = 'SMARTY_AUTH_ID';
  static BASE_URL = 'https://us-street.api.smarty.com/';
  static ADDITIONAL_HEADERS = {
    'Authorization': `Basic ${Buffer.from(`${process.env.SMARTY_AUTH_ID}:${process.env.SMARTY_AUTH_TOKEN}`).toString('base64')}`
  };

  normalizeQuery(query) {
    if (typeof query === 'object') {
      return {
        firstName: query.firstName?.trim(),
        lastName: query.lastName?.trim(),
        city: query.city?.trim(),
        state: query.state?.trim()
      };
    }
    return query;
  }

  async makeAPICall(query) {
    // Use Smarty for address validation first
    const addressResponse = await this.validateAddress(query);
    
    // Then use WebScraping.ai for people search
    const peopleResponse = await this.searchPeople(query);
    
    return { address: addressResponse, people: peopleResponse };
  }

  async validateAddress(query) {
    const street = query.address || '';
    const city = query.city || '';
    const state = query.state || '';
    
    const response = await fetch(`${this.baseURL}street-address?street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&candidates=10`, {
      headers: this.buildHeaders()
    });
    
    return await response.json();
  }

  async searchPeople(query) {
    const webScrapingKey = process.env.WEBSCRAPING_AI_API_KEY;
    const searchQuery = `${query.firstName}+${query.lastName}+${query.city}+${query.state}`;
    
    const response = await fetch(`https://api.webscraping.ai/api/v1/search?api_key=${webScrapingKey}&query=${encodeURIComponent(searchQuery)}&num=20`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    return await response.json();
  }

  extractResults(response) {
    const results = [];
    
    // Process address validation results
    if (response.address && Array.isArray(response.address)) {
      response.address.forEach(addr => {
        results.push({
          type: 'address',
          deliveryLine: addr.delivery_line_1,
          city: addr.components.city_name,
          state: addr.components.state_abbreviation,
          zipcode: addr.components.zipcode,
          county: addr.metadata.county_name,
          latitude: addr.metadata.latitude,
          longitude: addr.metadata.longitude,
          precision: addr.metadata.precision
        });
      });
    }
    
    // Process people search results
    if (response.people && response.people.results) {
      response.people.results.forEach(person => {
        results.push({
          type: 'person',
          name: person.title,
          url: person.link,
          description: person.description
        });
      });
    }
    
    return results;
  }
}

// 6. Address Lookup Service (Smarty)
class AddressLookupService extends BaseAPIService {
  static SERVICE_NAME = 'Smarty Address API';
  static API_KEY_NAME = 'SMARTY_AUTH_ID';
  static BASE_URL = 'https://us-street.api.smarty.com/';
  static ADDITIONAL_HEADERS = {
    'Authorization': `Basic ${Buffer.from(`${process.env.SMARTY_AUTH_ID}:${process.env.SMARTY_AUTH_TOKEN}`).toString('base64')}`
  };

  normalizeQuery(address) {
    if (typeof address === 'object') {
      return {
        street: address.address?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        zipcode: address.zipcode?.trim()
      };
    }
    return { street: address.trim() };
  }

  buildRequestURL(query) {
    const params = new URLSearchParams();
    if (query.street) params.append('street', query.street);
    if (query.city) params.append('city', query.city);
    if (query.state) params.append('state', query.state);
    if (query.zipcode) params.append('zipcode', query.zipcode);
    params.append('candidates', '10');
    
    return `${this.baseURL}street-address?${params.toString()}`;
  }

  extractResults(response) {
    if (Array.isArray(response)) {
      return response.map(addr => ({
        deliveryLine: addr.delivery_line_1,
        secondary: addr.delivery_line_2,
        city: addr.components.city_name,
        state: addr.components.state_abbreviation,
        zipcode: addr.components.zipcode,
        county: addr.metadata.county_name,
        latitude: addr.metadata.latitude,
        longitude: addr.metadata.longitude,
        precision: addr.metadata.precision,
        timeZone: addr.metadata.time_zone,
        utcOffset: addr.metadata.utc_offset
      }));
    }
    return [];
  }
}

// 7. Comprehensive Search Service (Multiple APIs)
class ComprehensiveSearchService extends BaseAPIService {
  static SERVICE_NAME = 'Comprehensive People Search';
  
  async search(query) {
    const services = [
      new EmailLookupService(),
      new PhoneLookupService(),
      new NameLookupService()
    ];
    
    const results = await Promise.allSettled(
      services.map(service => service.search(query))
    );
    
    const successfulResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    return this.aggregateResults(successfulResults);
  }
  
  aggregateResults(results) {
    const aggregated = {
      sources: [],
      people: [],
      addresses: [],
      emails: [],
      phones: []
    };
    
    results.forEach(result => {
      aggregated.sources.push(result.source);
      
      if (result.results && Array.isArray(result.results)) {
        result.results.forEach(item => {
          if (item.type === 'person') {
            aggregated.people.push(item);
          } else if (item.type === 'address') {
            aggregated.addresses.push(item);
          } else if (item.email) {
            aggregated.emails.push(item);
          } else if (item.phone) {
            aggregated.phones.push(item);
          }
        });
      }
    });
    
    return {
      source: 'Multiple APIs',
      results: aggregated,
      metadata: {
        timestamp: new Date().toISOString(),
        sourcesUsed: aggregated.sources,
        totalResults: aggregated.people.length + aggregated.addresses.length + 
                     aggregated.emails.length + aggregated.phones.length
      }
    };
  }
}

// 8. Main Search Orchestrator
class SearchOrchestrator {
  constructor() {
    this.activeServices = new Map();
  }

  async performSearch(searchType, searchQuery) {
    const service = APIServiceFactory.getService(searchType, searchQuery);
    
    try {
      const results = await service.search(searchQuery);
      await this.logSearch(searchType, searchQuery, results);
      return this.enhanceResults(results);
    } catch (error) {
      console.error('Primary search failed:', error);
      return await this.fallbackSearch(searchType, searchQuery);
    }
  }

  async logSearch(searchType, query, results) {
    // Implementation for logging searches to database
    console.log('Search logged:', { searchType, query, results });
  }

  enhanceResults(rawResults) {
    // Add confidence scoring and data enrichment
    return {
      ...rawResults,
      enhancedData: {
        confidenceScore: this.calculateConfidence(rawResults),
        timestamp: new Date().toISOString(),
        verified: this.verifyResults(rawResults)
      }
    };
  }

  calculateConfidence(results) {
    // Simple confidence scoring based on result quality
    if (!results.results || results.results.length === 0) return 0;
    
    let score = 0;
    const items = Array.isArray(results.results) ? results.results : [];
    
    items.forEach(item => {
      if (item.email) score += 20;
      if (item.phone) score += 15;
      if (item.address) score += 10;
      if (item.name) score += 5;
    });
    
    return Math.min(100, score);
  }

  verifyResults(results) {
    // Basic verification logic
    return results.results && results.results.length > 0;
  }

  async fallbackSearch(searchType, query) {
    console.log('Attempting fallback search for:', searchType, query);
    
    // Try a comprehensive search as fallback
    try {
      const fallbackService = new ComprehensiveSearchService();
      return await fallbackService.search(query);
    } catch (error) {
      throw new Error(`All search attempts failed: ${error.message}`);
    }
  }
}

// 9. API Endpoint Implementation
app.post('/api/search/pro', async (req, res) => {
  try {
    const { searchType, searchQuery } = req.body;
    const orchestrator = new SearchOrchestrator();
    
    const results = await orchestrator.performSearch(searchType, searchQuery);
    
    res.json({
      success: true,
      data: results,
      searchId: this.generateSearchId(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Search operation failed',
      details: error.message
    });
  }
});

// 10. Input Validation Middleware
function validateSearchInput(req, res, next) {
  const { searchType, searchQuery } = req.body;
  
  const validators = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    phone: (phone) => /^[\d\s\-\+\(\)]{10,}$/.test(phone.replace(/[^\d]/g, '')),
    name: (name) => {
      if (typeof name === 'object') {
        return name.lastName && name.lastName.trim().length >= 2;
      }
      return typeof name === 'string' && name.trim().length >= 2;
    },
    address: (address) => {
      if (typeof address === 'object') {
        return address.address && address.address.trim().length >= 5;
      }
      return typeof address === 'string' && address.trim().length >= 5;
    }
  };

  if (!validators[searchType] || !validators[searchType](searchQuery)) {
    return res.status(400).json({
      error: 'Invalid input for search type',
      searchType,
      received: searchQuery
    });
  }
  
  next();
}

// 11. Utility Functions
function generateSearchId() {
  return `srch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 12. Environment Configuration
// Set these as environment variables in your Replit
process.env.SMARTY_AUTH_ID = '75f675dc-523f-d03a-34c2-ea8aee1330e3';
process.env.SMARTY_AUTH_TOKEN = 'Jl9ke7xEX27uLha1mfIK';
process.env.HUNTER_API_KEY = 'e36f348a2d2ef17d2a2c8482ec98763e4720dd7b';
process.env.NUMVERIFY_API_KEY = 'e09fd87e317910f122f02ce63d359078';
process.env.WEBSCRAPING_AI_API_KEY = '4333654d-ff88-447e-a50b-f3366c345706';
process.env.IPQS_API_KEY = 'DeiA3mkEL8yn9lPlmH7pPAlxZW0 r4HrB';
process.env.RESEND_API_KEY = 're_MXY5MqZz_4pmWj4pDBpkZoe3snzUuGZp2';
process.env.GOOGLE_VISION_API_KEY = 'AIzaSyAzRSOw7DCSlJveF-OSxfOSOUbUWO6NIH4';
process.env.GEMINI_API_KEY = 'AIzaSyCyJtCjUzGSh_oO9-h1ugN8scHeazdVk4U';

// Export for use in other modules
module.exports = {
  APIServiceFactory,
  SearchOrchestrator,
  EmailLookupService,
  PhoneLookupService,
  NameLookupService,
  AddressLookupService,
  ComprehensiveSearchService
};