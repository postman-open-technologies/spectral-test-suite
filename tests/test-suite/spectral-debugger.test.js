const assert = require('assert');
const spectralDebugger = require('../../src/test-suite/spectral-debugger');

// Spectral
const bundleAndLoadRuleset = require('@stoplight/spectral-ruleset-bundler/with-loader').bundleAndLoadRuleset;
const fs = require('fs');
const spectralRuntime = require('@stoplight/spectral-runtime');
const { fetch } = spectralRuntime;


describe('spectral-debugger', function() {
  describe('debugGiven', function() {
    it('should return an array with one element for each rule having paths list filled with elements found by given', async function() {
      const ruleset = await bundleAndLoadRuleset(__dirname+'/assets/ruleset.spectral-v6.yaml', { fs, fetch });
      const document = {
        openapi: '3.0.3',
        info: {
          title: 'an api',
          version: '1.0',
          contact:{
            url: 'http://somewhere.com'
          }
        },
        paths: {
          '/resources': {
            'get': {
              
            }
          },
          '/another-resources': {
            'post': {
              
            }
          }
        }
      }
      const result = await spectralDebugger.debugGiven(ruleset, document);
      assert.deepEqual(result.find(item => item.rule === 'info-contact').paths[0].path, ['info']);
      assert.deepEqual(result.find(item => item.rule === 'info-contact-alias').paths[0].path, ['info']);
      assert.deepEqual(result.find(item => item.rule === 'info-contact-name-alias').paths[0].path, ['info','contact']);
      assert.deepEqual(result.find(item => item.rule === 'operations').paths[0].path, ['paths', '/resources', 'get']);
      assert.deepEqual(result.find(item => item.rule === 'operations').paths[1].path, ['paths', '/another-resources', 'post']); 
    });
  });
});