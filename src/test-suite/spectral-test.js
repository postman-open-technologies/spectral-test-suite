const SpecificationsUtils = require('./specifications');

function getAllVersionsOfDocument(givenOrThenTest, ruleTest) {
  const documents = []
  const format = ruleTest.format;
  
  let providedDocuments;
  if(Array.isArray(givenOrThenTest.documents)){
    providedDocuments = givenOrThenTest.documents;
  }
  else {
    providedDocuments = [givenOrThenTest.documents];
  }

  providedDocuments.forEach( sourceDocument => {
    let versions;
    if(sourceDocument.versions){
      versions = sourceDocument.versions;
    }
    else {
      versions = ruleTest.versions;
    }
    if(!Array.isArray(versions) ){
      versions = [versions];
    }
    let providedDocument;
    if(sourceDocument.document){
      providedDocument = sourceDocument.document;
    }
    else {
      providedDocument = sourceDocument;
    }
    if(versions.length > 1){
      versions.forEach(version => {
        documents.push({
          version: SpecificationsUtils.getShortVersionValue(format, version),
          document: SpecificationsUtils.getDocumentWithVersion(providedDocument, format, version)
        });
      });
    }
    else {
      documents.push({
        version: versions[0],
        document: providedDocument 
      });
    }
  });

  return documents;
}

function getRuleNames(rulesetTest) {
  return Object.keys(rulesetTest.rules);
}


exports.getAllVersionsOfDocument = getAllVersionsOfDocument;
exports.getRuleNames = getRuleNames