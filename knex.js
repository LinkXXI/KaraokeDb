if(!process.env.DB_NAME){
    var dotenv = require('dotenv');
    dotenv.config({ path: './.env' });
}

const knex = require('knex')({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {min: 0, max: 5 },
  });
  
module.exports = knex;