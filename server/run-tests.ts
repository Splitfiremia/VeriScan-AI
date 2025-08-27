import { VeriScanTestSuite } from './test-suite';

async function main() {
  const testSuite = new VeriScanTestSuite();
  
  console.log('🚀 Initializing VeriScan AI Integration Test Suite\n');
  
  try {
    const report = await testSuite.runAllTests();
    
    console.log('📊 FINAL REPORT:');
    console.log('═'.repeat(50));
    console.log(`Overall Status: ${report.overallStatus}`);
    console.log(`Tests: ${report.passed}/${report.totalTests} passed`);
    
    if (report.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      report.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`   • ${r.testName}: ${r.details}`);
          if (r.errorMessage) console.log(`     Error: ${r.errorMessage}`);
        });
    }

    if (report.skipped > 0) {
      console.log('\n⏭️ SKIPPED TESTS:');
      report.results
        .filter(r => r.status === 'SKIP')
        .forEach(r => console.log(`   • ${r.testName}: ${r.details}`));
    }

    console.log('\n📋 Full Text Report:');
    console.log(testSuite.generateTextReport(report));

    process.exit(report.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Test suite failed to run:', error);
    process.exit(1);
  }
}

main();