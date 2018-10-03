exports.handler= function(event, context, callback){

	const mysql = require('mysql');
	const Bot = require('node-telegram-bot-api');
	const rand= require('randomstring');
	const botToken = 'Your telegram bot from botFather token here';
	var params= [event.n, event.door];
	const bot = new Bot(botToken, {polling:false});
	var token='';
	var inserted=0;
	

	
	const connection = mysql.createConnection({
  		host: 'Your DB here',
  		user: 'Your username here',
  		password: 'Your password here',
  		database: 'Your database name here'
	});

	connection.connect((err) => {
  		if (err) throw err;
  		console.log('Connected!');
	});
	
	console.log(event);

	connection.query('SELECT * FROM Users INNER JOIN userdoor ON id = idUtente WHERE idUtente = ? AND idPorta = ?', params, (err, rows) =>{ 
		if (err) throw err;
		rows.forEach((row) =>{
			token=rand.generate(50);
			console.log(token);
			console.log(`L' id telegram di ${row.nome} ${row.cognome} è: ${row.telegramId} e il suo id nel DB è: ${row.id}`);
			var paramsToken=[event.door, row.id, token, Date.now()];
			console.log(paramsToken);
			connection.query('INSERT INTO request (idPorta, idUtente, token, time, used) VALUES (?, ?, ?, ?, 0)', paramsToken, (err, rows) =>{
				if(err) throw err;
				inserted++;
				if(inserted==1){
					connection.end();
				}
			});
			
			var message = 'your link is: https://9o5gjfwwsi.execute-api.eu-west-2.amazonaws.com/default/tokenStatus?token=' + token + '&id='+ row.id; 
			bot.sendMessage(row.telegramId, message, {disable_web_page_preview: true});
			
		});

	});
	callback(null, {statusConde:200,  body: 'OK'});
	
};

