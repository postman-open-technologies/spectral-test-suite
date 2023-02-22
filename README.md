# spectral-test-suite

Are you sure your Spectral rules are working as intended?

This project aims to help you ensure your Spectral rules are working as intending by providing a frame to your tests. It's currently a prototype in early alpha stage and coming without much documentation, so use at your own risk. Non-backward compatible changes may happen frequently. It's currently written in JavaScript but will move to TypeScript.


# Demo

- Run `npm run samples-test-demo` (the "must find no test invalid against schema", "must find no test targeting non-existing ruleset files", "must not find ruleset not targeted by any test", and "all rules of ruleset must have tests" are expected, they're here to demonstrate how the framework works).
- Check the [`samples`](samples) folder for an example of test runner ([`samples.test.js`](samples/samples.test.js)) and test file ([`tests/info-contact.spectral-test.yaml`](samples/tests/info-contact.spectral-test.yaml)).

# About the test file format

- A JSON schema of the test file format can be found in [`src/tests/spectral-test-validator-schemas/spectral-test-v10.json-schema.yaml`](src/tests/spectral-test-validator-schemas/spectral-test-v10.json-schema.yaml).
- It can contains tests for a single or multiple rules of a ruleset file.

# How to add dependency to project

```
npm install --save-dev postman-open-technologies/spectral-test-suite#<commit id or tag>
```
For example:

```
npm install --save-dev postman-open-technologies/spectral-test-suite#1dc5c011cd88099c9f503fba64c213393652327b
```

```
npm install --save-dev postman-open-technologies/spectral-test-suite#latest
```
