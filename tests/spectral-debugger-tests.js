const assert = require('assert');
const spectralDebugger = require('../src/tests/spectral-debugger');
const { undefined, truthy } = require('@stoplight/spectral-functions');


// Spectral
const spectralCore = require('@stoplight/spectral-core');
const { Spectral, Document } = spectralCore;
const bundleAndLoadRuleset = require('@stoplight/spectral-ruleset-bundler/with-loader').bundleAndLoadRuleset;

const fs = require('fs');
const spectralRuntime = require('@stoplight/spectral-runtime');
const { fetch } = spectralRuntime;
const Parsers = require('@stoplight/spectral-parsers'); // make sure to install the package if you intend to use default parsers!


describe('spectral-debugger', function() {

  describe('getRuleGivenArray', function() {
    
    it('should return an array with a single element which value is given when given is an object', function() {
      const rule = {
        given: '$.a.path'
      }
      const givens = spectralDebugger._getRuleGivenArray(rule);
      assert.deepEqual(givens, [rule.given]);
    });

    it('should return the original given array when given is an array', function() {
      const rule = {
        given: [
          '$.a.path',
          '$.another.path'
        ]
      }
      const givens = spectralDebugger._getRuleGivenArray(rule);
      assert.deepEqual(givens, rule.given);
    });
  });

  describe('initGivensResults', function() {
    it('should return a list of rule + given', function(){
      const ruleset = {
        rules: {
          'a-path': {
            given: '$.a.path',
            then: {
              function: truthy
            }
          },
          'a-path-to': {
            given: [
              '$.a.path.to.something',
              '$.a.path.to.anotherThing'
            ],
            then: {
              function: truthy
            }
          }
        }
      };
      const results = spectralDebugger._initGivensResults(ruleset);
      const expectedResults = [
        {
          rule: 'a-path',
          given: [
            {
              given: '$.a.path',
              paths:[]
            }
          ]
        },
        {
          rule: 'a-path-to',
          given: [
            {
              given: '$.a.path.to.something',
              paths: []
            },
            {
              given: '$.a.path.to.anotherThing',
              paths: []
            }
          ]
        }
      ];
      assert.deepEqual(results, expectedResults);
    });
  });

  describe('addGivenResults', function() {
    it('should add result in the right place', function() {
      const results = [
        {
          rule: 'a-path',
          given: [
            {
              given: '$.a.path',
              paths:[]
            }
          ]
        },
        {
          rule: 'a-path-to',
          given: [
            {
              given: '$.a.path.to.something',
              paths: []
            },
            {
              given: '$.a.path.to.anotherThing',
              paths: []
            }
          ]
        }
      ];
      
      const spectralResults = [
        {
          code: 'a-path_0',
          path: ['a', 'path', '0', 'target'],
          range: 'dummy range 1'
        },
        {
          code: 'a-path-to_1',
          path: ['a', 'path', 'to', '1', 'target'],
          range: 'dummy range 2'
        }
      ];

      const expectedResults = [
        {
          rule: 'a-path',
          given: [
            {
              given: '$.a.path',
              paths:[
                {
                  path: ['a', 'path', '0', 'target'], 
                  range: 'dummy range 1'
                }
              ]
            }
          ]
        },
        {
          rule: 'a-path-to',
          given: [
            {
              given: '$.a.path.to.something',
              paths: []
            },
            {
              given: '$.a.path.to.anotherThing',
              paths: [
                {
                  path: ['a', 'path', 'to', '1', 'target'],
                  range: 'dummy range 2'
                }
              ]
            }
          ]
        }
      ];
      spectralDebugger._addGivenResults(results, spectralResults[0]);
      spectralDebugger._addGivenResults(results, spectralResults[1]);
      assert.deepEqual(results.sort(), expectedResults.sort());
    });
  });

  describe('buildGivensDebugRuleset', function() {
    it('should return a ruleset containing rules with then undefined for each given of each rule', function() {
      const ruleset = {
        rules: {
          'a-rule': {
            given: '$.a.rule.path',
            then: {
              function: 'truthy'
            }
          },
          'another-rule': {
            given: [
              '$.another.rule.path',
              '$.another.rule.another.path',
            ],
            then: {
              function: 'truthy'
            }
          }
        }
      };
      const givensDebugRuleset = spectralDebugger._buildGivensDebugRuleset(ruleset);
      const expected = {
        rules: {
          'a-rule_0': {
            given: '$.a.rule.path',
            then: {
              function: undefined
            }
          },
          'another-rule_0': {
            given: '$.another.rule.path',
            then: {
              function: undefined
            }
          },
          'another-rule_1': {
            given: '$.another.rule.another.path',
            then: {
              function: undefined
            }
          }
        }
      };
      assert.deepEqual(givensDebugRuleset, expected);
    });

    it('should work on a bundleAndLoadedRuleset', async function() {
      const ruleset = await bundleAndLoadRuleset(__dirname+'/assets/ruleset.spectral-v6.yaml', { fs, fetch });
    });
  });

  describe('runGivens', function() {
    it('should run', async function() {
      const document = {
        a: {
          path: {
            to: {
              something: 1,
              anotherThing: false
            }
          }
        }
      };
      const ruleset_ = {
        "rules": {
          "a-path": {
            "given": "$.a.path",
            "then": {
              "function": "truthy"
            }
          },
          "a-path-to": {
            "given": [
              "$.a.path.to.something",
              "$.a.path.to.anotherThing"
            ],
            "then": {
              "function": "truthy"
            }
          }
        }
      }
      const ruleset = { 
        rules: {
          'a-path': {
            given: '$.a.path',
            then: {
              function: truthy
            }
          }
        }
      }
      
      const expectedResult = [
        {
          rule: 'a-path',
          given: [
            {
              given: '$.a.path',
              paths: [
                {
                  path: ['a', 'path'],
                  range: {
                    start: {
                      line: 2,
                      character: 11
                    },
                    end: {
                      line: 5,
                      character: 29
                    }
                  }
                }
              ]
            }
          ]
        }
      ];

      const result = await spectralDebugger.runGivens(document, ruleset);
      assert.deepEqual(result, expectedResult);

    });
  });

});