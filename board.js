/**
 * http://usejsdoc.org/
 * 
 * 게시판의 정보를 먼저 DB 에 저장 한다. except contents.
 */

var Horseman = require('node-horseman');
var conn = require("./dbconnection");
var config = require('config');

var DateUtil = require('./util/DateUtil');

function getDate(num) {
	var myDate = new Date();
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate() - 1;
	
	if (month < 10) {
		month = "0" + month;
	}

	if (day < 10) {
		day = "0" + day;
	}
	if (num === 1) {
		return "year1=" + year + "&month1=" + month + "&day1=" + day;  // "year1=2018&month1=04&day1=13"; // 
	} else {
		return "year2=" + year + "&month2=" + month + "&day2=" + day;  // "year2=2018&month2=04&day2=03"; //
	}
}

var putData = getDate(1) +
		"&" +
		getDate(2) +
		"&sel_board_no=&sel_spam_view=in&search_channel=&list_limit=10&search=subject&search_key=&is_reply=&is_comment=&real_filename=&mem_type=&board_category=&no_member_article=F&searchSort=";

var boardlink = "sel_spam_view=in&list_limit=10&search=subject&search_key=&" +
		getDate(1) +
		"&" +
		getDate(2) +
		"&is_reply=&is_comment=&real_filename=&mem_type=&search_channel=&searchSort=&no_member_article=F&board_category=&sel_board_no=15&page=";
               

var linkCount = 0;

var userConfig = config.get('dev.' + process.argv[2]);
console.log(userConfig.userid);

var horseman = new Horseman();

var links = [];

function getLinks(){
	return horseman.evaluate( function(){
		// This code is executed in the browser.
		var links = [];
		
		var trArr = $('#bulletin_list_table > tbody').children();
		var td = "";
		trArr.each(function(i) {
			td = trArr.eq(i).children();
			
			var link = {};
			
			link.title = td.eq(5).text().replace(/\n/g,'').trim();
			link.dataNo = td.eq(7).children('a').attr("data-no");
			link.date = td.eq(11).text().replace(/\n/g,'').trim();
			
			if(!link.title.match('답변') && !link.title.match('제목')){
				if(td.eq(9).children('div').children('a').length > 0) {
					if(td.eq(9).children('div').children('a').attr("href") === '#') {
						link.writer = td.eq(9).children('div').children('a').attr("onclick").match(/[^(]*\(([^)]*)\)/)[1].replace(/'/g,'').trim();
					} else {
						link.writer = td.eq(9).children('div').children('a').attr("href").match(/[^(]*\(([^)]*)\)/)[1].replace(/'/g,'').trim();
					}
				} else {
					link.writer = "비회원";
				}
				links.push(link);
			}
		});
		return links;
	});
}

function scrape(){
	return new Promise( function( resolve, reject ){
		return getLinks()
		.then(function(newLinks){
			
			if(linkCount-- !== 0) {
				console.log(linkCount);
				console.log('scrape :', newLinks);
				
				for (var i = 0; i < newLinks.length; i++) {
					conn.query("INSERT INTO `board` (`datano`, `brand`, `title`, `writer`, `write_at`) VALUES (?, ?, ?, ?, ?) " +
							"ON DUPLICATE KEY UPDATE `title`=?, `writer`=?, `write_at`=?, `update_at`=current_time() ",
							[ newLinks[i].dataNo, userConfig.brand, newLinks[i].title, newLinks[i].writer, newLinks[i].date,
								newLinks[i].title, newLinks[i].writer, newLinks[i].date], function(err, result) {
										if (err) {
											console.log("Error:", err);
										}
									});
				}
				
				return horseman
				.post(userConfig.boardlistUrl, boardlink+linkCount)
				.wait(1000)
				.then( scrape );
			}
		})
		.then( resolve );
	});
}

horseman.on('resourceError',function(err) {
        console.log(err);
});

horseman
	.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
	.open(userConfig.url)
	.type('input[name="mall_id"]', userConfig.userid)
	.type('input[name="userpasswd"]', userConfig.userpasswd)
	.click('[class="btnSubmit"]')
	.wait('10000')
	.open(userConfig.boardUrl)
	.wait('5000')
	.post(userConfig.boardlistUrl, putData)
//	.screenshot('first.png')
	.evaluate(function() {
		var $ = window.$ || window.Jquery;

		var link = null;
		$('td.main_gray a').each(function( item ){
			link = $(this).attr("href");
		});
		var regEx = /\b[\w-]+$/;
		return link.match(regEx)[0];
	})
	.then(function(result){
		linkCount = result;
		return horseman.post(userConfig.boardlistUrl, boardlink+result);
	})
	.then( scrape )
	.wait(5000).finally(function(){
		if(conn){
			conn.end();
		}
		horseman.close();
	});