function spectralPathToJsonPointer(path){
  const escapedPath = path.map(value => value.replaceAll('/','~1'));
  const jsonPointer = `#/${escapedPath.join('/')}`;
  return jsonPointer;
}

function jsonPointerToSpectralPath(pointer){
  let path = pointer.replace(/^#\//, '').split('/');
  path = path.map(segment => segment.replaceAll('~1', '/'));
  return path;
}

function toSpectralPath(pointerOrPath){
  let path;
  // Spectral path
  if(Array.isArray(pointerOrPath)){
    path = pointerOrPath;
  }
  // JSON pointer
  else if (typeof pointerOrPath === "string"){
    path = jsonPointerToSpectralPath(pointerOrPath)
  }
  else {
    throw new Error('Value must ba a JSON pointer string or a Spectral path array');
  }
  return path;
}

function givenExpectedItemToSpectralPath(givenExpectedItem){
  let path;
  if(givenExpectedItem.path !== undefined){
    path = toSpectralPath(givenExpectedItem.path);
  }
  else {
    path = toSpectralPath(givenExpectedItem);
  }
  return path;
}

function givenExpectedToSpectralPaths(givenExpected){
  return givenExpected.map(item => givenExpectedItemToSpectralPath(item));
}

function thenExpectedItemToSpectralPath(thenExpectedItem){
  let path;
  if(thenExpectedItem.path !== undefined){
    path = toSpectralPath(thenExpectedItem.path)
  }
  else {
    path = toSpectralPath(thenExpectedItem)
  }
  return path;
}

function thenExpectedToSpectralPaths(thenExpected){
  return thenExpected.map(item => thenExpectedItemToSpectralPath(item));
}

function debuggerGivenResultToSpectralPaths(debuggerGivenResult){
  let paths = [];
  debuggerGivenResult.given.forEach(ruleResult => {
    givenItem.paths.forEach(path => {
      paths.push(path.path);
    })
  });
  return paths;
}

exports.spectralPathToJsonPointer = spectralPathToJsonPointer;
exports.jsonPointerToSpectralPath = jsonPointerToSpectralPath;
exports.toSpectralPath = toSpectralPath;
exports.givenExpectedItemToSpectralPath = givenExpectedItemToSpectralPath;
exports.givenExpectedToSpectralPaths = givenExpectedToSpectralPaths;
exports.debuggerGivenResultToSpectralPaths = debuggerGivenResultToSpectralPaths;
exports.thenExpectedToSpectralPaths = thenExpectedToSpectralPaths;