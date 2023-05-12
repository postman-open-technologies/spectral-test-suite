const assert = require('assert');
const spectralUtils = require('../../src/test-suite/spectral-utils');
const { 
  oas2, oas3, oas3_0, oas3_1, 
  aas2, aas2_0, aas2_1, aas2_2, aas2_3, aas2_4, aas2_5, aas2_6,
  jsonSchema, jsonSchemaLoose, jsonSchemaDraft4, jsonSchemaDraft6, jsonSchemaDraft7, jsonSchemaDraft2019_09, jsonSchemaDraft2020_12 
} = require ('@stoplight/spectral-formats');

describe('spectral-utils', function() {

  describe('getHumanReadableSeverity', function() {
    it('should return provided value if string', function() {
      const severity = 'warn';
      const result = spectralUtils.getHumanReadableSeverity(severity);
      assert.equal(result, severity);
    });

    const spectralSeverities =  [
      { severity: 0, result: 'error'},
      { severity: 1, result: 'warn'},
      { severity: 2, result: 'info'},
      { severity: 3, result: 'hint'},
      { severity: -1, result: 'off'},
    ];
    spectralSeverities.forEach(severity => {
      it(`should return ${severity.result} if severity is ${severity.severity}`, function() {
        const severity = 'warn';
        const result = spectralUtils.getHumanReadableSeverity(severity);
        assert.equal(result, severity);
      });
    });
  });

  describe('getHumanReadableFormat', function() {
    it('should return provided value if string', function(){
      const format = 'oas3';
      const result = spectralUtils.getHumanReadableFormat(format);
      assert.equal(result, format);
    });

    const spectralFormats = [
      { format: oas2, functionName: 'oas2', result: 'oas2'},
      { format: oas3, functionName: 'oas3', result: 'oas3'},
      { format: oas3_0, functionName: 'oas3_0', result: 'oas3_0'},
      { format: oas3_1, functionName: 'oas3_1', result: 'oas3_1'},
      { format: aas2, functionName: 'aas2', result: 'aas2'},
      { format: aas2_0, functionName: 'aas2_0', result: 'aas2_0'},
      { format: aas2_1, functionName: 'aas2_1', result: 'aas2_1'},
      { format: aas2_2, functionName: 'aas2_2', result: 'aas2_2'},
      { format: aas2_3, functionName: 'aas2_3', result: 'aas2_3'},
      { format: aas2_4, functionName: 'aas2_4', result: 'aas2_4'},
      { format: aas2_5, functionName: 'aas2_5', result: 'aas2_5'},
      { format: aas2_6, functionName: 'aas2_6', result: 'aas2_6'},
      { format: jsonSchema, functionName: 'jsonSchema', result: 'json-schema'},
      { format: jsonSchemaLoose, functionName: 'jsonSchemaLoose', result: 'json-schema-loose'},
      { format: jsonSchemaDraft4, functionName: 'jsonSchemaDraft4', result: 'json-schema-draft4'},
      { format: jsonSchemaDraft6, functionName: 'jsonSchemaDraft6', result: 'json-schema-draft6'},
      { format: jsonSchemaDraft7, functionName: 'jsonSchemaDraft7', result: 'json-schema-draft7'},
      { format: jsonSchemaDraft2019_09, functionName: 'jsonSchemaDraft2019_09', result: 'json-schema-2019-09'},
      { format: jsonSchemaDraft2020_12, functionName: 'jsonSchemaDraft2020_12', result: 'json-schema-2020-12'},
    ]
    spectralFormats.forEach(spectralFormat => {
      it(`it should return ${spectralFormat.result} if function is ${spectralFormat.functionName}`, function(){
        const format = spectralFormat.format;
        const result = spectralUtils.getHumanReadableFormat(format);
        assert.equal(result, spectralFormat.result);
      });
    });
  });

  describe('getHumanReadableFormats', function() {
    it('should return all formats', function() {
      const formats = ['oas2', oas3];
      const result = spectralUtils.getHumanReadableFormats(formats);
      const expected = ['oas2', 'oas3'];
      assert.deepEqual(result, expected);      
    })
  });
});
