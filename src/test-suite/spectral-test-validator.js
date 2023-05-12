const Ajv2020 = require('ajv/dist/2020.js');
const fileUtils = require('../utils/file.js');
const dirname = require('path').dirname;
const fileURLToPath = require('url').fileURLToPath;
const path = require('path');
const fs = require('fs');

const DEFAULT_FORMAT = '0.1';
const SCHEMAS = {
  '0.1': '/spectral-test-validator-schemas/spectral-test-suite-v0.1.json-schema.yaml'
}

///Users/arnaud/Dev/spectral-test-suite/src/tests/spectral-test-validator-schemas/spectral-test-suite-v0.1.json-schema.yaml
///Users/arnaud/Dev/spectral-test-suite/src/tests/src/tests/spectral-test-validator-schemas/spectral-test-suite-v0.1.json-schema.yaml

function getTestSuiteSchemaFilepath(schemaFilename) {
  // TODO manage "relative filename"
  const directory = __dirname;
  const filepath = directory+'/'+schemaFilename;
  return filepath;
}

function getTestSuiteSchema(filepath) {
  // TODO manage YAML and JSON format for schemas?
  const schema = fileUtils.loadYaml(filepath);
  return schema;
}

function getRulesetAbsoluteFilename(documentFilename, document){
  const documentDirname = path.dirname(documentFilename);
  let rulesetFilename;
  if(path.isAbsolute(document.ruleset)) {
    rulesetFilename = document.ruleset;
  }
  else {
    rulesetFilename = path.join(documentDirname, document.ruleset);
  }
  rulesetFilename = path.resolve(rulesetFilename);
  return rulesetFilename;
}

function checkRulesetExist(documentFilename, document){
  const rulesetFilename = getRulesetAbsoluteFilename(documentFilename, document);
  return fs.existsSync(rulesetFilename);
}

class SpectralTestValidatorError extends Error {
  constructor(message, schemaProblems, rulesetNotFoundProblem){
    super(message);
    this.schemaProblems = schemaProblems;
    this.rulesetNotFoundProblem = rulesetNotFoundProblem;
  }
}

class SpectralTestDocumentValidator {
  constructor() {
    this.formats = [];
    for (const [formatName, schemaFilename] of Object.entries(SCHEMAS)) {
      const filepath = getTestSuiteSchemaFilepath(schemaFilename);
      const schema = getTestSuiteSchema(filepath);
      const ajv = new Ajv2020({allErrors: true}); // options can be passed, e.g. {allErrors: true}
      // validate is a function
      const validateFunction = ajv.compile(schema);
      this.formats.push({
        name: formatName,
        schema: schema,
        validate: validateFunction 
      });
    }
  }

  // TODO warning will not support concurrency, do compilation each time? Clone errors?
  validateSchema(document) {
    let formatName = document.testSuiteVersion;
    if(formatName === undefined) {
      formatName = DEFAULT_FORMAT
    }
    const format = this.formats.find(format => format.name === formatName);
    const valid = format.validate(document);
    let problems;
    if(valid) {
      problems = [];
    }
    else {
      problems = format.validate.errors;
    }
    return problems;
  }

  validateRulesetExists(documentFilename, document) {
    const valid = checkRulesetExist(documentFilename, document)
    let problem;
    if(!valid){
      problem =  {
        rulesetNotFound: getRulesetAbsoluteFilename(documentFilename, document) 
      }
    }
    return problem;
  }

  validate(documentFilename, document) {
    const schemaProblems = this.validateSchema(document);
    const rulesetNotFoundProblem = this.validateRulesetExists(documentFilename, document);
    let message;
    if(schemaProblems.length > 0 || rulesetNotFoundProblem !== undefined){
      if(schemaProblems.length > 0 && rulesetNotFoundProblem !== undefined){
        message = 'Test document is not valid against schema and targets non-existing ruleset';
      }
      else if(schemaProblems.length > 0){
        message = 'Test document is not valid against schema';
      }
      else {
        message = 'Test document targets non-existing ruleset';
      }
      throw new SpectralTestValidatorError(message, schemaProblems, rulesetNotFoundProblem);
    }
  }
}

class SpectralTestDocument {
  constructor(documentFilename){
    const document = fileUtils.loadYaml(documentFilename);
    const schemaValidatorInstance = new SpectralTestDocumentValidator();
    this.error = undefined;
    try {
      schemaValidatorInstance.validate(documentFilename, document);
    }
    catch(error){
      this.error = {
        message: error.message,
        schemaProblems: error.schemaProblems,
        rulesetNotFoundProblem: error.rulesetNotFoundProblem
      };
    }
    this.document = document;
    if(this.document.rules){
      Object.keys(this.document.rules).forEach(rulename => {
        const ruleTest = this.document.rules[rulename];
        if(ruleTest.recommended === undefined){
          ruleTest.recommended = true;
        }
      });  
    }
    this.filename = documentFilename;
    this.rulesetFilename = getRulesetAbsoluteFilename(this.filename, this.document);
  }

  isValid(){
    return this.error === undefined;
  }

  hasInvalidSchema(){
    let result = false;
    if(!this.isValid()){
      result = this.error.schemaProblems !== undefined && this.error.schemaProblems.length > 0;
    }
    return result;
  }

  targetsNonExistingRuleset(){
    let result = false;
    if(!this.isValid()){
      result = (this.error.rulesetNotFoundProblem !== undefined);
    }
    return result;
  }
}

/*
const validator = new TestSuiteValidator();
const document = fileUtils.loadYaml('./tests/specifications/openapi/info-contact.rule-test.yaml');
const problems = validator.validate(document);
console.log('problems', problems);
*/

//exports.SpectralTestDocumentValidator = SpectralTestDocumentValidator;
exports.SpectralTestDocument = SpectralTestDocument;