const fs = require('fs');
const yaml = require('js-yaml');
const glob = require('glob');
const resolve = require('path').resolve;

function loadYaml(filename) {
  const fileContents = fs.readFileSync(filename, 'utf8');
  const data = yaml.load(fileContents);
  return data;
}

function saveJson(data, filename){
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filename, content, 'utf8');
}

const DEFAULT_IGNORED = {
  ignored: p => /node_modules/.test(p.name)
}

function listFiles(pattern, overrideGlobConfiguration) {
  let globConfiguration;
  if(!overrideGlobConfiguration){
    globConfiguration = {
      ignore: "node_modules/**/*.*"
    }
  }
  const paths = glob.sync(pattern, globConfiguration);
  // Turning relative path in absolute ones
  const absolutePaths = paths.map(path => resolve(path));
  return absolutePaths;
}

exports.loadYaml = loadYaml;
exports.saveJson = saveJson;
exports.listFiles = listFiles;