const assert = require('assert');
const testSuiteConfiguration = require('../../src/test-suite/configuration');

describe('configuration', function() {
  describe('getConfiguration', function() {
    it('should return default configuration if no override', function() {
      const configuration = testSuiteConfiguration.getConfiguration();
      assert.deepEqual(configuration, testSuiteConfiguration.DEFAULT_CONFIGURATION);
    });

    it('should override provided value', function() {
      const override = {
        rule: 'a-rule',
        rulesets: null,
        debugGiven: true
      }
      const configuration = testSuiteConfiguration.getConfiguration(override);
      assert.equal(configuration.rule, override.rule);
      assert.equal(configuration.rulesets, override.rulesets);
      assert.equal(configuration.debugGiven, override.debugGiven);
    });

    it('should ignore unknown override value', function() {
      const override = {
        unknow: 'value'
      }
      const configuration = testSuiteConfiguration.getConfiguration(override);
      assert.equal(configuration.hasOwnProperty('unknown'), false);
    });

  });

});