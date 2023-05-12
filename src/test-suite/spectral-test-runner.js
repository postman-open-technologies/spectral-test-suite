const assert = require('assert');
const SpectralTestLoader = require('./spectral-test-loader').SpectralTestLoader;
const SpectralTestWrapper = require('./spectral-test-wrapper').SpectralTestWrapper;
const SpectralTest = require('./spectral-test');
const DocumentValidator = require('./test-document-validator').DocumentValidator;
const spectralTestConfiguration = require('./configuration');

function runTests(configuration = spectralTestConfiguration.getConfiguration()){
  describe(configuration.title, function() {
    // 1 - Loading test and rule files and checking WZthem
    const testLoader = new SpectralTestLoader(configuration.tests, configuration.rulesets);
  
    describe(`🔬 Checking test documents (${testLoader.testFilenamePattern}) are valid`, function() {
      it('must have found and aggregated runnable tests', function() {
        assert.equal(testLoader.getAggregateRunnableTests().length>0, true, 'No runnable tests found for provided pattern');
      });
  
      it('must find no test invalid against schema', function() {
        assert.deepEqual(testLoader.getInvalidSchemaTests(), [], 'Found some tests which are not valid against schema');
      });

      it('must find no test targeting non-existing ruleset files', function() {
        assert.deepEqual(testLoader.getTargetingNonExistingRulesetTests(), [], 'Found some tests targeting non-existing ruleset files');
      });
    });
  
    let rulesetCheckMessage;
    let rulesetCheck;
    if(testLoader.isTargetedByNoTestRulesetsDisabled()){
      rulesetCheckMessage = '⚠️  Checking all rulesets are targeted by at least one test document is disabled (no ruleset file pattern provided)';
      rulesetCheck = false;
    }
    else if(configuration.disableRulesetsCompleteness){
      rulesetCheckMessage = '⚠️  Checking all rulesets are targeted by at least one test document is disabled (configuration)';
      rulesetCheck = false;
    }
    else {
      rulesetCheckMessage = `🔬 Checking all rulesets (${testLoader.rulesetFilenamePattern}) are targeted by at least one test document`;
      rulesetCheck = true;
    }

    describe(rulesetCheckMessage, function() {
      if(!rulesetCheck){
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
              const testedRules = SpectralTest.getRuleNames(rulesetTest.test).sort();
              const rulesetRules = spectralWrapper.getRuleNames().sort();
              const nonTestedRules = rulesetRules.filter(rulesetRule => !testedRules.includes(rulesetRule));
              assert.deepEqual(nonTestedRules, [], 'some rules are not tested');
            });
          }

        });
  
        // 5 - Looping on rule test in ruleset test
        for (const [rulename, ruleTest] of Object.entries(rulesetTest.test.rules)){
          if((configuration.rule !== undefined && configuration.rule !== rulename) || (configuration.format !== undefined && configuration.format !== ruleTest.format)){
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
              it(`must${!ruleTest.recommended? ' not': ''} be recommended`, function() {
                const foundRecommended = spectralWrapper.getRuleRecommended(rulename);
                const expectedRecommended = ruleTest.recommended;
                assert.equal(foundRecommended, expectedRecommended);
              });
              
              // 8 - Testing given
              describe(`Testing rule ${rulename} given`, function() {
                if(configuration.disableGivenTest){
                  if(!configuration.silentSkip) {
                    it.skip('⚠️ (given tests disabled)', function() {});
                  }  
                }
                else {
                  if(configuration.disableGivenTestCountCheck || configuration.disableGivenTest){
                    if(!configuration.silentSkip) {
                      it.skip('⚠️ should have at least one given test (disabled)', function() {});
                    }
                  }
                  else {
                    it('should have at least one given test', function() {
                      assert.equal(ruleTest.given && ruleTest.given.length > 0, true, 'There must be at least one given test (to check elements are found)');
                    });
                  }
                  if(ruleTest.given) {
                    ruleTest.given.forEach(givenTest => {
                      const documents = SpectralTest.getAllVersionsOfDocument(givenTest, ruleTest);
                      documents.forEach(document => {
                        if((configuration.version !== undefined && configuration.version !== document.version) || (configuration.disableGivenTest)){
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
                            const expectedPaths = givenTest.expected.sort();
                            if(configuration.debugGiven){
                              console.log(rulename, givenTest.description, 'given test found found paths', foundPaths)
                            }
                            assert.deepEqual(foundPaths, expectedPaths, 'found paths do not match expected ones');
                          });
                        }
                      });
                    });
                  }
                }
              });
              
              // 9 - Testing then
              describe(`Testing rule ${rulename} then`, function() {
                if(configuration.disableThenTest){
                  if(!configuration.silentSkip) {
                    it.skip('⚠️ (then tests disabled)', function() {});
                  }  
                }
                else {
                  if(configuration.disableThenTestCountCheck || configuration.disableThenTest){
                    if(!configuration.silentSkip) {
                      it.skip('⚠️ should have at least two then tests (disabled)', function() {});
                    }
                  }
                  else {
                    it('should have at least two then tests', function() {
                      assert.equal(ruleTest.then && ruleTest.then.length >= 2, true, 'There must be at least two then tests (ok, ko)');
                    });
                  }
                  if(ruleTest.then){
                    ruleTest.then.forEach(thenTest => {
                      const documents = SpectralTest.getAllVersionsOfDocument(thenTest, ruleTest);
                      documents.forEach(document => {
                        if((configuration.version !== undefined && configuration.version !== document.version) || (configuration.disableThenTest)){
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
                            const foundProblems = (await spectralWrapper.lint(rulename, document.document, thenTest.description)).sort();
                            if(configuration.debugThen){
                              console.log(rulename, thenTest.description, 'then test found problems', foundProblems)
                            }
                            const expectedProblems = thenTest.expected.sort();
                            assert.deepEqual(foundProblems, expectedProblems);
                          });
                        }
                      });
                    });
                  }
  
                }
              });
            });
          }
        }
      });
    });

    spectralTestConfiguration.debugSkippedTests(configuration);
    
  });
}

exports.runTests = runTests;