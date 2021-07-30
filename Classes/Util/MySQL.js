const mysql = require('mysql');

class MySQLConnector {
	constructor() {
		this.pool = null;
	}

	setPool(pool) {
		this.pool = pool;
	}

	createPool(config) {
		var self = this;
		try {
			this.pool = mysql.createPool(config);
			return {success:true};
		}catch(err) {
			return {success:false, err: err.toString()};
		}
	}

	closePool() {
		var self = this;
		return new Promise((resolve, reject) => {
			self.pool.end(err => {
				if(err) {
					reject(err);
				}else {
					resolve();
				}
			});
		});
	}

	async testConnection() {
		var self = this;
		try {
			var result = await this.execAsync(async connection => {
				var rows = await new Promise((resolve, reject) => {
					connection.query('SELECT 1 "value"', (err, rows) => {
						if(err) {
							reject(err);
						}else {
							resolve(rows);
						}
					});
				});
				return rows[0].value;
			});
			return {success: true};
		}catch(err) {
			return {success: true, err: err.toString()};
		}
	}

	async query(sql, data, opts) {
		var self = this;
		try {
			var result = await this.execAsync(async connection => {
				var rows = await new Promise((resolve, reject) => {
					connection.query(sql, data, (err, rows) => {
						if(err) {
							reject(err);
						}else {
							resolve(rows);
						}
					});
				});
				return rows;
			});
			if(opts && opts.selectQuery) {
				return JSON.parse(JSON.stringify(result));
			}else {
				return result;
			}
		}catch(err) {
			let errString = err.toString() + '\n';
			errString = errString + 'SQL: ' + sql + '\n';
			errString = errString + 'SQL Data: ' + JSON.stringify(data);
			throw new Error(errString);
		}
	}

	async execAsync(actionAsync) {
		var self = this;
		const connection = await new Promise((resolve, reject) => {
			self.pool.getConnection((err, connection) => {
				if(err) {
					reject(err);
				} else {
					resolve(connection);
				}
			});
		});

		try {
			return await actionAsync(connection);
		}finally {
			connection.release();
		}
	}
}

module.exports = new MySQLConnector();
