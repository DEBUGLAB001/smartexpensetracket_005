class JsonReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const output = {};
    let totalBugs = 0;
    let passed = 0;
    let failed = 0;
    let totalExecutionTime = 0;

    results.testResults.forEach(testSuiteResult => {
      testSuiteResult.testResults.forEach(testResult => {
        if (testResult.title.startsWith('Bug ')) {
          totalBugs++;
          const execTime = testResult.duration || 0;
          totalExecutionTime += execTime;
          
          if (testResult.status === 'failed') {
            failed++;
            output[testResult.title] = {
              "Status": "failed",
              "Execution time": `${execTime}ms`
            };
          } else if (testResult.status === 'passed') {
            passed++;
            // The prompt didn't explicitly include passed bugs in the example dictionary, 
            // but we can include them or just ignore. The example only showed failed ones.
          }
        }
      });
    });

    // If there are no tests specifically named "Bug ...", we might just want to report failed tests.
    // Let's also handle normal failed tests in case we want to catch all of them.
    if (totalBugs === 0) {
      results.testResults.forEach(testSuiteResult => {
        testSuiteResult.testResults.forEach(testResult => {
          if (testResult.status === 'failed') {
            failed++;
            const execTime = testResult.duration || 0;
            totalExecutionTime += execTime;
            output[testResult.title] = {
              "Status": "failed",
              "Execution time": `${execTime}ms`
            };
          } else if (testResult.status === 'passed') {
            passed++;
          }
          totalBugs++;
        });
      });
    }

    output["Total bugs"] = totalBugs;
    output["Passed"] = passed;
    output["Failed"] = failed;
    output["Total Execution time"] = `${totalExecutionTime}ms`;

    console.log(JSON.stringify(output, null, 2));
  }
}

module.exports = JsonReporter;
