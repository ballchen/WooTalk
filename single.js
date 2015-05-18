var async = require('async');
var request = require('request');
var _ = require('underscore');
var url = 'https://wootalk.today/';
var WebSocket = require('ws');
var wootalk_header = {
	'Host': 'wootalk.today',
	'Origin': 'https://wootalk.today',
	'Cache-Control': 'no-cache',
	'Pragma': 'no-cache',
	'Connection': 'Upgrade',
	'Upgrade': 'websocket',
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
	'Sec-WebSocket-Version': 13,
	'Accept-Encoding': 'gzip, deflate, sdch',
	'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,zh-CN;q=0.2'
};
var Randomize = function() {
	return Math.floor((Math.random() * 100000) + 50000);
};

var leavecmd = '["change_person",{}]';


async.parallel([
	function(cb) {
		request.get(url, function(error, response, body) {
			var session = response.headers['set-cookie'][0].match(/_wootalk_session=(\w+)/)[1];
			cb(null, session);
		});
	},
	function(cb) {
		request.get(url, function(error, response, body) {
			var session = response.headers['set-cookie'][0].match(/_wootalk_session=(\w+)/)[1];
			cb(null, session);
		});
	}
], function(err, results) {
	wsA = new WebSocket('wss://wootalk.today/websocket', [], {
		headers: _.extend(wootalk_header, {
			'Cookie': '_gat=1; _wootalk_session=' + results[0] + '; _ga=GA1.2.1804571589.1429605824; __asc=6c4424fc14ce5fe7639ea11437a; __auc=c71404c914cdb259f913b23fc5b'
		})
	});

	var userId_A = null;
	process.stdin.setEncoding('utf8');
	process.stdin.on('readable', function(){
		var input = process.stdin.read();
		//var temp;
		var fakeMessage;
		//var sample = ["new_message",{"id":null,"channel":null,"user_id":845609,"data":{"sender":1,"message":"å®å®","time":1431750704164,"msg_id":1},"success":null,"result":null,"token":null,"server_token":null}];
		var sample = ["new_message",{"id":null,"channel":null,"user_id":876225,"data":{"sender":1,"message":"對","time":1431952068796,"mobile":null},"success":null,"result":null,"token":null,"server_token":null}];
		if(input){
			//var sendToWho = input.substring(0, 3);
			//var content =  input.substring(4, input.length-1);
			var content = input.substring(0, input.length-1);
		}
		if(content == 'end'){//sendToWho
			console.log('process.exit()');
			wsA.send(leavecmd);
			process.exit();
		}else if( userId_A ){ //sendToWho == 'toa' &&
			//console.log('發話給A用的user_id: '+userId_A);
			//console.log('代替輸入send to A: '+content);
			//temp = fakePaToA;
			sample[1]['user_id'] = userId_A;
			sample[1]['data']['message'] = content;
			//temp[1]['data']['message'] = content;
			fakeMessage = JSON.stringify(sample);
			//console.log(fakeMessage);
			wsA.send(fakeMessage);
		}else{
			console.log('尚未取得足夠對話參數')
		}
	});


	wsA.on('open', function() {
		// console.log('A connected!');
	});


	wsA.on('message', function(message) {
		//console.log(message)
		var pa = JSON.parse(message)[0]; //parse
		var ev = pa[0]; //event名字
		/*
			client_connected, new_message, websocket_rails.ping, update_state
		*/
		var msg = pa[1]['data']['message'];
		var sender = pa[1]['data']['sender']; //0 是系統, 1是自己, 2是對方
		var leave = pa[1]['data']['leave']; //若對方leave, 要寄給系統["change_person",{}]
		if (ev == 'new_message') {
			//console.log(message)
			if( pa[1]['user_id'] ){
				userId_A = pa[1]['user_id'];

				//console.log(message);
			}
			pa[1]['data']['sender'] = 1; //使系統知道是我要傳給對方
			message = JSON.stringify(pa);
			if (sender == 2) {
				//fakePaToB = pa;//取得傳假話參數");
				console.log("A：「 " + msg + " 」");
				//console.log(message);
				//wsB.send(message);
			} else if (!sender && leave) {
				//leave == false 是初始系統提示訊息的時候, 其餘時候都是undefined
				//change person 或 disconnected
				//
				console.log('A 已經離開房間');

				wsA.send(leavecmd);
				//wsB.send(leavecmd);
			}
		} else if (ev == 'update_state') {

			if (pa[1]['data']['typing']) {
				//console.log('A typing...');
			}
			if (pa[1]['data']['last_read']) {
				//console.log('A 已讀');
			}
			//wsB.send(message);


		} else if (ev == 'websocket_rails.ping') {
			a = Randomize();
			wsA.send('["websocket_rails.pong",{"id":' + Randomize() + ',"data":{}}]')
		} else if (ev == 'client_connected') {
			console.log('A 已進入房間')

		}
	});

	wsA.on('close', function() {
		console.log('A disconnected');
	});




});