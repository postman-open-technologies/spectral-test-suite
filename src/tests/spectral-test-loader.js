const FileUtils = require('./file.js');
const {SpectralTestDocument} = require('./spectral-test-validator.js');

function loadTests(testFilenames) {
  const results = [];
  testFilenames.forEach(testFilename => {
      const spectralTestDocument = new SpectralTestDocument(testFilename);
      results.push(spectralTestDocument); 
  });
  return results;
}

function getValidTests(loadedTests){
  return loadedTests.filter(loadedTest => loadedTest.isValid());
}

function getInvalidSchemaTests(loadedTests){
  return loadedTests.filter(loadedTest => loadedTest.hasInvalidSchema())
    .map( test => { return { filename: test.filename, error: test.error} });
}

function getTargetingNonExistingRulesetTests(loadedTests){
  return loadedTests.filter(loadedTest => loadedTest.targetsNonExistingRuleset())
    .map( test => { return { filename: test.filename, error: test.error} });
}

// Aggregating tests by rulesey file because 
// different test documents can target the same ruleset
function aggregateRunnableTests(loadedTests) {
  let results = [];
  let validTests = getValidTests(loadedTests);
  validTests.forEach(validTest => {
    let aggregatedRunnableTest = results.find(item => item.rulesetFilename === validTest.rulesetFilename);
    if(aggregatedRunnableTest === undefined){
      aggregatedRunnableTest = { 
        rulesetFilename: validTest.rulesetFilename, 
        testFilenames: [], 
        test: validTest.document // we'll aggregate tests.rules inside a single test.rules here
      };
      results.push(aggregatedRunnableTest);
    }
    else {
      aggregatedRunnableTest.test.rules = {
        ...aggregatedRunnableTest.test.rules,
        ...validTest.document.rules
      }
    }
    aggregatedRunnableTest.testFilenames.push(validTest.filename);
  });
  return results;
}

function getTargetedByNoTestRulesets(loadedTests, rulesetFilenames) {
  const results = [];
  rulesetFilenames.forEach(rulesetFilename => {
    const testFound = loadedTests.find(loadedTest => loadedTest.rulesetFilename === rulesetFilename);
    if(testFound === undefined){
      results.push({rulesetFilename: rulesetFilename});
    }
  });
  return results;
}

function mapTestsAndRulesets(testFilenames, rulesetFilenames){
  const tests = loadTests(testFilenames);
  const results = {
    aggregateRunnableTests: aggregateRunnableTests(tests),
    targetedByNoTestRulesets: getTargetedByNoTestRulesets(tests, rulesetFilenames),
    targetingNonExistingRulesetTests: getTargetingNonExistingRulesetTests(tests),
    invalidSchemaTests: getInvalidSchemaTests(tests)
  }
  return results;
}

class SpectralTestLoader {
  // rulesetFilenamePattern is optional
  constructor(testFilenamePattern, rulesetFilenamePattern = undefined) {
    this.testFilenamePattern = testFilenamePattern;
    this.rulesetFilenamePattern = rulesetFilenamePattern;
    this.testFilenames = FileUtils.listFiles(testFilenamePattern);
    if(rulesetFilenamePattern !== undefined){
      this.rulesetFilenames = FileUtils.listFiles(rulesetFilenamePattern);
    }
    else {
      this.rulesetFilenames = [];
    }
    this.mapping = mapTestsAndRulesets(this.testFilenames, this.rulesetFilenames);
  }
  // TODO change unclear method names here and where they are used
  // Valid tests aggregated by targeted ruleset
  getAggregateRunnableTests() {
    return this.mapping.aggregateRunnableTests;
  }

  // Tests targeting non existing ruleset
  getTargetingNonExistingRulesetTests(){
    return this.mapping.targetingNonExistingRulesetTests;
  }

  // Rulesets targeted by no tests
  getTargetedByNoTestRulesets(){
    if(this.getTargetedByNoTestRulesets)
    return this.mapping.targetedByNoTestRulesets;
  }

  // Tests wth invalid schema
  getInvalidSchemaTests() {
    return this.mapping.invalidSchemaTests;
  }

  isTargetedByNoTestRulesetsDisabled(){
    return this.rulesetFilenamePattern === undefined;
  }

}

// TODO put that in some tests
// const tests = './samples/**/*.spectral-test.yaml';
//const rulesets = './samples/**/*.spectral-v6.yaml';
// const rulesets = undefined;
/*
const loader = new SpectralTestLoader(tests, rulesets);
console.log('Valid tests aggregated by targeted ruleset', loader.getAggregateRunnableTests());
console.log();
console.log('Tests wth invalid schema', loader.getInvalidSchemaTests());
console.log();
console.log('Tests targeting non existing ruleset', loader.getTargetingNonExistingRulesetTests());
console.log();
console.log('Rulesets targeted by no tests', loader.getTargetedByNoTestRulesets());
*/
exports.SpectralTestLoader = SpectralTestLoader;