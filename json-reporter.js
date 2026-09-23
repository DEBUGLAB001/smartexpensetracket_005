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
          
          if (testResult.status === 'passed') {
            passed++;
          } else if (testResult.status === 'failed') {
            failed++;
          }

          output[testResult.title] = {
            "Status": testResult.status,
            "Execution time": `${execTime}ms`
          };
        }
      });
    });

    if (totalBugs === 0) {
      results.testResults.forEach(testSuiteResult => {
        testSuiteResult.testResults.forEach(testResult => {
          totalBugs++;
          const execTime = testResult.duration || 0;
          totalExecutionTime += execTime;

          if (testResult.status === 'passed') {
            passed++;
          } else if (testResult.status === 'failed') {
            failed++;
          }

          output[testResult.title] = {
            "Status": testResult.status,
            "Execution time": `${execTime}ms`
          };
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
