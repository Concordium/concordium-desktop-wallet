/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path');

function fromRoot(path) {
    return join(__dirname, '../../', path);
}

module.exports = { fromRoot };
