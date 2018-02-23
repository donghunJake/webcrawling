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


//CREATE TABLE `statics` (
//		`date` date NOT NULL,  
//		`brand` varchar(50) NOT NULL,
//		`sale` int(11) DEFAULT NULL,
//		`totalvisit` int(11) DEFAULT NULL,
//		`firstvisit` int(11) DEFAULT NULL,
//		`revisit` int(11) DEFAULT NULL,
//		`newmember` int(11) DEFAULT NULL,
//		`pv` int(11) DEFAULT NULL,
//		`perman` int(11) DEFAULT NULL,
//		`buyer` float DEFAULT NULL,
//		`update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//		PRIMARY KEY (`brand`,`date`)
//) ENGINE=InnoDB DEFAULT CHARSET=utf8;
