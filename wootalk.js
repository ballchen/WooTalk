var request = require('request');
var WebSocket = require('ws');
var Promise = require('bluebird');
Promise.promisifyAll(request);

function Wootalk() {
	var msg_id = 0;
	var user_id = null;
};

Wootalk.prototype.connect = function(callback) {
	request
		.get('https://wootalk.today/', function(error, response, body) {
			wootalk_session = response.headers['set-cookie'][0].match(/_wootalk_session=(\w+)/)[1];
			this.ws = new WebSocket('wss://wootalk.today/websocket', [], {
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

			this.ws.on('open', function() {
				console.log('connected!');
			});
			this.ws.on('message', function(message) {
				console.log(message);

				var pa = JSON.parse(message)[0];//parse
				var ev = pa[0];//event名字
				/*
					client_connected, new_message, websocket_rails.ping, update_state
				*/
				var msg = pa[1]['data']['message'];
				var sender = pa[1]['data']['sender'];//0 是系統, 1是自己, 2是對方
				var leave = pa[1]['data']['leave'];//若對方leave, 要寄給系統["change_person",{}]
				/*
					上述三項在不同ev下會undefined
					對方離開了不會再收到ping
					這時要change_person或disconnected
					不然不久後會自動disconnected
				*/

				console.log('\n目前該執行指令:');
				if(ev == 'new_message'){
					if(sender == 2){
						//回對方訊息
						console.log('  回對方訊息')
					}
					else if (sender == 0 && leave == true){
						//leave == false 是初始系統提示訊息的時候, 其餘時候都是undefined
						//change person 或 disconnected
						console.log('  change person of disconnected');
					}
					else {
						//sender == undefined 是初始系統訊息
						if(!this.user_id){
							/*有兩種初始系統提示訊息
							"message":"最新消息、吾聊愛情故事、尋人?! 請至.."
							"message":"找個人聊天..."
							前者給的user_id是正確值, 後者給的是null
							避免這兩者有先後順序問題影響取正確值, 故設此if branch
							*/
							this.user_id = pa[1]['user_id'];//在初期取得user_id後就不再更動
						}
						console.log('  初始系統提示訊息')
					}
				}
				else if(ev == 'update_state'){
					//do something
					console.log('  do something');
				}
				else if(ev == 'websocket_rails.ping'){
					//pong
					console.log('  pong it');
				}
				else if (ev == 'client_connected')
				{
					console.log('  初始連線成功訊息')
				}
				console.log('變數表:')
				console.log('ev:\n  '+ev);
				console.log('user_id:\n  '+this.user_id);
				console.log('msg:\n  '+msg);
				console.log('sender:\n  '+sender);
				console.log('leave:\n  '+leave);
				console.log(' ');

			});

			this.ws.on('close', function() {
				console.log('disconnected');
			});

		});

};

exports.Wootalk = Wootalk;


