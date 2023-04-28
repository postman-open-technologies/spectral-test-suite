const assert = require('assert');
const SpectralTestLoader = require('./spectral-test-loader.js').SpectralTestLoader;
const SpectralTestWrapper = require('./spectral-test-wrapper.js').SpectralTestWrapper;
const SpectralTest = require('./spectral-test.js');
const pathUtils = require('./path-utils');
const DocumentValidator = require('./test-document-validator.js').DocumentValidator;

function sortAgainstPath(values){
  return values.sort((a,b) => {
    let result;
    if(a.path < b.path){
      result = -1;
    }
    else if(b.path < a.path){
      result = 1
    }
    else {
      result = 0;
    }
    return result;
  });
}

const defaultConfiguration = {
  disableRulesetsCompleteness: false,
  disableRulesCompleteness: false,
  disableGivenTestCountCheck: false,
  disableThenTestCountCheck: false,
  disableGivenTest: false,
  disableThenTest: false, 
  silentSkip: false,
  rule: undefined,
  version: undefined
}

function skippedTests(configuration){
  let skipped = false;
  Object.keys(configuration).forEach( key => {
    if(key.startsWith('disable')){
      skipped = skipped || configuration[key];
      console.log(key, configuration[key], skipped)
    }
    else if(key === 'rule' || 'version') {
      skipped = skipped || (configuration[key] !== undefined);
    }
  })
  return skipped
}

