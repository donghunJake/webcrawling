/**
 * 
 */

var Horseman = require('node-horseman');
var conn = require("./dbconnection");
var fs = require('fs');

var users = ['PhantomJS',
	'ariyahidayat',
	'detronizator',
	'KDABQt',
	'lfranchi',
	'jonleighton',
	'_jamesmgreene',
	'Vitalliumm'];

//users.forEach( function( user ){
	var horseman = new Horseman();
	horseman
		.open('http://mobile.twitter.com/' + users[0])
		.text('.UserProfileHeader-stat--followers .UserProfileHeader-statCount')
		.then(function(text){
			console.log( users[0] + ': ' + text );	
			conn.query("select * from employee", function(err, result){
				if(err) console.log(err);
				return result;
			});
		})
		.finally(function(){
			return horseman.close();
			
		});	
//});