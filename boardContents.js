/**
 * http://usejsdoc.org/
 * 
 * board 테이블의 값을 읽어서 contents 의 내용을 채우는 모듈
 */

var Horseman = require('node-horseman');
var conn = require("./dbconnection");
var config = require('config');

var DateUtil = require('./util/DateUtil');

var boardConentLink = "https://romi00a.cafe24.com/admin/php/shop1/b/board_admin_bulletin_preview.php?board_no=15&board_group=5&disp_reply_btn=T&no=";

var userConfig = config.get('dev.' + process.argv[2]);
console.log(userConfig.userid);

var links = [];
var link = links.pop();

var current = DateUtil.lastday();

conn.query('SELECT datano FROM board WHERE content is NULL', [current], function(err, results){ //date_format(write_at,"%Y-%m-%d") = ? AND 
	if(err){
		console.log("Error : " + err);
	}
	
	for (var i = 0; i < results.length; i++) {
		links.push(results[i].datano);
	}
});

var horseman = new Horseman();

function getLinks(){
	return horseman.evaluate( function(){
		// This code is executed in the browser.
		var text = $('#orig_msg').text();
		return text;
	});
}

function scrape(){
	return new Promise( function( resolve, reject ){
		return getLinks()
		.then(function(text){
			text = text.substring(text.indexOf("- 주문번호 :"));
		
			conn.query("UPDATE `board` SET `content` = ? WHERE `datano` = ?", [text, link], function(err, results) {
				if (err) {
					console.log("Error:", err);
				}
			})	 
			
			if(links.length != 0) {
				link = links.pop();
		
				return horseman
				.open(boardConentLink + link)
				.wait(1000)
				.then( scrape );
			}
		})
		.then( resolve );
	});
}

horseman.on('resourceError',function(err) {
        console.log(err);
})

horseman
	.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
	.open(userConfig.url)
	.type('input[name="mall_id"]', userConfig.userid)
	.type('input[name="userpasswd"]', userConfig.userpasswd)
	.click('[class="btnSubmit"]')
	.wait('10000')
	.open(boardConentLink + link)
	.wait('5000')
//	.screenshot('first.png')
	.then( scrape )
	.wait(5000).finally(function(){
		if(conn){
			conn.end();
		}
		horseman.close();
	});