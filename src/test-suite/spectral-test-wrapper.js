// To get absolute path required by Spectral bundler
const resolve = require('path').resolve;
// Spectral
const spectralCore = require('@stoplight/spectral-core');
const { Spectral, Document } = spectralCore;
const bundleAndLoadRuleset = require('@stoplight/spectral-ruleset-bundler/with-loader').bundleAndLoadRuleset;
const spectralUtils = require('./spectral-utils');

const fs = require('fs');
const spectralRuntime = require('@stoplight/spectral-runtime');
const { fetch } = spectralRuntime;
const Parsers = require('@stoplight/spectral-parsers'); // make sure to install the package if you intend to use default parsers!

const spectralDebugger = require('./spectral-debugger');

function spectralPathToJsonPointer(path){
  const escapedPath = path.map(value => value.replaceAll('/','~1'));
  const jsonPointer = `#/${escapedPath.join('/')}`;
  return jsonPointer;
}

class SpectralTestWrapper {

  constructor() {}

  async initialize(rulesetFilename){
    this.absolutePath = resolve(rulesetFilename);
    //this.rulesetRaw = fileUtils.loadYaml(this.absolutePath);
    const ruleset = await bundleAndLoadRuleset(this.absolutePath, { fs, fetch });
    this.rulesetLoaded = ruleset;
    // Enable non recommended rules
    Object.keys(this.rulesetLoaded.rules).forEach(rulename => {
      if(this.rulesetLoaded.rules[rulename].enabled === false){
        this.rulesetLoaded.rules[rulename].enabled = true;
      }
    })
    this.spectral = new Spectral();
    this.spectral.setRuleset(ruleset);
  }

  // Constructor can't be async so doing this
  static async getWrapper(rulesetFilename) {
    const wrapper = await new SpectralTestWrapper();
    await wrapper.initialize(rulesetFilename);
    return wrapper;
  }


  getRuleDefinition(rulename) {
    return this.spectral.ruleset.rules[rulename].definition;
  }

  getRawRuleDefinition(rulename) {
    return this.rulesetRaw.rules[rulename];
  }

  getRuleNames() {
    return Object.keys(this.spectral.ruleset.rules);
  }


  /*********************/
  /* JSON Path Methods */
  /*********************/

  getRuleGivens(rulename) {
    const rule = this.getRuleDefinition(rulename);
    let givens;
    if(Array.isArray(rule.given)) {
      givens = rule.given;
    }
    else {
      givens = [rule.given];
    }
    return givens;  
  }
  
  getRuleGiven(rulename, index=0) {
    return this.getRuleGivens(rulename)[index];
  }

  // TODO handle aliases by hacking Spectral inner code/functions or running a dummy rule with then.function: undefined
  // TODO Add given to result?
  getGivenPathsAndValues(rulename, document, givenIndex=null) {
    if(givenIndex !== null) { // keeping old behavior just in case
      const given = this.getRuleGiven(rulename, givenIndex);
      const results = JSONPath({ resultType: 'all', path: given, json: document });
      const pathsAndValues = results.map( result => ({ path: `#${result.pointer}`, value: result.value}));
      return pathsAndValues;
    }
    else {
      let pathsAndValues = [];
      this.getRuleGivens(rulename).forEach(given => {
        const jsonPathResults = JSONPath({ resultType: 'all', path: given, json: document });
        const givenResults = jsonPathResults.map( result => ({ path: `#${result.pointer}`, value: result.value}))
        pathsAndValues = pathsAndValues.concat(givenResults);
      });
      return pathsAndValues;
    }
  }

  async getGivenPaths(rulename, document) {
    const runGivenResults = await spectralDebugger.debugGiven(this.rulesetLoaded, document);
    // TODO disable all rules expect the one to test
    const ruleResult = runGivenResults.find( result => result.rule === rulename);
    const paths = ruleResult.paths.map( item => {return item.path});
    return paths;
  }

  /*******************/
  /* Linting Methods */
  /*******************/

  static getSpectralDocument(json, name) {
    const jsonAsString = JSON.stringify(json, null, 2);
    const document = new Document(
      jsonAsString,
      Parsers.Json,
      name,
    );
    return document
  }

  async lint(rulename, documentJson, documentName) {
    // TODO disable all rule except rulename
    // TODO enable a single then testing with a thenIndex optional argument
    const document = SpectralTestWrapper.getSpectralDocument(documentJson, documentName);
    const problems = await this.spectral.run(document);
    const simplifiedProblems = problems
                                  .filter(problem => (problem.code === rulename))
                                  //.map(problem => ({ path: spectralPathToJsonPointer(problem.path)}));
                                  .map(problem => problem.path);
    return simplifiedProblems;
  }

  /* Severity */
  getRuleSeverity(rulename){
    // Depending on how the rule is loaded, definition severity is a number or a string
    const severity = this.getRuleDefinition(rulename).severity;
    const result = spectralUtils.getHumanReadableSeverity(severity);
    return result;
  }


  /* Recommended */
  getRuleRecommended(rulename){
    let result = this.getRuleDefinition(rulename).recommended;
    if(result === undefined){
      result = true;
    }
    return result;
  }

  /* Format and Versions of spec targeted */
  // TODO do not take for granted that a rule works on a single format
  getRuleFormatAndVersions(rulename){
    const rule = this.getRuleDefinition(rulename);
    const formats = {
      // OpenAPI
      'oas2':   { format: 'openapi', versions: [ '2.0' ] },
      'oas3':   { format: 'openapi', versions: [ '3.0', '3.1' ]},
      'oas3_0': { format: 'openapi', versions: [ '3.0'] },
      'oas3_1': { format: 'openapi', versions: [ '3.1' ]},
      // AsyncAPI
      'aas2':   { format: 'asyncapi', versions: [ '2.0', '2.1', '2.2', '2.2', '2.3', '2.4', '2.5', '2.6' ] },
      'aas2_0': { format: 'asyncapi', versions: [ '2.0' ] },
      'aas2_1': { format: 'asyncapi', versions: [ '2.1' ] },
      'aas2_2': { format: 'asyncapi', versions: [ '2.2' ] },
      'aas2_3': { format: 'asyncapi', versions: [ '2.3' ] },
      'aas2_4': { format: 'asyncapi', versions: [ '2.4' ] },
      'aas2_5': { format: 'asyncapi', versions: [ '2.5' ] },
      'aas2_6': { format: 'asyncapi', versions: [ '2.6' ] },
    }
    let format;
    let versions = []
    if(rule.formats){
      spectralUtils.getHumanReadableFormats(rule.formats).forEach(item => {
        format = formats[item].format;
        versions = Array.from(new Set(versions.concat(formats[item].versions))); 
      });
    }
    const result = {
      format: format,
      versions: versions
    };
    return result;
  }

}

exports.SpectralTestWrapper = SpectralTestWrapper;