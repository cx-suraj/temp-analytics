const mySql = require('mysql2');

const pool = mySql.createPool({
	host: 'bvjsf4wr6lfc1jyjfmdr-mysql.services.clever-cloud.com',
	user: 'uhp6n23avxngdht6',
	password: '2YYyhAA9H3SPV1EqlEg8',
	database: 'bvjsf4wr6lfc1jyjfmdr',
});

module.exports = pool.promise();