function runTests(tests, rulesets, title='Validating Spectral Rulesets', configuration = defaultConfiguration){

  describe(title, function() {
    // 1 - Loading test and rule files and mapping them
    // TODO: Need to add mapping control, all ruleset have test files, all test files have ruleset
    // Some try/catch hecks to add here about no test founds
    //const mappedTestsRulesets = mapTestsAndRulesets('**/*.rule-test.yaml', '**/*.spectral-v6.yaml');
    //const mappedTestsRulesets = SpectralTestLoader.mapTestsAndRulesets(tests, rulesets);
    //const mapper = new SpectralTestLoader.SpectralTestMapper(tests, rulesets);
    const testLoader = new SpectralTestLoader(tests, rulesets);
  
    describe(`🔬 Checking test documents (${testLoader.testFilenamePattern}) are valid`, function() {
      it('must have found and aggregated runnable tests', function() {
        assert.equal(testLoader.getAggregateRunnableTests().length>0, true, 'No runnable tests found');
      });
  
      it('must find no test invalid against schema', function() {
        assert.deepEqual(testLoader.getInvalidSchemaTests(), [], 'Found some tests which are not valid against schema');
      });

      it('must find no test targeting non-existing ruleset files', function() {
        assert.deepEqual(testLoader.getTargetingNonExistingRulesetTests(), [], 'Found some tests targeting non-existing ruleset files');
      });
  
    });
  
    let rulesetCheckMessage;
    if(testLoader.isTargetedByNoTestRulesetsDisabled()){
      rulesetCheckMessage = '⚠️  Checking all rulesets are targeted by at least one test document is disabled (no ruleset file pattern provided)'
    }
    else if(configuration.disableRulesetsCompleteness){
      rulesetCheckMessage = '⚠️  Checking all rulesets are targeted by at least one test document is disabled (configuration)'
    }
    else {
      rulesetCheckMessage = `🔬 Checking all rulesets (${testLoader.rulesetFilenamePattern}) are targeted by at least one test document`
    }

    describe(rulesetCheckMessage, function() {
      if(testLoader.isTargetedByNoTestRulesetsDisabled()){
        if(!configuration.silentSkip) {
          it.skip('must not find ruleset not targeted by any test (disabled)', function() {});
        }
      }
      else {
        it('must not find ruleset not targeted by any test', function() {
          assert.deepEqual(testLoader.getTargetedByNoTestRulesets(), [], 'Some rulesets don\'t have test suites');
        });
      }
    });

    // 2 - Looping on (ruleset/testfile)
    testLoader.getAggregateRunnableTests().forEach(rulesetTest => {
      let spectralWrapper;
      let spectralWrapperError;
  
      // 3 - Initializing Spectral with ruleset indicated in test file (that's async!)
      before( async function() {
        // TODO when invalid ruleset it crash everything, need to catch error
        try {
          spectralWrapper = await SpectralTestWrapper.getWrapper(rulesetTest.rulesetFilename);
        }
        catch(e){
          spectralWrapperError = e;
          console.log('error', e);
          //fail(e);
        }

      });
  
      describe('🤖 Checking Spectral Wrapper has been loaded', function(){
        it('no error when loading ruleset with Spectral', function() {
          assert.equal(spectralWrapperError, undefined, 'error when loading');
        });
      })

      // 4 - Testing the ruleset
      describe(`🗂  Testing ruleset ${rulesetTest.test.ruleset}`, function() {
        // x - Checking testsuite content
        let rulesetCompletenessCheckMessage;
        if(configuration.disableRulesCompleteness){
          rulesetCompletenessCheckMessage = '⚠️  Checking ruleset tests completeness disabled'
        }
        else {
          rulesetCompletenessCheckMessage = '🔬 Checking ruleset tests completeness';
        }
        
        describe(rulesetCompletenessCheckMessage, function() {
          if(configuration.disableRulesCompleteness){
            if(!configuration.silentSkip) {
              it.skip('⚠️ all rules of ruleset must have tests (disabled)', function() {});
            }
          }
          else {
            it('all rules of ruleset must have tests', function() {
              // TODO put test loader stuff in a class
              const testedRules = SpectralTest.getRuleNames(rulesetTest.test).sort();
              const rulesetRules = spectralWrapper.getRuleNames().sort();
              const nonTestedRules = rulesetRules.filter(rulesetRule => !testedRules.includes(rulesetRule));
              assert.deepEqual(nonTestedRules, [], 'some rules are not tested');
            });
          }

        });
  
        // 5 - Looping on rule test in ruleset test
        for (const [rulename, ruleTest] of Object.entries(rulesetTest.test.rules)){
          if(configuration.rule !== undefined && configuration.rule !== rulename){
            if(!configuration.silentSkip) {
              describe(`⚠️ Testing rule [${rulename}] disabled`, function() {});  
            }
          }
          else {
            describe(`📏 Testing rule [${rulename}]`, function() {
              // TODO add checks on given and then content (checking coverage is enough)
              let documentValidator;
    
              before(async function() {
                documentValidator = await DocumentValidator.getValidator(ruleTest.format);
              });
    
              // 6 - Testing formats
              const formatsString = `${ruleTest.format} [${ruleTest.versions.join(',')}]`; 
              it(`must target format(s) ${formatsString}`, function() {
                const foundFormatVersions = spectralWrapper.getRuleFormatAndVersions(rulename);
                const expectedVersions = ruleTest.versions;
                const expectedFormat = ruleTest.format;
                assert.deepEqual(foundFormatVersions.format, expectedFormat, 'Wrong format found');
                assert.deepEqual(foundFormatVersions.versions, expectedVersions, 'Wrong format version(s) found');
              });
              // 7 - Testing severity
              it(`must have severity ${ruleTest.severity}`, function() {
                const foundSeverity = spectralWrapper.getRuleSeverity(rulename);
                const expectedSeverity = ruleTest.severity;
                assert.equal(foundSeverity, expectedSeverity);
              });
              it(`must be recommended ${ruleTest.recommended}`, function() {
                const foundRecommended = spectralWrapper.getRuleRecommended(rulename);
                const expectedRecommended = ruleTest.recommended;
                assert.equal(foundRecommended, expectedRecommended);
              });
              // 8 - Testing given
              describe(`Testing rule ${rulename} given`, function() {
                if(configuration.disableGivenTestCountCheck){
                  if(!configuration.silentSkip) {
                    it.skip('⚠️ should have at least one given test (disabled)', function() {});
                  }
                }
                else {
                  it('should have at least one given test', function() {
                    assert.notEqual(ruleTest.given.length, 0, 'There must be at least one given test (to check elements are found)');
                  });
                }

                ruleTest.given.forEach(givenTest => {
                  const documents = SpectralTest.getAllVersionsOfDocument(givenTest, ruleTest);
                  documents.forEach(document => {
                    if(configuration.version !== undefined && configuration.version !== document.version){
                      if(!configuration.silentSkip) {
                        it.skip(`${givenTest.description} (${ruleTest.format} ${document.version})`, function() {});
                      }
                    }
                    else {
                      it(`${givenTest.description} (${ruleTest.format} ${document.version})`, async function() {
      
                        // 8.1 Checking test document is valid
                        const formatFoundProblems = await documentValidator.validate(document.document);
                        const formatExpectedProblems = [];
                        assert.deepEqual(formatFoundProblems, formatExpectedProblems, `test document is not a valid ${ruleTest.format} document`);
      
                        // 8.2 Checking what is found by given paths (JSON Path or aliases or aliases+JSON path)
                        const foundPaths = await spectralWrapper.getGivenPaths(rulename, document.document);
                        foundPaths.sort();

                        const expectedPaths = pathUtils.givenExpectedToSpectralPaths(givenTest.expected).sort();
                        assert.deepEqual(foundPaths, expectedPaths, 'found paths do not match expected ones');
                      });
                    }
                  });
                });
              });
              // 9 - Testing then
              describe(`Testing rule ${rulename} then`, function() {
                if(configuration.disableThenTestCountCheck){
                  if(!configuration.silentSkip) {
                    it.skip('⚠️ should have at least two then tests (disabled)', function() {});
                  }
                }
                else {
                  it('should have at least two then tests', function() {
                    assert.equal(ruleTest.given.length >= 2, true, 'There must be at least two then tests (ok, ko)');
                  });
                }
                ruleTest.then.forEach(thenTest => {
                  const documents = SpectralTest.getAllVersionsOfDocument(thenTest, ruleTest);
                  documents.forEach(document => {
                    if(configuration.version !== undefined && configuration.version !== document.version){
                      if(!configuration.silentSkip) {
                        it.skip(`${thenTest.description} (${ruleTest.format} ${document.version})`, function() {});
                      }
                    }
                    else {
                      it(`${thenTest.description} (${ruleTest.format} ${document.version})`, async function() {
      
                        // 9.1 Checking test document is valid
                        const formatFoundProblems = await documentValidator.validate(document.document);
                        const formatExpectedProblems = [];
                        assert.deepEqual(formatFoundProblems, formatExpectedProblems, `test document is not a valid ${ruleTest.format} document`);
      
                        // 9.2 Checking expected problems are found by the rules
                        // TODO work on "list problems that are not found => expect empty list"
                        //const foundProblems = sortAgainstPath(await spectralWrapper.lint(rulename, document.document, thenTest.description));
                        const foundProblems = pathUtils.thenExpectedToSpectralPaths(await spectralWrapper.lint(rulename, document.document, thenTest.description)).sort();
                        //const expectedProblems = sortAgainstPath(thenTest.expected);
                        const expectedProblems = pathUtils.thenExpectedToSpectralPaths(thenTest.expected).sort();
                        // TODO split assert and add message
                        assert.deepEqual(foundProblems, expectedProblems);
                      });
                    }
                  });
                });
              });
            });
          }
        }
      });
    });

    if(skippedTests(configuration)){
      describe('⚠️  Some tests have been skipped silently', function() {
        Object.keys(configuration).forEach(key => {
          if(key.startsWith('disable') || key === 'rule' || key === 'version'){
            it(`${key}: ${configuration[key]}`, function() {});
          }
        });
      });
    }
  });
}

exports.runTests = runTests;