var async = require('async');
var request = require('request');
var _ = require('underscore');
var ent = require('ent');
var util = require('util');
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
var arr =[], arr2 = [];
var testFunction = function(){};
var sample = ["new_message",{"id":73255,"data":{"message":"åªè£¡äººå","msg_id":2}}];


	var userId_A = null;
	var userId_B = null;
	var testFunction1 = function(){}, testFunction2 = function(){};


	process.stdin.setEncoding('utf8');
	process.stdin.on('readable', function(){
		var input = process.stdin.read();
		//var temp;
		var fakeMessage;
		//var sample = ["new_message",{"id":null,"channel":null,"user_id":845609,"data":{"sender":1,"message":"å®å®","time":1431750704164,"msg_id":1},"success":null,"result":null,"token":null,"server_token":null}];
		//var sample = ["new_message",{"id":null,"channel":null,"user_id":876225,"data":{"sender":1,"message":"對","time":1431952068796,"mobile":null},"success":null,"result":null,"token":null,"server_token":null}];
		testFunction1(input);
	});

startToTalk();

function startToTalk(){
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
	wsB = new WebSocket('wss://wootalk.today/websocket', [], {
		headers: _.extend(wootalk_header, {
			'Cookie': '_gat=1; _wootalk_session=' + results[1] + '; _ga=GA1.2.1804571589.1429605824; __asc=6c4424fc14ce5fe7639ea11437a; __auc=c71404c914cdb259f913b23fc5b'
		})

	});

	wsA.on('open', function() {
		// console.log('A connected!');
		  setTimeout(function() {
  	console.log('A timeout');
	try {
		wsA.send('["update_state",{"id":104450,"data":{"typing":true}}]');
	}catch (e) {
		console.log('B\n'+e); }
  }, 2000);

	});


	wsA.on('message', function(message) {
		//console.log('A\n'+message);
		var pa = JSON.parse(message)[0]; //parse
		var ev = pa[0]; //event名字

		//client_connected, new_message, websocket_rails.ping, update_state

		if(pa[1]['data']['message']){//avoid undefined
			pa[1]['data']['message'] = ent.decode(pa[1]['data']['message']);//html entity
		}
		var msg = pa[1]['data']['message'];
		var sender = pa[1]['data']['sender']; //0 是系統, 1是自己, 2是對方
		var leave = pa[1]['data']['leave']; //若對方leave, 要寄給系統["change_person",{}]
		if (ev == 'new_message') {
			if( pa[1]['user_id'] ){
				userId_A = pa[1]['user_id'];//取得和A之間的user_id
				console.log('Aid: '+userId_A);
			}
			pa[1]['data']['sender'] = 1; //使系統知道是我要傳給對方
			message = JSON.stringify(pa);
			if (sender == 2) {
				console.log("A：「 " + msg + " 」");
				//console.log(message);
				wsB.send(message);
			} else if (!sender && leave) {
				//leave == false 是初始系統提示訊息的時候, 其餘時候都是undefined
				//change person 或 disconnected
				//
				console.log('A 已經離開房間');

				//wsA.send(leavecmd);
				//wsB.send(leavecmd);
			}
		} else if (ev == 'update_state') {

			if (pa[1]['data']['typing']) {
				//console.log('A typing...');
			}
			if (pa[1]['data']['last_read']) {
				//console.log('A 已讀');
			}
			try{
				wsB.send(JSON.stringify(pa));
				arr.push(pa);
			} catch (e){
				console.log('sendUpdateWsA'+e);
			}

		} else if (ev == 'websocket_rails.ping') {
			a = Randomize();
			wsA.send('["websocket_rails.pong",{"id":' + Randomize() + ',"data":{}}]')
		} else if (ev == 'client_connected') {
			console.log('A 已進入房間')

		}
	});

	wsA.on('close', function() {
		//console.log('A disconnected');
	});



	wsB.on('open', function() {
		// console.log('B connected!');
  setTimeout(function() {
  	console.log('B timeout');
	try {
		wsB.send('["update_state",{"id":104450,"data":{"typing":true}}]');
	}catch (e) {
		console.log('A\n'+e); }
  }, 2000);

	});
	wsB.on('message', function(message) {
		//console.log('B\n'+message);
		var pa = JSON.parse(message)[0]; //parse
		var ev = pa[0]; //event名字

		//client_connected, new_message, websocket_rails.ping, update_state

		if(pa[1]['data']['message']){//avoid undefined
			pa[1]['data']['message'] = ent.decode(pa[1]['data']['message']);//html entity
		}
		var msg = pa[1]['data']['message'];
		var sender = pa[1]['data']['sender']; //0 是系統, 1是自己, 2是對方
		var leave = pa[1]['data']['leave']; //若對方leave, 要寄給系統["change_person",{}]
		if (ev == 'new_message') {
			if( pa[1]['user_id'] ){
				userId_B = pa[1]['user_id'];//取得和B之間的user_id
				console.log('Bid: '+userId_B);
			}
			pa[1]['data']['sender'] = 1; //使系統知道是我要傳給對方
			message = JSON.stringify(pa);
			if (sender == 2) {
				console.log("B：「 " + msg + " 」\n");
				//console.log(message);
				wsA.send(message);
			} else if (!sender && leave) {
				//leave == false 是初始系統提示訊息的時候, 其餘時候都是undefined
				//change person 或 disconnected
				console.log('B 已經離開房間');

				//wsA.send(leavecmd);
				//wsB.send(leavecmd);
			}
		} else if (ev == 'update_state') {
			if (pa[1]['data']['typing']) {
				//console.log('B typing...');
			}
			if (pa[1]['data']['last_read']) {
				//console.log('B 已讀');
			}
			try{
				wsA.send(JSON.stringify(pa));
				arr.push(pa);
			}catch(e){
				console.log('sendUpdateWsB'+e);
			}



		} else if (ev == 'websocket_rails.ping') {
			a = Randomize();
			wsB.send('["websocket_rails.pong",{"id":' + Randomize() + ',"data":{}}]')

		} else if (ev == 'client_connected') {
			console.log('B 已進入房間');
			// wsB.send('["new_message",{"id":70527,"data":{"message":"嗨","msg_id":1}}]')
		}
	});

	wsB.on('close', function() {
		// console.log('B disconnected');
	});


	setTimeout(function() {
  	console.log('arr timeout');
console.log(arr.length);
//wsA.send('["new_message",{"id":73255,"data":{"message":"萊爾富hi-life ^^","msg_id":2}}]');
if(arr.length>=15){
	console.log("因為互聯所以即將中斷連線")
testFunction2()
}

  }, 5000);

testFunction1 = function(input){

		if(input){
			var sendToWho = input.substring(0, 3);
			var content =  input.substring(4, input.length-1);
		}
		if(sendToWho == 'end'){
			console.log('process.exit()');
			process.exit();
		}else if(sendToWho=='res'){
			testFunction2();
		}
		else if(sendToWho == 'toa' && userId_A ){
			console.log('發話給A用的user_id: '+userId_A);
			console.log('代替輸入send to A: '+content);
			//sample[1]['user_id'] = userId_A;
			sample[1]['data']['message'] = content;
			fakeMessage = JSON.stringify(sample);
			//console.log(fakeMessage);
			wsA.send(fakeMessage);
		}else if(sendToWho == 'tob' && userId_B ){
			console.log('發話給B用的user_id: '+userId_B);
			console.log('代替輸入send to B: '+content);
			sample[1]['user_id'] = userId_B;
			sample[1]['data']['message'] = content;
			fakeMessage = JSON.stringify(sample);
			//console.log(fakeMessage);
			wsB.send(fakeMessage);
		}else{
			console.log('尚未取得足夠對話參數')
		}
}

testFunction2 = function(){
	arr2.push(wsA);
	arr2.push(wsB);
	try{arr2[0].close();}
	catch(e){'testFuncWsA'+console.log(e);}
	try{arr2[1].close();}
	catch(e){'testFuncWsB'+console.log(e);}
	//delete wsA;
	//delete wsB;
	arr = [];
	arr2 = [];
	console.log('已中斷連線');
	console.log('memoryUsage:\n'+util.inspect(process.memoryUsage()));
	console.log('即將重啟');
	startToTalk();
}

});
}//end startToTalk