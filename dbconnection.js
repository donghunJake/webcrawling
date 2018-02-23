/**
 * http://usejsdoc.org/
 */
var mysql = require('mysql');
var config = require('config')
var dbConfig = config.get('dev.dbConfig');


var connection = mysql.createPool({
	host : dbConfig.host,
	user : dbConfig.user,
	password : dbConfig.password,
	database : dbConfig.database
});

module.exports = connection;


//CREATE TABLE IF NOT EXISTS `statics` (
//		 `date` date NOT NULL,
//		 `brand` varchar(50) NOT NULL,
//		 `sale` int(11) DEFAULT NULL,
//		 `update_at` timestamp DEFAULT current_timestamp,
//		 PRIMARY KEY (`company`, `date`)
//		 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;