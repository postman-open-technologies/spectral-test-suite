# spectral-test-suite

Are you sure your Spectral rules are working as intended?

This project aims to help you ensure your Spectral rules are working as intending by providing a frame to your tests.
It's currently a prototype in early alpha stage and coming without much documentation, so use at your own risk.
Non-backward compatible changes may happen frequently.

# How does it work

- It leverage test file written in YAML. A JSON schema of the test file format can be found in [`src/tests/spectral-test-validator-schemas/spectral-test-v10.json-schema.yaml`](src/tests/spectral-test-validator-schemas/spectral-test-v10.json-schema.yaml).
- Each test file can contain tests for a single or multiple rules of a ruleset file (I recommend writing one test file per rule).
- All targeted tests file are aggregrated and then each rule test is run.
- A rule test checks
  - The settings of the rule (such as severity or targeted format).
  - If the given paths find or didn't find what is expected to found or not found (multiple tests possible).
  - If the then check find or didn't find what is expected to found or not found (multiple tests possible).
- There are also high-level checks:
  - Do all Spectral ruleset are targeted by at least one test file
  - Do all rules of all rulesets are tested

So far, this project supports:

- Spectral file in YAML, JSON and JS formats
- Rules targeting OpenAPI and AsyncAPI formats

# Demo

