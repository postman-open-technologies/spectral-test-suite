const SpectralTestRunner = require('../test-suite/spectral-test-runner');
const SpectralTestConfiguration = require('../test-suite/configuration');

const FLAGS = {
  '--tests': {
    description: 'Test files to run (don\'t forget quotes when using glob)',
    value: 'glob pattern',
    examples: ['"**/*.spectral-test.yaml"', 'info-contact.spectral-test.yaml'],
    configurations: [ 'tests']
  },
  '--rulesets': {
    description: 'Ruleset files (don\'t forget quotes when using glob)',
    value: 'glob pattern',
    examples: ['"**/*.spectral-v6.yaml"', 'ruleset.spectral-v6.yaml', '"*.spectral.js"'],
    configurations: [ 'rulesets']
  },
  '--disable-rules-completeness': {
    description: 'Disable the test ensuring all rules of all rulesets (--rulesets) are tested',
    configurations: ['disableRulesCompleteness']
  },
  '--disable-rulesets-completeness': {
    description: 'Disable the test ensuring all rulesets (--rulesets) are targeted by one test file',
    configurations: ['disableRulesetsCompleteness']
  },
  '--disable-completeness': {
    description: 'Same as --disable-rules-completeness --disable-rulesets-completeness',
    configurations: ['disableRulesetsCompleteness', 'disableRulesCompleteness']
  },
  '--disable-then-count': {
    description: 'Disable the test ensuring there are at least 2 then tests',
    configurations: ['disableThenTestCountCheck']
  },
  '--disable-given-count': {
    description: 'Disable the test ensuring there\'s at least 1 given test',
    configurations: ['disableGivenTestCountCheck']
  },
  '--disable-count': {
    description: 'Same as --disable-given-count --disable-then-count',
    configurations: ['disableGivenTestCountCheck','disableThenTestCountCheck']
  },
  '--disable-given': {
    description: 'Disable the given tests',
    configurations: ['disableGivenTest']
  },
  '--disable-then': {
    description: 'Disable the then tests',
    configurations: ['disableThenTest']
  },
  '--rule': {
    description: 'Filter tests to execute only the ones targeting a specific rule',
    value: 'rule name',
    example: ['a-rule'],
    configurations: ['rule']
  },
  '--format': {
    description: 'Filter tests to execute only the ones targeting a specific format',
    value: 'format name',
    examples: ['openapi', 'asyncapi'],
    configurations: ['format']
  },
  '--format-version': {
    description: 'Filter tests to execute only the ones targeting a specific format version',
    value: 'format version',
    examples: ["3.1", "2.6"],
    configurations: ['version']
  },
  '--title': {
    description: 'Overrides the main describe title',
    value: 'a title',
    examples: ['"My Spectral Tests"'],
    configurations: ['title']
  },
  '--silent-skip': {
    description: 'Hide skipped tests from output',
    configurations: ['silentSkip']
  },
  '--silent-skip-debug': {
    description: 'Hide skipped tests from output and shows a summary of skipped tests',
    configurations: ['silentSkip','silentSkipDebug']
  },
  '--debug-given':{
    description: 'Console.log the Spectral paths found by given tests', 
    configurations: ['debugGiven'],
  },
  '--debug-then': {
    description: 'Console.log the Spectral paths found by then tests',
    configurations: ['debugThen']
  }
}

function createConfigurationFromCommandLine(commandLineArgs, flagConfiguration) {

  const result = {};

  commandLineArgs.forEach((arg, index, args) => {
    const flag = flagConfiguration[arg];
    if(flag){
      if(flag.value){
        const value = args[index+1];
        flag.configurations.forEach(key => {
          result[key] = value;
        });
      }
      else {
        flag.configurations.forEach(key => {
          result[key] = true;
        });
      }
    }
  });

  return result;
}

function createConfiguration(commandLineArgs, defaultTitle, defaultTests, defaultRulesets){

  const commandLineConfiguration = createConfigurationFromCommandLine(commandLineArgs, FLAGS);

  if(defaultTitle && !commandLineArgs.includes('--title')){
    commandLineConfiguration.title = defaultTitle;
  }
  if(defaultTests && !commandLineArgs.includes('--tests')){
    commandLineConfiguration.tests = defaultTests;
  }
  if(defaultRulesets && !commandLineArgs.includes('--rulesets')){
    commandLineConfiguration.rulesets = defaultRulesets;
  }

  const result = SpectralTestConfiguration.getConfiguration(commandLineConfiguration);
  return result;

}

function generateFlagHelp(flag, flagConfiguration) {
  let result = '';
  result += `    ${flag}`
  if(flagConfiguration.value){
    result+= ` <${flagConfiguration.value}>`
  }
  result += '\n\n';
  result += `        ${flagConfiguration.description}`;
  result += '\n';
  if(flagConfiguration.examples){
    result += '\n        Examples:\n\n';
    flagConfiguration.examples.forEach(example => {
      result += `        ${flag} ${example}\n`
    });
  }

  return result;
}

function generateFlagsHelp(flags) {
  let result = '';
  Object.keys(flags).forEach(key => {
    result += `${generateFlagHelp(key, flags[key])}\n`;
  });
  return result;
}

function printHelp(commandLineArgs, flags){
  let result = false;
  if(commandLineArgs.includes('--args-help')){
    console.log('Spectral Test Suite arguments:');
    console.log();
    console.log(generateFlagsHelp(flags));
    result = true;
  }
  return result;
}

function runTests(commandLineArgs, defaultTitle, defaultTests, defaultRulesets){
  //const configuration = parseCommandLineArguments(commandLineArgs, defaultTitle, defaultTests, defaultRulesets);
  if(!printHelp(commandLineArgs, FLAGS)){
    const configuration = createConfiguration(commandLineArgs, defaultTitle, defaultTests, defaultRulesets);
    SpectralTestRunner.runTests(configuration);
  }
}

exports.runTests = runTests;
exports.createConfigurationFromCommandLine = createConfigurationFromCommandLine;
exports.createConfiguration = createConfiguration;