//const OpenApiUtils = require('./openapi.js');
const SpecificationsUtils = require('./specifications');

// TODO Put test stuff and sub-elements into one or more classes in that file
//export default class SpectralTest {
//}

// TODO add possibiliyies to have either hardcoded documents or a documentTemplate in schema
function getAllVersionsOfDocument(givenOrThenTest, ruleTest) {
  let documents;
  if(givenOrThenTest.documentTemplate !== undefined){
    documents = [];
    ruleTest.versions.forEach(version => {
      documents.push({
        version: SpecificationsUtils.getShortVersionValue(ruleTest.format, version),
        document: SpecificationsUtils.getDocumentWithVersion(givenOrThenTest.documentTemplate, ruleTest.format, version)
      });
    });
  }
   else {
    documents = givenOrThenTest.documents;
  }
  return documents;
}

function getRuleNames(rulesetTest) {
  return Object.keys(rulesetTest.rules);
}


exports.getAllVersionsOfDocument = getAllVersionsOfDocument;
exports.getRuleNames = getRuleNames