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
		+ DateUtil.today()
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
		.post(userConfig.saleUrl, postData)
		
		// 날짜 설정 후 매출종합분석화면으로 이동
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
			console.log(tdArr);
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
//									console.log(result);
								});
			}
		})
		.wait(5000).finally(function(){
			if(conn){
				conn.end();
			}
			return horseman.close();
		});