const {cli} = require('../src');

const rulesets = './samples/**/*.spectral-v6.yaml';
const tests = './samples/**/*.spectral-test.yaml';
const title = 'Validating Sample Spectral Rulesets';

cli(process.argv, title, tests, rulesets);