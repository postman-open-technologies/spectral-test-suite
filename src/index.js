const SpectralTestLoader = require('./test-suite/spectral-test-loader').SpectralTestLoader;
const SpectralTestRunner = require('./test-suite/spectral-test-runner');
const cli = require('./cli').default;
const getConfiguration = require('./test-suite/configuration');

exports.SpectralTestLoader = SpectralTestLoader;
exports.SpectralTestRunner = SpectralTestRunner;
exports.cli = cli;
exports.getConfiguration = getConfiguration;