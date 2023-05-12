const { Spectral } = require('@stoplight/spectral-core');
const { undefined } = require('@stoplight/spectral-functions');

async function debugGiven(ruleset, document){
  const thenBackup = {};
  Object.keys(ruleset.rules).forEach(ruleKey => {
    const rule = ruleset.rules[ruleKey]
    thenBackup[ruleKey] = rule.then;
    rule.then = { function: undefined};
  });
  const spectral = new Spectral()
  spectral.setRuleset(ruleset);
  const spectralResult = await spectral.run(document);
  Object.keys(ruleset.rules).forEach(ruleKey => {
    const rule = ruleset.rules[ruleKey]
    rule.then = thenBackup[ruleKey];
  });
  const result = buildDebugGivenResult(spectralResult, ruleset);
  return result;
}

function buildDebugGivenResult(spectralResult, ruleset){
  const results = [];
  Object.keys(ruleset.rules).forEach(ruleKey => {
    const paths = spectralResult.filter( result => result.code === ruleKey).map( result => {
      return { path: result.path, range: result.range};
    });
    results.push({ rule: ruleKey, paths: paths });
  });
  return results;
}

exports._buildDebugGivenResult = buildDebugGivenResult;
exports.debugGiven = debugGiven;