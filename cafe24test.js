/**
 * 
 */
var Horseman = require('node-horseman');
var conn = require("./dbconnection");
var config = require('config');

var DateUtil = require('./util/DateUtil');

var postData = 'VAL_DATE%5Bstart_dt%5D='
		+ DateUtil.lastweek()
		+ '&VAL_DATE%5Bend_dt%5D='
		+ DateUtil.lastday()
		+ '&avgType=prevday&VAL_DATE%5Bunit_format%5D=day&period_type=day&limitCount=20&limitStart=0&log_ver=3&extperiod=3&reportVersion=total';

// node cafe24test.js moss

var userConfig = config.get('dev.' + process.argv[2]);
console.log(userConfig.userid);

var horseman = new Horseman();
horseman
		.userAgent(
				'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
		.open(userConfig.url)
		.type('input[name="mall_id"]', userConfig.userid)
		.type('input[name="userpasswd"]', userConfig.userpasswd)
		.click('[class="btnSubmit"]')
		.wait('10000')
		.click('[class="access"]')		// 접속통계
		.wait('10000')

		.open(userConfig.staticUrl)		// 접속통계화면으로
		.wait('10000')
		.post(userConfig.saleUrl, postData)// 날짜 설정 후 매출종합분석화면으로 이동
		.waitForSelector('#graphTbl')
		.evaluate(function() {
			var $ = window.$ || window.Jquery;

			var trArr = $('#graphTbl > tbody').children();
			var td = "";
			var tdArr = [];
			
			trArr.each(function(i) {
				td = trArr.eq(i).children();
				var sales = {};
				sales.date = td.eq(0).text().substring(0, 10);
				sales.sale = parseFloat(td.eq(4).text().replace(/\,/g, ''));

				tdArr.push(sales);
			});
			return tdArr;
		})
		.then(function(results) {
			console.log(results);
			for (var i = 0; i < results.length; i++) {
				conn.query("INSERT INTO `statics` (`brand`, `date`, `sale`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `brand`=?, `date`=?, `sale`=?, `update_at`=current_time() ",
						[ userConfig.brand, results[i].date, results[i].sale, userConfig.brand, results[i].date, results[i].sale ], function(err, result) {
									if (err) {
										console.log("Error:", err);
									}
								});
			}
		})
		.post(userConfig.visitUrl, postData)
		.waitForSelector('#graphTbl')
		.evaluate(function() {
			var $ = window.$ || window.Jquery;

			var trArr = $('#graphTbl > tbody').children();
			var td = "";
			var tdArr = [];
			
			trArr.each(function(i) {
				td = trArr.eq(i).children();
				var visit = {};
				visit.date = td.eq(0).text().substring(0, 10);
				visit.totalvisit = parseFloat(td.eq(1).text().replace(/\,/g, ''));
				visit.firstvisit = parseFloat(td.eq(2).text().replace(/\,/g, ''));
				visit.revisit = parseFloat(td.eq(3).text().replace(/\,/g, ''));
				
				tdArr.push(visit);
			});
			return tdArr;
		})
		.then(function(results) {
			console.log(results);
			for (var i = 0; i < results.length; i++) {
				conn.query("INSERT INTO `statics` (`brand`, `date`, `totalvisit`, `firstvisit`, `revisit`) VALUES (?, ?, ?, ?, ?) " +
						"ON DUPLICATE KEY UPDATE `brand`=?, `date`=?, `totalvisit`=?, `firstvisit`=?, `revisit`=?, `update_at`=current_time() ",
						[ userConfig.brand, results[i].date, results[i].totalvisit, results[i].firstvisit,  results[i].revisit, 
							userConfig.brand, results[i].date, results[i].totalvisit, results[i].firstvisit,  results[i].revisit ], function(err, result) {
									if (err) {
										console.log("Error:", err);
									}
								});
			}
		})
		.post(userConfig.memberUrl, postData) // 신규가입자 수 화면으로 이동
		.waitForSelector('#graphTbl')
		.evaluate(function() {
			var $ = window.$ || window.Jquery;
		
			var trArr = $('#graphTbl > tbody').children();
			var td = "";
			var tdArr = [];
			
			trArr.each(function(i) {
				td = trArr.eq(i).children();
				var member = {};
				member.date = td.eq(0).text().substring(0, 10);
				member.newmember = parseFloat(td.eq(1).text().replace(/\,/g, ''));
				
				tdArr.push(member);
			});
			return tdArr;
		})
		.then(function(results) {
			console.log(results);
			for (var i = 0; i < results.length; i++) {
				conn.query("INSERT INTO `statics` (`brand`, `date`, `newmember`) VALUES (?, ?, ?) " +
						"ON DUPLICATE KEY UPDATE `brand`=?, `date`=?, `newmember`=?, `update_at`=current_time() ",
						[ userConfig.brand, results[i].date, results[i].newmember,
							userConfig.brand, results[i].date, results[i].newmember], function(err, result) {
									if (err) {
										console.log("Error:", err);
									}
								});
			}
		})
		.post(userConfig.pvUrl, postData) // 페이지뷰 화면으로 이동
		.waitForSelector('#graphTbl')
		.evaluate(function() {
			var $ = window.$ || window.Jquery;
		
			var trArr = $('#graphTbl > tbody').children();
			var td = "";
			var tdArr = [];
			
			trArr.each(function(i) {
				td = trArr.eq(i).children();
				var pvs = {};
				pvs.date = td.eq(0).text().substring(0, 10);
				pvs.pv = parseFloat(td.eq(1).text().replace(/\,/g, ''));
				
				tdArr.push(pvs);
			});
			return tdArr;
		})
		.then(function(results) {
			console.log(results);
			for (var i = 0; i < results.length; i++) {
				conn.query("INSERT INTO `statics` (`brand`, `date`, `pv`) VALUES (?, ?, ?) " +
						"ON DUPLICATE KEY UPDATE `brand`=?, `date`=?, `pv`=?, `update_at`=current_time() ",
						[ userConfig.brand, results[i].date, results[i].pv,
							userConfig.brand, results[i].date, results[i].pv], function(err, result) {
									if (err) {
										console.log("Error:", err);
									}
								});
			}
		})
		.post(userConfig.permanUrl, postData) // 1인당 매출분석 화면으로 이동
		.waitForSelector('#graphTbl')
		.evaluate(function() {
			var $ = window.$ || window.Jquery;
		
			var trArr = $('#graphTbl > tbody').children();
			var td = "";
			var tdArr = [];
			
			trArr.each(function(i) {
				td = trArr.eq(i).children();
				var permans = {};
				permans.date = td.eq(0).text().substring(0, 10);
				permans.perman = parseFloat(td.eq(2).text().replace(/\,/g, ''));
				
				tdArr.push(permans);
			});
			return tdArr;
		})
		.then(function(results) {
			console.log(results);
			for (var i = 0; i < results.length; i++) {
				conn.query("INSERT INTO `statics` (`brand`, `date`, `perman`) VALUES (?, ?, ?) " +
						"ON DUPLICATE KEY UPDATE `brand`=?, `date`=?, `perman`=?, `update_at`=current_time() ",
						[ userConfig.brand, results[i].date, results[i].perman,
							userConfig.brand, results[i].date, results[i].perman], function(err, result) {
									if (err) {
										console.log("Error:", err);
									}
								});
			}
		})
		.post(userConfig.buyerUrl, postData) // 구매분석 화면으로 이동
		.waitForSelector('#graphTbl')
		.evaluate(function() {
			var $ = window.$ || window.Jquery;
		
			var trArr = $('#graphTbl > tbody').children();
			var td = "";
			var tdArr = [];
			
			trArr.each(function(i) {
				td = trArr.eq(i).children();
				var buyers = {};
				buyers.date = td.eq(0).text().substring(0, 10);
				buyers.buyer = parseFloat(td.eq(5).text().replace(/\,/g, ''));
				
				tdArr.push(buyers);
			});
			return tdArr;
		})
		.then(function(results) {
			console.log(results);
			for (var i = 0; i < results.length; i++) {
				conn.query("INSERT INTO `statics` (`brand`, `date`, `buyer`) VALUES (?, ?, ?) " +
						"ON DUPLICATE KEY UPDATE `brand`=?, `date`=?, `buyer`=?, `update_at`=current_time() ",
						[ userConfig.brand, results[i].date, results[i].buyer,
							userConfig.brand, results[i].date, results[i].buyer], function(err, result) {
									if (err) {
										console.log("Error:", err);
									}
								});
			}
		})
		.wait(5000).finally(function(){
			if(conn){
				conn.end();
			}
			return horseman.close();
		});