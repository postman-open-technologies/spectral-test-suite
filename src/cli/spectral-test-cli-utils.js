const SpectralTestRunner = require('../tests/spectral-test-runner');

function parseCommandLineArguments(commandLineArgs, defaultTitle, defaultTests, defaultRulesets){

  let title;
  if(defaultTitle){
    title = defaultTitle;
  }
  else {
    title = 'Validating Spectral Rulesets';
  }
  let tests = defaultTests;
  let rulesets = defaultRulesets;
  let disableRulesCompleteness = false;
  let disableRulesetsCompleteness = false;
  let rule = undefined;
  let disableGivenTestCountCheck = false;
  let disableThenTestCountCheck = false;
  let disableGivenTest = false;
  let disableThenTest = false;
  let version = undefined;
  let silentSkip = false;
  commandLineArgs.forEach((arg, index, args) => {
    if(arg === '--tests'){
      tests = args[index+1];
    }
    else if(arg === '--rulesets'){
      rulesets = args[index+1];
    }
    else if(arg === '--disable-rules-completeness'){
      disableRulesCompleteness = true;
    }
    else if(arg === '--disable-rulesets-completeness'){
      disableRulesetsCompleteness = true;
    }
    else if(arg === '--disable-then-count'){
      disableGivenTestCountCheck = true;
    }
    else if(arg === '--disable-given-count'){
      disableThenTestCountCheck = true;
    }
    else if(arg === '--disable-given-then-count'){
      disableGivenTestCountCheck = true;
      disableThenTestCountCheck = true;
    }
    else if(arg === '--disable-then'){
      disableGivenTest = true;
    }
    else if(arg === '--disable-given'){
      disableThenTest = true;
    }
    else if(arg === '--rule'){
      rule = args[index+1];
    }
    else if(arg === '--format-version'){
      version = args[index+1];
    }
    else if(arg === '--title'){
      title = args[index+1];
    }
    else if(arg === '--silent-skip'){
      silentSkip = true;
    }
  });
  
  const result = {
    disableRulesetsCompleteness: disableRulesetsCompleteness,
    disableRulesCompleteness: disableRulesCompleteness,
    disableGivenTestCountCheck: disableGivenTestCountCheck,
    disableThenTestCountCheck: disableThenTestCountCheck,
    disableGivenTest: disableGivenTest,
    disableThenTest: disableThenTest, 
    rulesets: rulesets,
    tests: tests,
    title: title,
    rule: rule,
    version: version,
    silentSkip: silentSkip
  }
  console.log(result)
  return result;
}

function runTests(commandLineArgs, defaultTitle, defaultTests, defaultRulesets){
  const configuration = parseCommandLineArguments(commandLineArgs, defaultTitle, defaultTests, defaultRulesets);
  SpectralTestRunner.runTests(configuration.tests, configuration.rulesets, configuration.title, configuration);
}

exports.runTests = runTests;