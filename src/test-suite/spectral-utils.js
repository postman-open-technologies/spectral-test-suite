const { DiagnosticSeverity } = require('@stoplight/types')

const SEVERITY_MAP = {
  error: DiagnosticSeverity.Error,
  warn: DiagnosticSeverity.Warning,
  info: DiagnosticSeverity.Information,
  hint: DiagnosticSeverity.Hint,
  off: -1,
}

function getHumanReadableSeverity(severity){
  let result;
  if(typeof severity == 'string'){
    result = severity;
  }
  else {
    Object.keys(SEVERITY_MAP).forEach(key => {
      const value = SEVERITY_MAP[key];
      if(value === severity){
        result = key;
      }
    });
  }
  return result;
}

function getHumanReadableFormat(format) {
  let result;
  // Raw format from YAML or JSON file
  if(typeof format === 'string') {
    result = format;
  }
  // Function from JS file or parsed YAML or JSON file
  else {
    // Each format function now has a displayName defined
    // See https://github.com/stoplightio/spectral/tree/develop/packages/formats/src
    const displayName = format.displayName;
    const displayNameRegex = /(?<name>[\sa-zA-Z]*)\s*\(?(?<version>[a-z0-9\-\.]*)\)?/;
    const match = displayName.match(displayNameRegex);
    if(match.groups.name.startsWith('OpenAPI')){
      if(match.groups.version.startsWith('2')){
        result = 'oas2'
      }
      else {
        const version = match.groups.version.replace('.x', '').replace('.', '_')
        result = `oas${version}`;  
      }
    }
    else if(match.groups.name.startsWith('AsyncAPI')){
      const version = match.groups.version.replace('.x', '').replace('.', '_')
      result = `aas${version}`;
    }
    else if(match.groups.name.startsWith('JSON Schema')){
      const rawVersion = match.groups.version;
      result = 'json-schema'
      if(rawVersion){
        if(rawVersion.match(/^[0-9]$/)){
          result = `${result}-draft${rawVersion}`;
        }
        else {
          result = `${result}-${rawVersion}`;
        }
      }
    }
  }
  return result;
}

function getHumanReadableFormats(formats){
  const result = formats.map( format => getHumanReadableFormat(format));
  return result;
}

exports.getHumanReadableSeverity = getHumanReadableSeverity;
exports.getHumanReadableFormat = getHumanReadableFormat;
exports.getHumanReadableFormats = getHumanReadableFormats;