const { Spectral } = require('@stoplight/spectral-core');
const { undefined } = require('@stoplight/spectral-functions');

const bundleAndLoadRuleset = require('@stoplight/spectral-ruleset-bundler/with-loader').bundleAndLoadRuleset;

function duplicateRulesetWithoutRules(ruleset){
  // To keep aliases and other settings
  const result = { rules : {}};
  Object.keys(ruleset)
      .filter(rulesetKey => rulesetKey !== 'rules')
      .forEach(rulesetKey => {
          ruleset[rulesetKey] = structuredClone(ruleset[rulesetKey]);
  });
  return result;
}

function getRuleGivenArray(rule){
  let givens;
  if(Array.isArray(rule.given)){
    givens = rule.given;
  }
  else{
    givens = [rule.given];
  }
  return givens;
}

function initGivensResults(originalRuleset){
  const results = [];
  Object.keys(originalRuleset.rules).forEach(ruleKey => {
    const result = { rule: ruleKey, given: [] };
    const givens = getRuleGivenArray(originalRuleset.rules[ruleKey]);
    givens.forEach(given => {
      result.given.push({ given: given, paths: []});
    });
    results.push(result);
  });
  return results;
}

function addGivenResults(results, spectralResult){
  const regex = /(?<rule>.+)_(?<givenIndex>\d+)/
  const match = spectralResult.code.match(regex);
  if(match){
    const rule = match.groups.rule;
    const givenIndex = match.groups.givenIndex;
    const ruleResult = results.find(result => result.rule === rule);
    // TODO get value from document?
    ruleResult.given[givenIndex].paths.push({
      path: spectralResult.path,
      range: spectralResult.range,
    });
    return ruleResult;
  }
}

function buildRunGivensResult(spectralResults, originalRuleset){
  const results = initGivensResults(originalRuleset);
  spectralResults.forEach(spectralResult => {
    addGivenResults(results, spectralResult);
  });
  return results;
}

function buildGivensDebugRuleset(ruleset){
  const givensDebugRuleset = duplicateRulesetWithoutRules(ruleset);
  Object.keys(ruleset.rules).forEach( ruleKey => {
    const rule = ruleset.rules[ruleKey]
    const givens = getRuleGivenArray(rule);
    givens.forEach( (given,index) => {
      const rulegivenKey = `${ruleKey}_${index}`;
      givensDebugRuleset.rules[rulegivenKey] = {
        given: given,
        then: {
          function: undefined
        }
      }
    });
  });
  return givensDebugRuleset;
}

async function runGivens(document, ruleset){
  const givensDebugRuleset = buildGivensDebugRuleset(ruleset);
  const spectral = new Spectral();
  spectral.setRuleset(givensDebugRuleset);
  const spectralResults = await spectral.run(document);
  const debugResults = buildRunGivensResult(spectralResults, ruleset);
  return debugResults;
}

function getAliasNames(ruleset){
  const results = [];
  if(ruleset.aliases){
    results = Object.keys(ruleset.aliases);
  }
  return results;
}

function buildAliasesDebugRuleset(ruleset){
  const result = duplicateRulesetWithoutRules(ruleset);
  const aliasNames = getAliasNames(ruleset);
  aliasNames.forEach( aliasName => {
    // specific key to avoid later collision when running everything (alias, given, rules) in one shot
    const ruleKey = `debug_alias_${aliasName}`;
    givensDebugRuleset.rules[ruleKey] = {
      given: `#${aliasName}`,
      then: {
        function: undefined
      }
    }
  });
  return result;
}

function initAliasResults(originalRuleset){
  const results = [];
  const aliases = getAliasNames(originalRuleset);
  aliases.forEach(aliasName => {
    const result = { alias: aliasName, paths: [] }
    results.push(result);
  });
  return results;
}

function addAliasResults(results, spectralResult){
  const regex = /^debug_alias_(?<aliasName>.+)$/;
  const match = spectralResult.code.match(regex);
  const aliasName = match.groups.aliasName;
  const ruleResult = results.find(result => result.alias === aliasName);
  // TODO get value from document?
  ruleResult.paths.push({
    path: spectralResult.path,
    range: spectralResult.range,
  });
  return ruleResult;
}

function buildRunAliasesResult(spectralResults, originalRuleset){
  const results = initAliasResults(originalRuleset);
  spectralResults.forEach(spectralResult => {
    addAliasResults(results, spectralResult);
  });
  return results;
}

// TODO: Finalize and test (with underlying functions)
async function runAliases(document, ruleset){
  const aliasesDebugRuleset = buildAliasesDebugRuleset(ruleset);
  const spectral = new Spectral();
  spectral.setRuleset(aliasesDebugRuleset);
  const spectralResults = await spectral.run(document);
  const debugResults = buildRunAliasesResult(spectralResults, ruleset);
  return debugResults;
}

exports._getRuleGivenArray = getRuleGivenArray;
exports._buildGivensDebugRuleset = buildGivensDebugRuleset;
exports._initGivensResults = initGivensResults;
exports._addGivenResults = addGivenResults;
exports.runGivens = runGivens;