- Check the [samples](samples) folder and run `npm run samples-test-demo` (the "must find no test invalid against schema", "must find no test targeting non-existing ruleset files", "must not find ruleset not targeted by any test", and "all rules of ruleset must have tests" errors are expected, they're here to demonstrate how the framework works). 

# Setup

## Add dependencies to your Spectral project

Two dev dependencies to add:

- mocha (`npm install --save-dev mocha`)
- This project (which is not yet published as an npm package: coming soon).

### Install Spectral Test Suite as local dependency

```
git clone https://github.com/postman-open-technologies/spectral-test-suite
cd <your-project>
npm install --save-dev ../spectral-test-suite
```

### Install Spectral Test Suite As Github dependency

```
npm install --save-dev postman-open-technologies/spectral-test-suite
```

## Create a test runner file

Create a `tests/spectral.test.js` file with the [following content](doc/test-runner-examples/spectral.test.js) (the location and filename are just examples):

```
const {cli} = require('spectral-test-suite');
cli(process.argv);
```

## Add script to package.json (optional)

You can add a command to your package.json as follow:

```
{
  "scripts": {
    "spectral-test": "npx mocha ./tests/spectral.test.js",
  }
}
```

If your already use mocha in this project, your regular test command can launch the spectral test.
```
{
  "scripts": {
    "test": "npx mocha ./tests/**/*.test.js",
  }
}
```

# Write tests

- Sample files can be found in the [samples](samples) folder.
- The JSON Schema defined the test file format is [spectral-test-suite-v0.1.json-schema.yaml](src/test-suite/spectral-test-validator-schemas/spectral-test-suite-v0.1.json-schema.yaml)
- By default, the runner will look for test files are named `*.spectral-test.yaml`.
- A test file can contain the test for one to many rules of a Spectral ruleset file (I recommend creating one test file per rule).

Here's a basic sample:

```
spectralTestSuite: "0.1"
# Path to a Spectral file
ruleset: ../rulesets/info-contact.spectral-v6.yaml
# The rule tests
rules:
  # Same key as in the targeted Spectral file
  info-contact:  
    # Expected format (only openapi and asyncapi supported)
    format: openapi
    # Expected versions
    versions: [ "2.0", "3.0", "3.1" ]
    # Expected severity
    severity: error
    # Expected recommended flag (optional)
    recommended: true
    # These tests check what is found by the given path without executing the then checks
    # It is recommended to have at least one test here
    given:
      - description: must find the info object
        # Paths that are supposed to be found
        expected:
          - [ info ]
        # Document template (a document for all version indicated at rule level will be generated)
        documents:
          openapi: "3.1.0"
          info:
            title: an api name
            version: '1.0'
          paths: {} 
    # Theses tests check the issues detected by the rule.
    # I recommend to put at least 2 tests here (one OK and one KO)
    then:
      - description: must return a problem if there's no contact property in info
        expected:
          - [ info ]
        documents:
          openapi: "3.1.0"
          info:
            title: an api name
            version: '1.0'
          paths: {}
      - description: must return no problem if there's contact property in info
        expected: []
        documents:
          openapi: "3.1.0"
          info:
            title: an api name
            version: '1.0'
            contact: 
              name: a contact name
          paths: {} 

```

### About test documents

Most of the time you can use the same document across versions for a test, but in some cases, 
you need to test documents that are different depending on the version. You may need several test or several documents to test the same case. 

That's why each `documents` used in `given` or `then` tests can be a list or a single item, and each document can target the rule level `versions` or specific ones. And that's also why the same document can be used to generate tests for different versions.



#### Documents is a list or single item

```
        documents:
          openapi: "3.1.0"
          info:
            title: an api name
            version: '1.0'
          paths: {} 
```

```
        documents:
          - openapi: "3.1.0"
            info:
              title: an api name
              version: '1.0'
            paths: {} 

```

#### Each document is a document for all versions or specific versions

The test will run on all versions indicated in rule level `versions`. If it's value is `["2.0", "3.0, "3.1"]`, the runner will generate 3 documents and run the test on them. It handles the openapi/swagger property, but will not do a true conversion. That mechanism works also with AsyncAPI documents.

```
        documents:
          - openapi: "3.1.0"
            info:
              title: an api name
              version: '1.0'
            paths: {} 

```

If there are syntax difference between versions (for instance there are elements existing in OpenAPI 3.x that don't exist in earlier version), you can tell to focus on specific version. Here, even if rule level `versions` is [ "3.0", "3.1" ], the following configuration tells "run test on 3.0 and 3.1 only":

```
        documents:
          - versions: [ "3.0", "3.1" ]
            document:
              openapi: "3.1.0"
              info:
                title: an api name
                version: '1.0'
              paths: {}
```

The `versions` property can be a list or a single element. Here the test is Swagger 2 only.

```
        documents:
          - versions: "2.0"
            document:
              openapi: "3.1.0"
              info:
                title: an api name
                version: '1.0'
              paths: {}
```


# Run tests

## Configuration arguments

By default, the test runner will look for `**/*.spectral-test.yaml` test files and `**/*.spectral-v6.yaml` ruleset files. This can be overriden programmatically as shown below (and also by passing command line arguments see "How to run tests").

### Pass arguments

With mocha:
```
npx mocha tests/spectral.test.js --title "My Spectral Tests" --disable-completeness
```

With npm:
```
npm run spectral-test -- --title "My Spectral Tests" --disable-completeness
```


### See possible arguments

With mocha:
```
npx mocha tests/unit-test.test.js --args-help
```

With npm:
```
npm run your-test-command -- --args-help
```

```
Spectral Test Suite arguments:

    --tests <glob pattern>

        Test files to run (don't forget quotes when using glob)

        Examples:

        --tests "**/*.spectral-test.yaml"
        --tests info-contact.spectral-test.yaml

    --rulesets <glob pattern>

        Ruleset files (don't forget quotes when using glob)

        Examples:

        --rulesets "**/*.spectral-v6.yaml"
        --rulesets ruleset.spectral-v6.yaml
        --rulesets "*.spectral.js"

    --disable-rules-completeness

        Disable the test ensuring all rules of all rulesets (--rulesets) are tested

    --disable-rulesets-completeness

        Disable the test ensuring all rulesets (--rulesets) are targeted by one test file

    --disable-completeness

        Same as --disable-rules-completeness --disable-rulesets-completeness

    --disable-then-count

        Disable the test ensuring there are at least 2 then tests

    --disable-given-count

        Disable the test ensuring there's at least 1 given test

    --disable-count

        Same as --disable-given-count --disable-then-count

    --disable-given

        Disable the given tests

    --disable-then

        Disable the then tests

    --rule <rule name>

        Filter tests to execute only the ones targeting a specific rule

    --format <format name>

        Filter tests to execute only the ones targeting a specific format

        Examples:

        --format openapi
        --format asyncapi

    --format-version <format version>

        Filter tests to execute only the ones targeting a specific format version

        Examples:

        --format-version 3.1
        --format-version 2.6

    --title <a title>

        Overrides the main describe title

        Examples:

        --title "My Spectral Tests"

    --silent-skip

        Hide skipped tests from output

    --silent-skip-debug

        Hide skipped tests from output and shows a summary of skipped tests

    --debug-given

        Console.log the Spectral paths found by given tests

    --debug-then

        Console.log the Spectral paths found by then tests
```