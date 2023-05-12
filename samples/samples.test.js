const SpectralTestRunner = require('../src/index.js').SpectralTestRunner;

// TODO run test for a specific rule only
//const rule = 'a-rule'; 

// Ruleset file pattern (optional)
const rulesets = './samples/**/*.spectral-v6.yaml';
// set to undefined to disable "do all rulesets file are tested" check
// const rulesets = undefined;

// Test file pattern
const tests = './samples/**/*.spectral-test.yaml';

// Title of the main mocha describe (optional)
const title = 'Validating Sample Spectral Rulesets';
// const title = undefined

SpectralTestRunner.runTests(tests, rulesets, title);



const {cli} = require('spectral-test-suite');
const title = 'Validating Spectral Guidelines'
// Unit tests only on Postman rulesets
const tests = './spectral/**/postman/**/*.spectral-test.yaml';
const rulesets = './spectral/**/postman/**/*.spectral-v6.yaml';
cli(process.argv, title, tests, rulesets);