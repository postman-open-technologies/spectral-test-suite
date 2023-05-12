const assert = require('assert');
const cliUtils = require('../../src/cli/spectral-test-cli-utils');

function testBooleanFlag(flag, configuration){
  let targets;
  if(Array.isArray(configuration)){
    targets = configuration.join(',')
  }
  else {
    targets = configuration;
  }
  it(`should set ${targets} based on ${flag} presence`, function() {
    const args = [flag]
    const result = cliUtils.createConfiguration(args);
    if(Array.isArray(configuration)){
      configuration.forEach(item => {
        assert.equal(result[item], true);
      });
    }
    else{
      assert.equal(result[configuration], true);
    }
  });
}

function testValueFlag(flag, configuration, value){
  it(`should set ${configuration} based on ${flag} value`, function() {
    const args = [flag, value]
    const result = cliUtils.createConfiguration(args);
    assert.equal(result[configuration], args[1]);
  });
}

describe('cli/spectral-test-cli-utils', function() {
  describe('createConfigurationFromCommandLine', function() {
    it('should set boolean flag', function() {
      const flagConfiguration = {
        '--disable-flag': {
          description: 'Disable something',
          configurations: ['disableFlag']
        }
      }
      const args = [ '--disable-flag'];
      result = cliUtils.createConfigurationFromCommandLine(args, flagConfiguration)
      assert.equal(result.disableFlag, true);
    });

    it('should set multiple configuration value from one flag', function() {
      const flagConfiguration = {
        '--disable-flag': {
          description: 'Disable something',
          configurations: ['disableFlag', 'disableOtherFlag']
        }
      }
      const args = [ '--disable-flag'];
      result = cliUtils.createConfigurationFromCommandLine(args, flagConfiguration)
      assert.equal(result.disableFlag, true);
      assert.equal(result.disableOtherFlag, true);
    });

    it('should set value', function() {
      const flagConfiguration = {
        '--value': {
          description: 'Set something',
          value: 'some value',
          configurations: ['value']
        }
      }
      const args = [ '--value', 'a value'];
      result = cliUtils.createConfigurationFromCommandLine(args, flagConfiguration)
      assert.equal(result.value, 'a value');
    });
  });

  describe('createConfiguration', function() {
    testValueFlag('--tests', 'tests', '**/some.tests.yaml');
    testValueFlag('--rulesets', 'rulesets', '**/some.rulesets.yaml');
    testBooleanFlag('--disable-rules-completeness', 'disableRulesCompleteness');
    testBooleanFlag('--disable-rulesets-completeness', 'disableRulesetsCompleteness');
    testBooleanFlag('--disable-completeness', ['disableRulesetsCompleteness', 'disableRulesCompleteness']);
    testBooleanFlag('--disable-then-count', 'disableThenTestCountCheck');
    testBooleanFlag('--disable-given-count', 'disableGivenTestCountCheck');
    testBooleanFlag('--disable-count', ['disableGivenTestCountCheck', 'disableThenTestCountCheck']);
    testBooleanFlag('--disable-then', 'disableThenTest');
    testBooleanFlag('--disable-given', 'disableGivenTest');
    testValueFlag('--rule', 'rule', 'a-rule');
    testValueFlag('--format', 'format', 'openapi');
    testValueFlag('--format-version', 'version', '3.1');
    testValueFlag('--title', 'title', 'Some Title');
    testBooleanFlag('--silent-skip', 'silentSkip');
    testBooleanFlag('--silent-skip-debug', ['silentSkip', 'silentSkipDebug']);
    testBooleanFlag('--debug-given', 'debugGiven');
    testBooleanFlag('--debug-then', 'debugThen');

    it('should use default title if --title is not present', function() {
      const args = []
      const defaultTitle = 'default title';
      const result = cliUtils.createConfiguration(args, defaultTitle);
      assert.equal(result.title, defaultTitle);
    });
    it('should not use default title if --title is present', function() {
      const args = ['--title', 'command line title']
      const defaultTitle = 'default title';
      const result = cliUtils.createConfiguration(args, defaultTitle);
      assert.equal(result.title, args[1]);
    });

    it('should use default tests if --tests is not present', function() {
      const args = []
      const defaultTests = 'default.tests.yaml';
      const result = cliUtils.createConfiguration(args, undefined, defaultTests);
      assert.equal(result.tests, defaultTests);
    });
    it('should not use default tests if --tests is present', function() {
      const args = ['--tests', 'command.line.yaml'];
      const defaultTests = 'default.tests.yaml';
      const result = cliUtils.createConfiguration(args, undefined, defaultTests);
      assert.equal(result.tests, args[1]);
    });

    it('should use default rulesets if --rulesets is not present', function() {
      const args = []
      const defaultRulesets = 'default.ruleset.yaml';
      const result = cliUtils.createConfiguration(args, undefined, undefined, defaultRulesets);
      assert.equal(result.rulesets, defaultRulesets);
    });
    it('should not use default rulesets if --rulesets is present', function() {
      const args = ['--rulesets', 'command.line.ruleset.yaml']
      const defaultRulesets = 'default.ruleset.yaml';
      const result = cliUtils.createConfiguration(args, undefined, undefined, defaultRulesets);
      assert.equal(result.rulesets, args[1]);
    });

  });
});