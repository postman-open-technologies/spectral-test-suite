const assert = require('assert');
const testDocumentValidator = require('../../src/tests/test-document-validator');

describe('test-document-validator', function() {
  describe('isToBeFilteredProblem', function() {
    it('it should return false if problem is not in problems to filter', function(){
      const problem = {
        code: 'a-code',
        message: 'a message'
      };
      const result = testDocumentValidator._isToBeFilteredProblem(problem);
      assert.equal(result, false);
    });

    it('it should return true if problem is in problems to filter', function(){
      const problem = {
        code: 'oas3-schema',
        message: '\"license\" property must have required property \"identifier\".'
      };
      const result = testDocumentValidator._isToBeFilteredProblem(problem);
      assert.equal(result, true);
    });
  });

  describe('filterProblemList', function() {
    it('should return unmodified list when no problem to filter', function(){
      const problems = [{
        code: 'a-code',
        message: 'a message'
      }];
      const result = testDocumentValidator._filterProblemList(problems);
      assert.deepEqual(result, problems);
    });

    it('should return list without problems to filter', function(){
      const problems = [{
        code: 'oas3-schema',
        message: '\"license\" property must have required property \"identifier\".'
      },
      {
        code: 'a-code',
        message: 'a message'
      }
    ];
      const result = testDocumentValidator._filterProblemList(problems);
      assert.deepEqual(result, [problems[1]]);
    });
  });

  describe('DocumentValidator:validate', function(){
    it('should return no problems with valid openapi 3.x document', async function(){
      const validator = await testDocumentValidator.DocumentValidator.getValidator('openapi');
      const document = {
        openapi: '3.1.0',
        info: {
          title: 'an api',
          version: '1.0'
        },
        paths: {}
      }
      const result = await validator.validate(document, 'test.openapi.json');
      assert.deepEqual(result, []);
    });

    it('should return problems is error in openapi 3.x document', async function(){
      const validator = await testDocumentValidator.DocumentValidator.getValidator('openapi');
      const document = {
        openapi: '3.1.0',
        info: {
          title: 'an api',
          version: '1.0'
        }
        // Missing paths
      }
      const result = await validator.validate(document, 'test.openapi.json');
      assert.equal(result.length, 1);
      assert.equal(result[0].code, 'oas3-schema');
      assert.equal(result[0].message, 'The document must have either "paths", "webhooks" or "components".');
    });

    it('should return no problems with valid swagger 2.0 document', async function(){
      const validator = await testDocumentValidator.DocumentValidator.getValidator('openapi');
      const document = {
        swagger: '2.0',
        info: {
          title: 'an api',
          version: '1.0'
        },
        paths: {}
      }
      const result = await validator.validate(document, 'test.openapi.json');
      assert.deepEqual(result, []);
    });

    it('should return problems is error in swagger 2.0 document', async function(){
      const validator = await testDocumentValidator.DocumentValidator.getValidator('openapi');
      const document = {
        swagger: '2.0',
        info: {
          title: 'an api',
          version: '1.0'
        }
        // Missing paths
      }
      const result = await validator.validate(document, 'test.openapi.json');
      assert.equal(result.length, 1);
      assert.equal(result[0].code, 'oas2-schema');
      assert.equal(result[0].message, 'Object must have required property "paths".');
    });


    it('should return no problems with valid asyncapi document', async function(){
      const validator = await testDocumentValidator.DocumentValidator.getValidator('asyncapi');
      const document = {
        asyncapi: '2.6.0',
        info: {
          title: 'an api',
          version: '1.0'
        },
        channels: {}
      }
      const result = await validator.validate(document, 'test.asyncapi.json');
      assert.deepEqual(result, []);
    });

    it('should return problems is error in asyncapi document', async function(){
      const validator = await testDocumentValidator.DocumentValidator.getValidator('asyncapi');
      const document = {
        asyncapi: '2.6.0',
        info: {
          title: 'an api',
          version: '1.0'
        }
        // Missing channels
      }
      const result = await validator.validate(document, 'test.asyncapi.json');
      assert.equal(result.length, 1);
      assert.equal(result[0].code, 'asyncapi-schema');
      assert.equal(result[0].message, 'Object must have required property "channels"');
    });
  });
});