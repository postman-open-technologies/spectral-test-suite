const assert = require('assert');
const pathUtils = require('../src/tests/path-utils');

describe('spectral-test-suite/path-utils', function() {
  describe('spectralPathToJsonPointer', function() {
    
    it('should transform a Spectral path without slash to a JSON Pointer', function() {
      const path = ['a', 'path', 'to', 'something'];
      const expectedPointer = '#/a/path/to/something';
      const pointer = pathUtils.spectralPathToJsonPointer(path);
      assert.equal(pointer, expectedPointer);
    });

    it('should transform a Spectral path with slashs to an escaped JSON Pointer', function() {
      const path = ['a', '/path/to', 'something'];
      const expectedPointer = '#/a/~1path~1to/something';
      const pointer = pathUtils.spectralPathToJsonPointer(path);
      assert.equal(pointer, expectedPointer);
    });

    it('should transform a Spectral path with array index to a JSON Pointer', function() {
      const path = ['a', 'path', '1', 'to', 'something'];
      const expectedPointer = '#/a/path/1/to/something';
      const pointer = pathUtils.spectralPathToJsonPointer(path);
      assert.equal(pointer, expectedPointer);
    });
  });

  describe('jsonPointerToSpectralPath', function() {
    it('should transform a without escape JSON pointer to a Spectral path', function() {
      const pointer = '#/a/path/to/something';
      const expectedPath = ['a', 'path', 'to', 'something'];
      const path = pathUtils.jsonPointerToSpectralPath(pointer);
      assert.deepEqual(path, expectedPath);
    });

    it('should transform a with escape JSON pointer to a Spectral path', function() {
      const pointer = '#/a/~1path~1to/something';
      const expectedPath = ['a', '/path/to', 'something'];
      const path = pathUtils.jsonPointerToSpectralPath(pointer);
      assert.deepEqual(path, expectedPath);
    });

    it('should transform a with array index JSON pointer to a Spectral path', function() {
      const pointer = '#/a/path/1/to/something';
      const expectedPath = ['a', 'path', '1', 'to', 'something'];
      const path = pathUtils.jsonPointerToSpectralPath(pointer);
      assert.deepEqual(path, expectedPath);
    });
  });

  describe('toSpectralPath', function() {
    it('should return the provided Spectral path', function() {
      const input = ['a', 'spectral', 'path'];
      const expectedOutput = input;
      const output = pathUtils.toSpectralPath(input);
      assert.deepEqual(output, expectedOutput); 
    });

    it('should return the Spectral path corresponding to the provided JSON pointer', function() {
      const input = '#/a/json/pointer';
      const expectedOutput = ['a', 'json', 'pointer'];
      const output = pathUtils.toSpectralPath(input);
      assert.deepEqual(output, expectedOutput);
    });

    it('should throw an error if input is not array or string', function() {
      const input = { path: '#/a/path' };
      let errorThrown = false;
      try{
        pathUtils.toSpectralPath(input);
      }
      catch(error){
        errorThrown = true;
      }
      assert.equal(errorThrown, true);
    });
  });

  describe('givenExpectedItemToSpectralPath', function() {
    it('should return a Spectral path when input is an expected object with JSON Pointer', function() {
      const item = {
        path: '#/some/path'
      };
      const expectedPath = ['some', 'path'];
      const path = pathUtils.givenExpectedItemToSpectralPath(item);
      assert.deepEqual(path, expectedPath);
    });

    it('should return a Spectral path when input is an expected object with Spectral path', function() {
      const item = {
        path: ['some', 'path']
      };
      const expectedPath = ['some', 'path'];
      const path = pathUtils.givenExpectedItemToSpectralPath(item);
      assert.deepEqual(path, expectedPath);
    });

    it('should return a Spectral path when input is a JSON Pointer', function() {
      const item = '#/some/path';
      const expectedPath = ['some', 'path'];
      const path = pathUtils.givenExpectedItemToSpectralPath(item);
      assert.deepEqual(path, expectedPath);
    });

    it('should return a Spectral path when input is a Spectral path', function() {
      const item = ['some', 'path'];
      const expectedPath = ['some', 'path'];
      const path = pathUtils.givenExpectedItemToSpectralPath(item);
      assert.deepEqual(path, expectedPath);
    });
  });

  describe('debuggerGivenResultToSpectralPaths', function() {
    it('should return a flat array of Spectral paths', function(){
      const givenResult = {
        rule: 'a-path',
        given: [
          {
            given: '$.a.path',
            paths: [
              { path: ['a', 'path'] },
              { path: ['another', 'a', 'path'] }
            ]
          },
          {
            given: '$.a.nother.path',
            paths: [
              { path: ['a', 'nother', 'path'] },
              { path: ['another', 'a', 'nother', 'path'] }
            ]
          }
        ]
      };
      const expectedPaths = [
        ['a', 'path'],
        ['another', 'a', 'path'],
        ['a', 'nother', 'path'],
        ['another', 'a', 'nother', 'path']
      ];
      const paths = pathUtils.debuggerGivenResultToSpectralPaths(givenResult);
      assert.deepEqual(paths, expectedPaths);
    });
  });
});