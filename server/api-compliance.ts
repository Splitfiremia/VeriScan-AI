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
   * Street address is required for address searches
   */
  static validateAddress(addressData: { address: string; city?: string; state?: string }): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    if (!addressData.address || addressData.address.trim() === '') {
      result.errors.push('Street address is required');
      return result;
    }

    if (addressData.address.length < 5) {
      result.errors.push('Address seems too short');
      return result;
    }

    // Check for PO Box (some APIs don't support them)
    if (/P\.?O\.?\s*BOX/i.test(addressData.address)) {
      result.warnings.push('PO Box addresses may have limited data availability');
    }

    // Validate state format if provided
    if (addressData.state && addressData.state.length !== 2) {
      result.warnings.push('State should be 2-letter code for best results');
    }

    const formattedData = {
      address: addressData.address.trim(),
      city: addressData.city?.trim() || '',
      state: addressData.state?.trim().toUpperCase() || ''
    };

    result.isValid = true;
    result.formattedValue = JSON.stringify(formattedData);
    result.apiFormat = JSON.stringify(formattedData);

    return result;
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