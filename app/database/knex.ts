// TODO Environment should be dynamically set between development/production if we have differences between
// the environments.
const environment = 'development';
const config = require('./knexfile.ts')[environment];
export default require('knex')(config);
