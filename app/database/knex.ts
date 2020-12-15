const environment = process.env.NODE_ENV;
const config = require('./knexfile.ts')[environment];
export default require('knex')(config);
