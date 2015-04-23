var request = require('request');
var WebSocket = require('ws');
var Promise = require('bluebird');
Promise.promisifyAll(request);

var ws;

function Wootalk() {

};

Wootalk.prototype.connect = function(callback) {
	request
		.get('https://wootalk.today/', function(error, response, body) {
			wootalk_session = response.headers['set-cookie'][0].match(/_wootalk_session=(\w+)/)[1];
			ws = new WebSocket('wss://wootalk.today/websocket', [], {
				headers: {
					'Host': 'wootalk.today',
					'Origin': 'https://wootalk.today',
					'Cache-Control': 'no-cache',
					'Pragma': 'no-cache',
					'Connection': 'Upgrade',
					'Upgrade': 'websocket',
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
					'Sec-WebSocket-Version': 13,
					'Accept-Encoding': 'gzip, deflate, sdch',
					'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2',
					'Cookie': '_gat=1; _wootalk_session=' + wootalk_session + '; _ga=GA1.2.1804571589.1429605824; __asc=6c4424fc14ce5fe7639ea11437a; __auc=c71404c914cdb259f913b23fc5b'
				}
			});

			ws.on('open', function() {
				console.log('connected!');
			});
			ws.on('message', function(message) {
				console.log(message);
			});

			ws.on('close', function() {
				console.log('disconnected');
			});

		});

};

var extract = function(msg) {

};

Wootalk.prototype.chat = function(userid, msg, msg_id) {
	ws.send(["new_message", {
		"id": userid,
		"data": {
			"message": msg,
			"msg_id": (msg_id || 1)
		}
	}]);
};

Wootalk.prototype.leave = function() {
	ws.send(["change_person", {}]);
};

Wootalk.prototype.typing = function() {
	ws.send(["update_state", {
		"id": 127190,
		"data": {
			"typing": true
		}
	}])
}

exports.Wootalk = Wootalk;