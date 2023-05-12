const DEFAULT_CONFIGURATION = {
  disableRulesetsCompleteness: false,
  disableRulesCompleteness: false,
  disableGivenTestCountCheck: false,
  disableThenTestCountCheck: false,
  disableGivenTest: false,
  disableThenTest: false, 
  rulesets: '**/*.spectral-v6.yaml',
  tests: '**//*.spectral-test.yaml',
  title: 'Validating Spectral Rulesets',
  rule: undefined,
  version: undefined,
  format: undefined,
  silentSkip: false,
  silentSkipDebug: false,
  debugGiven: false,
  debugThen: false
}

const AUTHORIZED_CONFIGURATION_KEYS = Object.keys(DEFAULT_CONFIGURATION);

function getConfiguration(override={}){
  const result = structuredClone(DEFAULT_CONFIGURATION);
  Object.keys(override).forEach( key => {
    if(AUTHORIZED_CONFIGURATION_KEYS.includes(key)){
      result[key] = override[key];
    }
  });
  return result;
}

function isTestConfiguration(key){
  const strings = ['version', 'format', 'rule'];
  const result = key.startsWith('disable') || strings.includes(key);
  return result;
}

function isTestSkipped(configuration, key){
  let result = false;
  if(key.startsWith('disable')){
    result = configuration[key];
  }
  else {
    result = configuration[key] !== undefined;
  }
  return result;
}

function listSkippedTests(configuration){
  const result = [];
  Object.keys(configuration).forEach( key => {
    if(isTestConfiguration(key) && isTestSkipped(configuration, key)){
      if(key.startsWith('disable')){
        result.push(key.split(/(?=[A-Z])/).join(' ').toLowerCase());
      }
      else {
        result.push(`filter ${key} (${configuration[key]})`);
      }
    }
  });
  return result;
}

function debugSkippedTests(configuration) {
  const skippedTests = listSkippedTests(configuration);
  if(skippedTests.length > 0 && configuration.silentSkipDebug === true){
    describe('⚠️  Some tests have been skipped silently', function() {
      skippedTests.forEach(test => {
        it(test, function() {});
      });
    });
  }
}

exports.getConfiguration = getConfiguration;
exports.DEFAULT_CONFIGURATION = DEFAULT_CONFIGURATION;
exports.debugSkippedTests = debugSkippedTests;