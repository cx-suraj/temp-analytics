const mySql = require('mysql2');

const instaPool = mySql.createPool({
	host: 'ba5rbtal3ceqz4vlnrwf-mysql.services.clever-cloud.com',
	user: 'uomwb9euqhqxmwvi',
	password: 'XW18ynaZifiCEeXMk4cK',
	database: 'ba5rbtal3ceqz4vlnrwf',
});

module.exports = instaPool.promise();
