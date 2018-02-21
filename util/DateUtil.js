/**
 * http://usejsdoc.org/
 */

var DateUtil = {};

function getDataStr(myDate) {
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();

	if (month < 10) {
		month = "0" + month;
	}

	if (day < 10) {
		day = "0" + day;
	}

	return year + "-" + month + "-" + day;
}

DateUtil.today = function (){
	var date = new Date();
	var dayOfMonth = date.getDate();
	date.setDate(dayOfMonth - 1);

	return getDataStr(date);
};

DateUtil.lastweek = function() {
	var date = new Date();
	var dayOfMonth = date.getDate();
	date.setDate(dayOfMonth - 8);

	return getDataStr(date);
};

DateUtil.lastmonth = function() {
	var date = new Date();
	var monthOfYear = date.getMonth();
	date.setMonth(monthOfYear - 1);

	return getDataStr(date);
};


module.exports = DateUtil;