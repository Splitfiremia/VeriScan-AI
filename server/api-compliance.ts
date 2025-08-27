// API Input Format Compliance Checker
// Validates all inputs before sending to external APIs

export interface ValidationResult {
  isValid: boolean;
  formattedValue?: string;
  errors: string[];
  warnings: string[];
  apiFormat?: string;
}

export class APIComplianceChecker {
  
  /**
   * Validates and formats phone number for NumVerify API
   * Required format: E.164 (+12125550123)
   */
  static validatePhoneNumber(phoneNumber: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    if (!phoneNumber || phoneNumber.trim() === '') {
      result.errors.push('Phone number is required');
      return result;
    }

    // Remove all non-digit characters
    const numbers = phoneNumber.replace(/\D/g, '');

    // Validate US phone number (10 digits)
    if (numbers.length < 10) {
      result.errors.push('Phone number must contain at least 10 digits');
      return result;
    }

    if (numbers.length > 10) {
      result.warnings.push('Extra digits will be truncated');
    }

    // Format to E.164 (US numbers)
    const formattedNumber = '+1' + numbers.substring(0, 10);
    
    result.isValid = true;
    result.formattedValue = formattedNumber;
    result.apiFormat = formattedNumber;

    return result;
  }

  /**
   * Validates email format for Hunter.io API
   * Required format: valid email with domain
   */
  static validateEmail(email: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    if (!email || email.trim() === '') {
      result.errors.push('Email address is required');
      return result;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      result.errors.push('Invalid email format');
      return result;
    }

    // Check for common issues
    if (email.includes('..')) {
      result.errors.push('Email cannot contain consecutive dots');
      return result;
    }

    if (email.startsWith('.') || email.endsWith('.')) {
      result.errors.push('Email cannot start or end with a dot');
      return result;
    }

    result.isValid = true;
    result.formattedValue = email.toLowerCase().trim();
    result.apiFormat = result.formattedValue;

    return result;
  }

  /**
   * Validates name search parameters for Smarty Streets and WebScraping.ai APIs
   * Last name is required, other fields are optional but improve accuracy
   */
  static validateNameSearch(nameData: { firstName?: string; lastName: string; city?: string; state?: string }): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    // Validate required last name
    if (!nameData.lastName || nameData.lastName.trim() === '') {
      result.errors.push('Last name is required for name searches');
      return result;
    }

    // Validate last name format
    if (nameData.lastName.length < 2) {
      result.errors.push('Last name must be at least 2 characters');
      return result;
    }

    const namePattern = /^[a-zA-Z\s\-']+$/;
    if (!namePattern.test(nameData.lastName)) {
      result.errors.push('Last name contains invalid characters');
      return result;
    }

    // Validate optional fields
    if (nameData.firstName && !namePattern.test(nameData.firstName)) {
      result.errors.push('First name contains invalid characters');
      return result;
    }

    if (nameData.city && nameData.city.length < 2) {
      result.warnings.push('City name seems too short');
    }

    if (nameData.state && nameData.state.length !== 2) {
      result.warnings.push('State should be 2-letter code (e.g., NY, CA)');
    }

    // Format the data
    const formattedData = {
      firstName: nameData.firstName?.trim() || '',
      lastName: nameData.lastName.trim(),
      city: nameData.city?.trim() || '',
      state: nameData.state?.trim().toUpperCase() || ''
    };

    result.isValid = true;
    result.formattedValue = JSON.stringify(formattedData);
    result.apiFormat = JSON.stringify(formattedData);

    return result;
  }

  /**
   * Validates address for Smarty Streets API
   * Enhanced validation with proper formatting and ZIP code support
   */
  static validateAddress(addressData: { address: string; city?: string; state?: string; zipCode?: string }): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    // Validate required street address
    if (!addressData.address || addressData.address.trim() === '') {
      result.errors.push('Street address is required');
      return result;
    }

    const address = addressData.address.trim();

    // Check minimum length
    if (address.length < 5) {
      result.errors.push('Street address must contain at least street number and name');
      return result;
    }

    // Validate street number exists
    if (!/^\d/.test(address)) {
      result.errors.push('Address must start with a street number (e.g., "123 Main St")');
      return result;
    }

    // Check for PO Box (Smarty API handles but may have limited data)
    if (/P\.?O\.?\s*BOX/i.test(address)) {
      result.warnings.push('PO Box addresses may have limited residential data availability');
    }

    // Validate and format street abbreviations
    const formattedAddress = this.formatStreetAddress(address);

    // Validate state if provided
    let formattedState = '';
    if (addressData.state) {
      const state = addressData.state.trim().toUpperCase();
      if (state.length !== 2) {
        result.errors.push('State must be a valid 2-letter code (e.g., NY, CA, TX)');
        return result;
      }
      if (!this.isValidUSState(state)) {
        result.errors.push(`Invalid state code: ${state}`);
        return result;
      }
      formattedState = state;
    }

