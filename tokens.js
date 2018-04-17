'use strict';

const expect = require('chai').expect;
const OpenKoreanTextProcessor = require('open-korean-text-node').default;
const conn = require("./dbconnection");
const config = require('config');

var DateUtil = require('./util/DateUtil');

var tokens = "";

var koreaToken = [];
var wordCount = [];

var title_sum = {};

var shared = {};

var userConfig = config.get('dev.' + process.argv[2]);

var current = DateUtil.lastday(); // '2018-03-31' //
	
console.log(userConfig.userid, current);

function sortAssocObject(list) {
    var sortable = [];
    for (var key in list) {
    	if(list[key] >= 10) sortable.push([key, list[key]]); // wordcount 가 10 이상인것만 
    }

    sortable.sort(function(a, b) {
        return (a[1] > b[1] ? -1 : (a[1] < b[1] ? 1 : 0));
    });

    var orderedList = {};
    for (var i = 0; i < sortable.length; i++) {
        orderedList[sortable[i][0]] = sortable[i][1];
    }

    return orderedList;
}

conn.query("SELECT content FROM board WHERE writer != '비회원' and date_format(write_at,'%Y-%m-%d') = ?", [current], function(err, results) {
	if (err) {
		console.log("Error:", err);
	}
	
	console.log(results.length);
	for (var i = 0; i < results.length; i++) {
		var content  = results[i].content;
		
		if(content !== null || content === "") {
			content = content.replace("주문번호", "");
			content = content.replace("주문","");
			content = content.replace("번호","");
			content = content.replace("스포츠토토","");
			tokens += content;
		}
	}
	
//	console.log(tokens);
	
	shared.token = OpenKoreanTextProcessor.tokenizeSync(tokens);
	koreaToken = OpenKoreanTextProcessor.tokensToJsonArraySync(shared.token, false);

	for (var i = 0; i < koreaToken.length; i++) {
		if (koreaToken[i].pos === 'Noun' || koreaToken[i].pos === 'Adjective'){ //명사, 형용사일 경우만 counting
			if (koreaToken[i].hasOwnProperty('stem')){ //stem key 를 가지고 있는 경우
				if(wordCount.hasOwnProperty(koreaToken[i].stem)) { // wordCount 배열에 이미 값이 있을 때
					wordCount[koreaToken[i].stem] = wordCount[koreaToken[i].stem] + 1;
				} else { // wordCount 배열에 값이 없을 때
					wordCount[koreaToken[i].stem] = 1;
				}
			} else { //stem key 가 없는 경우
				if(wordCount.hasOwnProperty(koreaToken[i].text)) { // wordCount 배열에 이미 값이 있을 때
					wordCount[koreaToken[i].text] = wordCount[koreaToken[i].text] + 1;
				} else { // wordCount 배열에 값이 없을 때
					wordCount[koreaToken[i].text] = 1;
				}
			}
		}
	}
	
	delete shared.token;
	
	var wordC = JSON.stringify(sortAssocObject(wordCount))
	console.log(wordC);
	
	conn.query("SELECT title, DATE_FORMAT(write_at,'%Y-%m-%d') date, COUNT(title) count FROM board WHERE DATE_FORMAT(write_at,'%Y-%m-%d') = ? " +
			"GROUP BY title, DATE_FORMAT(write_at,'%Y-%m-%d')", [current], function(err, result) {
		if (err) {
			console.log("Error:", err);
		}
		
		for (var i = 0; i < result.length; i++) {
			var title  = result[i].title;
			var count  = result[i].count;
			
			title_sum[title] = count;
		}
		
		var str_title = JSON.stringify(title_sum);
		
		conn.query("INSERT INTO `board_sum` (`date`, `brand`, `title_sum`, `content_sum` ) VALUES (?, ?, ?, ?) " +
								"ON DUPLICATE KEY UPDATE `title_sum`= ?, `content_sum`= ?, `update_at`=current_time()",
								[ current, userConfig.brand, str_title, wordC, str_title, wordC], function(err, result) {
			if (err) {
				console.log("Error:", err);
			}
			
			if(conn){
				conn.end();
			}
		});	
		console.log(JSON.stringify(title_sum));
	});

	
//	if(conn){
//		conn.end();
//	}
});







