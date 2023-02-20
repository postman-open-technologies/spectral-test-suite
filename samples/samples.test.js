import * as SpectralTestRunner from '../src/tests/spectral-test-runner.js';

// TODO run test for a specific rule only
// Optional --rule=a-rule-name parameter to test only one rule instead of all
//const rule = process.env.npm_config_rule; 

// const rulesets =  '**/*.spectral-v6.yaml'
// const rulesets = process.env.npm_config_rulesets; 
const rulesets = './samples/**/*.spectral-v6.yaml';

//const tests = '**/*.spectral-test.yaml'
//const tests = process.env.npm_config_tests; 
const tests = 'samples/**/*.spectral-test.yaml';

const title = 'Validating Spectral Rules'

SpectralTestRunner.runTests(tests, rulesets, title);