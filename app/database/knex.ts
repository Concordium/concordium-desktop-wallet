const environment = process.env.NODE_ENV;
const config = require('./knexfile.ts')[environment];

/* eslint-disable global-require */
export default require('knex')(config);
