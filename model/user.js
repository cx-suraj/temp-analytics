const db = require('../config/db');
class User {
	constructor(
		instaUserId,
		facebookUserId,
		instaUsername,
		facebookUsername,
		accesstoken,
		sessionId
	) {
		this.instaUserId = instaUserId;
		this.facebookUserId = facebookUserId;
		this.instaUsername = instaUsername;
		this.facebookUsername = facebookUsername;
		this.sessionId = sessionId;
		this.accesstoken = accesstoken;
	}

	async save() {
		await db.query(
			`INSERT INTO users (instaUserId, facebookUserId, instaUsername,facebookUsername, sessionId, accesstoken) 
			VALUES (?, ?, ?, ?, ?, ?);`,
			[
				this.instaUserId,
				this.facebookUserId,
				this.instaUsername,
				this.facebookUsername,
				this.sessionId,
				this.accesstoken,
			]
		);
	}

	static async getAllUsers() {
		const [users, _] = await db.query('SELECT * FROM users');
		return users;
	}

	static async getUserById(id) {
		const [user, _] = await db.query(
			'SELECT * FROM users WHERE instaUserId = ?',
			[id]
		);

		return user && user[0];
	}
}

module.exports = User;
