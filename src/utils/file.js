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

function listFiles(pattern) {
  const paths = glob.sync(pattern);
  // Turning relative path in absolute ones
  const absolutePaths = paths.map(path => resolve(path));
  return absolutePaths;
}

exports.loadYaml = loadYaml;
exports.saveJson = saveJson;
exports.listFiles = listFiles;