const SpectralTestRunner = require('./test-suite/spectral-test-runner.js');
const cli = require('./cli').default;
const getConfiguration = require('./test-suite/configuration');

exports.SpectralTestRunner = SpectralTestRunner;
exports.cli = cli;
exports.getConfiguration = getConfiguration;