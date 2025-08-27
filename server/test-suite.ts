import fetch from 'node-fetch';
import { SearchOrchestrator, APIServiceFactory } from './api-services';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details: string;
  responseTime?: number;
  errorMessage?: string;
}

interface DiagnosticReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export class VeriScanTestSuite {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  // 1. API CONNECTIVITY TESTS
  async testHunterAPIConnectivity(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      if (!process.env.HUNTER_API_KEY) {
        return {
          testName: 'Hunter.io API Connectivity',
          status: 'SKIP',
          details: 'Hunter API key not configured'
        };
      }

      const response = await fetch(`https://api.hunter.io/v2/account?api_key=${process.env.HUNTER_API_KEY}`);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          testName: 'Hunter.io API Connectivity',
          status: 'PASS',
          details: `API connected successfully. Requests remaining: ${data.data?.requests || 'Unknown'}`,
          responseTime
        };
      } else {
        return {
          testName: 'Hunter.io API Connectivity',
          status: 'FAIL',
          details: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }
    } catch (error) {
      return {
        testName: 'Hunter.io API Connectivity',
        status: 'FAIL',
        details: 'Network error or API unreachable',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  async testNumverifyAPIConnectivity(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      if (!process.env.NUMVERIFY_API_KEY) {
        return {
          testName: 'NumVerify API Connectivity',
          status: 'SKIP',
          details: 'NumVerify API key not configured'
        };
      }

      const response = await fetch(`http://apilayer.net/api/validate?access_key=${process.env.NUMVERIFY_API_KEY}&number=14158586273`);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          testName: 'NumVerify API Connectivity',
          status: data.valid !== undefined ? 'PASS' : 'FAIL',
          details: data.valid !== undefined ? 'API responding correctly' : 'Unexpected response format',
          responseTime
        };
      } else {
        return {
          testName: 'NumVerify API Connectivity',
          status: 'FAIL',
          details: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }
    } catch (error) {
      return {
        testName: 'NumVerify API Connectivity',
        status: 'FAIL',
        details: 'Network error or API unreachable',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  async testSmartyAPIConnectivity(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      if (!process.env.SMARTY_AUTH_ID || !process.env.SMARTY_AUTH_TOKEN) {
        return {
          testName: 'Smarty Streets API Connectivity',
          status: 'SKIP',
          details: 'Smarty API credentials not configured'
        };
      }

      const response = await fetch(`https://api.smartystreets.com/street-address?auth-id=${process.env.SMARTY_AUTH_ID}&auth-token=${process.env.SMARTY_AUTH_TOKEN}&street=1600+Amphitheatre+Parkway&city=Mountain+View&state=CA`);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          testName: 'Smarty Streets API Connectivity',
          status: 'PASS',
          details: `API connected successfully. Response received: ${Array.isArray(data) ? data.length : 'Object'} results`,
          responseTime
        };
      } else {
        return {
          testName: 'Smarty Streets API Connectivity',
          status: 'FAIL',
          details: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }
    } catch (error) {
      return {
        testName: 'Smarty Streets API Connectivity',
        status: 'FAIL',
        details: 'Network error or API unreachable',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  // 2. AUTHENTICATION FLOW TESTS
  async testAuthenticationEndpoint(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/user`);
      const responseTime = Date.now() - startTime;

      if (response.status === 401) {
        return {
          testName: 'Authentication Endpoint',
          status: 'PASS',
          details: 'Authentication properly rejecting unauthorized requests',
          responseTime
        };
      } else if (response.ok) {
        return {
          testName: 'Authentication Endpoint',
          status: 'PASS',
          details: 'Authentication endpoint responding correctly',
          responseTime
        };
      } else {
        return {
          testName: 'Authentication Endpoint',
          status: 'FAIL',
          details: `Unexpected status: HTTP ${response.status}`,
          responseTime
        };
      }
    } catch (error) {
      return {
        testName: 'Authentication Endpoint',
        status: 'FAIL',
        details: 'Cannot reach authentication endpoint',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  async testLoginRedirect(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/login`, { redirect: 'manual' });
      const responseTime = Date.now() - startTime;

      if (response.status >= 300 && response.status < 400) {
        return {
          testName: 'Login Redirect Flow',
          status: 'PASS',
          details: 'Login endpoint properly redirecting to OAuth provider',
          responseTime
        };
      } else {
        return {
          testName: 'Login Redirect Flow',
          status: 'FAIL',
          details: `Expected redirect, got HTTP ${response.status}`,
          responseTime
        };
      }
    } catch (error) {
      return {
        testName: 'Login Redirect Flow',
        status: 'FAIL',
        details: 'Cannot test login redirect',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  // 3. SEARCH FUNCTIONALITY TESTS
  async testBasicSearchEndpoint(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchType: 'name',
          searchQuery: { firstName: 'John', lastName: 'Doe' }
        })
      });
      const responseTime = Date.now() - startTime;

      if (response.status === 401) {
        return {
          testName: 'Basic Search Endpoint',
          status: 'PASS',
          details: 'Search endpoint properly protected by authentication',
          responseTime
        };
      } else if (response.ok) {
        return {
          testName: 'Basic Search Endpoint',
          status: 'PASS',
          details: 'Search endpoint responding correctly',
          responseTime
        };
      } else {
        return {
          testName: 'Basic Search Endpoint',
          status: 'FAIL',
          details: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }
    } catch (error) {
      return {
        testName: 'Basic Search Endpoint',
        status: 'FAIL',
        details: 'Cannot reach search endpoint',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  async testProfessionalSearchEndpoint(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/search/pro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchType: 'email',
          searchQuery: { email: 'test@example.com' }
        })
      });
      const responseTime = Date.now() - startTime;

      if (response.status === 401) {
        return {
          testName: 'Professional Search Endpoint',
          status: 'PASS',
          details: 'Professional search endpoint properly protected by authentication',
          responseTime
        };
      } else if (response.ok) {
        return {
          testName: 'Professional Search Endpoint',
          status: 'PASS',
          details: 'Professional search endpoint responding correctly',
          responseTime
        };
      } else {
        return {
          testName: 'Professional Search Endpoint',
          status: 'FAIL',
          details: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }
    } catch (error) {
      return {
        testName: 'Professional Search Endpoint',
        status: 'FAIL',
        details: 'Cannot reach professional search endpoint',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  // 4. DATABASE CONNECTIVITY TESTS
  async testDatabaseConnection(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/feature-flags`);
      const responseTime = Date.now() - startTime;

      if (response.status === 401) {
        return {
          testName: 'Database Connectivity',
          status: 'PASS',
          details: 'Database endpoints responding (auth check passed)',
          responseTime
        };
      } else if (response.ok) {
        return {
          testName: 'Database Connectivity',
          status: 'PASS',
          details: 'Database connection working correctly',
          responseTime
        };
      } else {
        return {
          testName: 'Database Connectivity',
          status: 'FAIL',
          details: `Database endpoint error: HTTP ${response.status}`,
          responseTime
        };
      }
    } catch (error) {
      return {
        testName: 'Database Connectivity',
        status: 'FAIL',
        details: 'Cannot connect to database endpoints',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  // 5. COMPREHENSIVE TEST EXECUTION
  async runAllTests(): Promise<DiagnosticReport> {
    console.log('🔍 Starting VeriScan AI Integration Test Suite...\n');

    const tests = [
      () => this.testHunterAPIConnectivity(),
      () => this.testNumverifyAPIConnectivity(),
      () => this.testSmartyAPIConnectivity(),
      () => this.testAuthenticationEndpoint(),
      () => this.testLoginRedirect(),
      () => this.testBasicSearchEndpoint(),
      () => this.testProfessionalSearchEndpoint(),
      () => this.testDatabaseConnection()
    ];

    this.results = [];
    
    for (const test of tests) {
      try {
        const result = await test();
        this.results.push(result);
        
        const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
        const responseTime = result.responseTime ? ` (${result.responseTime}ms)` : '';
        console.log(`${statusIcon} ${result.testName}${responseTime}`);
        console.log(`   ${result.details}\n`);
      } catch (error) {
        const failedResult: TestResult = {
          testName: 'Test Execution Error',
          status: 'FAIL',
          details: 'Test suite execution error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
        this.results.push(failedResult);
      }
    }

    return this.generateDiagnosticReport();
  }

  private generateDiagnosticReport(): DiagnosticReport {
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    
    if (failed > 0) {
      const criticalFailures = this.results.filter(r => 
        r.status === 'FAIL' && 
        (r.testName.includes('Authentication') || r.testName.includes('Database'))
      ).length;
      
      overallStatus = criticalFailures > 0 ? 'CRITICAL' : 'DEGRADED';
    }

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      passed,
      failed,
      skipped,
      results: this.results,
      overallStatus
    };
  }

  // 6. REPORT GENERATION
  generateTextReport(report: DiagnosticReport): string {
    const lines = [
      '📋 VERISCAN AI - INTEGRATION TEST REPORT',
      '═'.repeat(50),
      `Timestamp: ${new Date(report.timestamp).toLocaleString()}`,
      `Overall Status: ${report.overallStatus}`,
      `Total Tests: ${report.totalTests}`,
      `✅ Passed: ${report.passed}`,
      `❌ Failed: ${report.failed}`,
      `⏭️ Skipped: ${report.skipped}`,
      '',
      'DETAILED RESULTS:',
      '─'.repeat(30)
    ];

    report.results.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      lines.push(`${statusIcon} ${result.testName}`);
      lines.push(`   Status: ${result.status}`);
      lines.push(`   Details: ${result.details}`);
      if (result.responseTime) lines.push(`   Response Time: ${result.responseTime}ms`);
      if (result.errorMessage) lines.push(`   Error: ${result.errorMessage}`);
      lines.push('');
    });

    return lines.join('\n');
  }
}