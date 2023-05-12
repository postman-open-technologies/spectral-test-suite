const OpenApiUtils = require('./openapi.js');
const AsyncApiUtils = require('./asyncapi.js');

function getDocumentWithVersion(document, format, version){
  if(format === 'openapi'){
    return OpenApiUtils.getDocumentWithVersion(document, version);
  }
  else if(format === 'asyncapi'){
    return AsyncApiUtils.getDocumentWithVersion(document, version);
  }
  else {
    throw new Error(`Unsupported format ${format}`);
  }
}

function getShortVersionValue(format, version){
  if(format === 'openapi'){
    return OpenApiUtils.getShortVersionValue(version);
  }
  else if(format === 'asyncapi'){
    return AsyncApiUtils.getShortVersionValue(version);
  }
  else {
    throw new Error(`Unsupported format ${format}`);
  }
}

exports.getDocumentWithVersion = getDocumentWithVersion;
exports.getShortVersionValue = getShortVersionValue;