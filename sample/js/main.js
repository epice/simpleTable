requirejs.config({
	"baseUrl": "../src/js",
	"paths": {
		'jquery'    : 'lib/jquery-1.8.1.min',
		'underscore': 'lib/underscore-min'
	},
	"shim": {
		'jquery': {
			exports: '$'
		},
		'underscore': {
			exports: '_'
		}
	}
});

require(['controller'], function (Excel) {
	var excel = new Excel({
		// size: [10,5]
		data: [
			['a','b'],
			['c','d'],
			['e','f']
		]
	});

	$('#btn_check_data').on('click', function (e) {
		var data = excel.getData();
		console.log(data);
	});
});


