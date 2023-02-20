# spectral-test-suite

Are you sure your Spectral rules are working as intended?

This project aims to help you ensure your Spectral rules are working as intending by providing a frame to your tests. It's currently a prototype in early alpha stage and coming without much documentation, so use at your own risk. Non-backward compatible changes may happen frequently. It's currently written in JavaScript but will move to TypeScript.


# Demo

- Run `npm run samples-test-demo` (the "must find a test suite for each ruleset" and "all rules of ruleset must have tests" are expected, they're to demonstrate how the framework can detect missing tests for rulesets or rules inside ruleset).
- Check the [`samples`](samples) folder for an example of test runner ([`samples.test.js`](samples/samples.test.js)) and test file ([`tests/info-contact.spectral-test.yaml`](samples/tests/info-contact.spectral-test.yaml)).

# About the test file format

- A JSON schema of the test file format can be found in [`src/tests/spectral-test-validator-schemas/spectral-test-v10.json-schema.yaml`](src/tests/spectral-test-validator-schemas/spectral-test-v10.json-schema.yaml).
- It can contains tests for a single or multiple rules of a ruleset file.

# How to add dependency to project

```
npm install --save-dev postman-open-technologies/spectral-test-suite#caf58f2434be7c142ccfde51efbda17398ca6f18
```