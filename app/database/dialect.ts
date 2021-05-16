// import { knex } from 'knex';

// const Dialect = require(`knex/lib/dialects/sqlite3/index.js`);
// Dialect.prototype._driver = () => require('@journeyapps/sqlcipher');

// // const custom = require('./CustomClient');

// const knexO = knex({
//   client: Dialect,
//   connection: ':memory:',
// });

// console.log(knexO.select(knexO.raw(1)).toSQL());

// export async function stuff() {
//     await knexO.schema.createTable('fooobar', (t: any) => {
//     t.bigincrements('id');
//     t.string('data');
//     });
//     await knexO('fooobar').insert({ data: 'nomnom' });

//     console.log('Gimme all the data:', await knexO('fooobar'));
// }

// export function stuff() {
//   var sqlite3 = require('@journeyapps/sqlcipher').verbose();
//   var db = new sqlite3.Database('testdb.sqlite3');

//   db.serialize(function() {
//     db.run('PRAGMA key = "123"');
//     db.run("CREATE TABLE lorem (info TEXT)");

//     var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (var i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM lorem", function(err: any, row: any) {
//         if (err) {
//           console.log(err);
//         }
//         console.log(row.id + ": " + row.info);
//     });
//   });

//   db.close();

// }


const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', null, 'your-encryption-key', {
  dialect: 'sqlite',
  dialectModule: require('@journeyapps/sqlcipher'),
  storage: 'testdb.sql'
})

class User extends Model {}
User.init({
  username: DataTypes.STRING,
  birthday: DataTypes.DATE
}, { sequelize, modelName: 'user' });

export async function stuff() {
  await sequelize.sync();
  const jane = await User.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20)
  });
  console.log(jane.toJSON());
}