    // Validate city if provided
    let formattedCity = '';
    if (addressData.city) {
      const city = addressData.city.trim();
      if (city.length < 2) {
        result.warnings.push('City name seems too short');
      } else if (!/^[a-zA-Z\s\-'.]+$/.test(city)) {
        result.errors.push('City name contains invalid characters');
        return result;
      }
      formattedCity = this.formatCityName(city);
    }

    // Validate ZIP code if provided
    let formattedZip = '';
    if (addressData.zipCode) {
      const zipValidation = this.validateZipCode(addressData.zipCode);
      if (!zipValidation.isValid) {
        result.errors.push(...zipValidation.errors);
        return result;
      }
      formattedZip = zipValidation.formattedValue || '';
    }

    // Create Smarty Streets API compatible format
    const smartyData = {
      street: formattedAddress,
      city: formattedCity,
      state: formattedState,
      zipcode: formattedZip
    };

    // Remove empty fields for cleaner API request
    Object.keys(smartyData).forEach(key => {
      if (!smartyData[key as keyof typeof smartyData]) {
        delete smartyData[key as keyof typeof smartyData];
      }
    });

    // Add helpful warnings
    if (!formattedCity && !formattedZip) {
      result.warnings.push('Adding city or ZIP code will improve address validation accuracy');
    }
    if (!formattedState) {
      result.warnings.push('Adding state will improve address validation accuracy');
    }

    result.isValid = true;
    result.formattedValue = JSON.stringify(smartyData);
    result.apiFormat = JSON.stringify(smartyData);

    return result;
  }

  /**
   * Format street address with proper abbreviations
   */
  private static formatStreetAddress(address: string): string {
    const streetAbbreviations = {
      'street': 'St',
      'avenue': 'Ave',
      'boulevard': 'Blvd',
      'drive': 'Dr',
      'lane': 'Ln',
      'road': 'Rd',
      'circle': 'Cir',
      'court': 'Ct',
      'place': 'Pl',
      'square': 'Sq',
      'terrace': 'Ter',
      'parkway': 'Pkwy',
      'highway': 'Hwy',
      'expressway': 'Expy'
    };

    let formatted = address;
    
    // Apply standard abbreviations
    Object.entries(streetAbbreviations).forEach(([full, abbrev]) => {
      const regex = new RegExp(`\\b${full}\\b`, 'gi');
      formatted = formatted.replace(regex, abbrev);
    });

    return formatted;
  }

  /**
   * Format city name with proper capitalization
   */
  private static formatCityName(city: string): string {
    return city.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Validate ZIP code format (5-digit or 5+4 format)
   */
  private static validateZipCode(zipCode: string): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    const zip = zipCode.trim().replace(/\s+/g, '');
    
    // Check for valid ZIP code patterns
    const zip5Pattern = /^\d{5}$/;
    const zip9Pattern = /^\d{5}-\d{4}$/;
    const zip9AltPattern = /^\d{9}$/;

    if (zip5Pattern.test(zip)) {
      result.isValid = true;
      result.formattedValue = zip;
    } else if (zip9Pattern.test(zip)) {
      result.isValid = true;
      result.formattedValue = zip;
    } else if (zip9AltPattern.test(zip)) {
      result.isValid = true;
      result.formattedValue = `${zip.substring(0, 5)}-${zip.substring(5)}`;
    } else {
      result.errors.push('ZIP code must be in 5-digit (12345) or 9-digit (12345-6789) format');
    }

    return result;
  }

  /**
   * Check if state code is valid US state
   */
  private static isValidUSState(stateCode: string): boolean {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      'DC' // District of Columbia
    ];
    return validStates.includes(stateCode.toUpperCase());
  }

  /**
   * Comprehensive validation for all search types
   */
  static validateSearchRequest(searchType: string, searchQuery: any): ValidationResult {
    switch (searchType.toLowerCase()) {
      case 'phone':
        return this.validatePhoneNumber(searchQuery.phoneNumber);
      
      case 'email':
        return this.validateEmail(searchQuery.email);
      
      case 'name':
        return this.validateNameSearch(searchQuery);
      
      case 'address':
        return this.validateAddress(searchQuery);
      
      default:
        return {
          isValid: false,
          errors: [`Unknown search type: ${searchType}`],
          warnings: []
        };
    }
  }

  /**
   * Generate compliance report for debugging
   */
  static generateComplianceReport(searchType: string, searchQuery: any): string {
    const validation = this.validateSearchRequest(searchType, searchQuery);
    
    let report = `API Compliance Report for ${searchType.toUpperCase()} Search\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `Status: ${validation.isValid ? '✓ VALID' : '✗ INVALID'}\n\n`;
    
    if (validation.formattedValue) {
      report += `API Format: ${validation.apiFormat ? JSON.stringify(validation.apiFormat, null, 2) : validation.formattedValue}\n\n`;
    }
    
    if (validation.errors.length > 0) {
      report += `Errors:\n`;
      validation.errors.forEach(error => report += `  • ${error}\n`);
      report += '\n';
    }
    
    if (validation.warnings.length > 0) {
      report += `Warnings:\n`;
      validation.warnings.forEach(warning => report += `  • ${warning}\n`);
      report += '\n';
    }
    
    return report;
  }
}

// Export validation functions for use in routes
export const {
  validatePhoneNumber,
  validateEmail,
  validateNameSearch,
  validateAddress,
  validateSearchRequest,
  generateComplianceReport
} = APIComplianceChecker;