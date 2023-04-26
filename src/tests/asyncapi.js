function getNormalizedVersionValue(versionValue){
  const normalizedVersionValues = {
    '2.0': '2.0.0',
    '2.1': '2.1.0',
    '2.2': '2.2.0',
    '2.3': '2.3.0',
    '2.4': '2.4.0',
    '2.5': '2.5.0',
    '2.6': '2.6.0',
  };  
  const shortVersionValue = getShortVersionValue(versionValue);
  if(normalizedVersionValues.hasOwnProperty(shortVersionValue)){
    return normalizedVersionValues[shortVersionValue];
  }
  else {
    throw Exception(`Unsupported AsyncAPI version ${versionValue}`);
  }
}

// Source: https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

// Supposed to be use with document that share the exact same structure
// between current version and target version
function getDocumentWithVersion(document, version){
  const modified = deepCopy(document);
  // Todo remove elements by version
  modified.asyncapi = getNormalizedVersionValue(version);
  return modified;
}

function getShortVersionValue(versionValue){
  return versionValue.substring(0,3);
}

exports.getDocumentWithVersion = getDocumentWithVersion;
exports.getShortVersionValue = getShortVersionValue;