const express = require('express');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const request = require('request')
//const browser = require('./browser.js')
const app = express();
const utils = require('./utils.js');

const url = 'http://127.0.0.1:9904';
const bbc_conn = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'bbc',
  password: '1234qwer',
  database: 'bbc'
});

bbc_conn.connect();

const btca_conn = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'btca',
  password: '1234qwer',
  database: 'btca'
});

btca_conn.connect();

app.use(express.static(__dirname + '/static', {index: 'help.html'}));
app.use(bodyParser.json());
//browser.Load(app,conn);
const bbc_frok = '00000000a137256624bda82aec19645b1dd8d41311ceac9b5c3e49d2822cd49f';
const btca_frok = '0000000190e31a56bea3d263cc271649bf72ef1bf5ca8aa7e271ba9dd754f2da';

app.get('/invite_lists/:addr', function(req, res, next) {
  console.log("invite_lists:",req.params.addr);
  let sql = 'select lower as `current`, created_at from Relation where upper = ?';
  let params = [req.params.addr];
  btca_conn.query(sql,params,function(err,result){
    if(err) {
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/sendrawtransaction/:hex', function(req, res, next) {
  console.log("sendrawtransaction:",req.params.hex);
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:{'id':3,'method':'sendrawtransaction','jsonrpc':'2.0','params':{'txdata': req.params.hex}}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);     
      }
    });
});

app.get('/quotations', function(req, res, next) {
  console.log('quotations');
  let json = [
    {'tradePairId': 'BTCA/USDT', 'price': 13.2,'precision':8, 'price24h': 11.5},
    {'tradePairId': 'BBC/USDT', 'price': 11,'precision':8, 'price24h': 10},
    {'tradePairId': 'BTC/USDT', 'price': 10,'precision':8, 'price24h': 10},
    {'tradePairId': 'ETH/USDT', 'price': 9, 'precision':8,'price24h': 10},
    {'tradePairId': 'TRX/USDT', 'price': 8, 'precision':8,'price24h': 10},
    {'tradePairId': 'BNB/USDT', 'price': 7,'precision':8, 'price24h': 10},
    {'tradePairId': 'XRP/USDT', 'price': 6.5,'precision':8, 'price24h': 10}
  ];
  res.json(json);
});

app.post('/register', function(req, res, next) {
  let bbc_addr = '';
  let eth_addr = '';
  let btc_addr = '';
  for (let n = 0; n < req.body.params.wallet.length; n++) {
    switch (req.body.params.wallet[n].chain) {
      case 'BTC':
        btc_addr = req.body.params.wallet[n].address;
        break;
      case 'ETH':
        eth_addr = req.body.params.wallet[n].address;
        break;
      case 'BBC':
        bbc_addr = req.body.params.wallet[n].address;
        break;
    }
  }
  let walletId = req.body.params.hash;
  let sql = 'select * from addr where walletId = ?';
  btca_conn.query(sql,[walletId],function(err,result){
    if (err) {
      console.log('register','err');
      res.json({'error':err});
      return;
    }
    if (result.length == 0) {
      let pub = utils.Addr2Hex(bbc_addr);
      pub = pub.subarray(1);
      pub.reverse();
      request({
        url: url,
        method: 'POST',
        json: true,
        body:{'id':2,'method':'importpubkey','jsonrpc':'2.0','params':{'pubkey': pub.toString('hex')}}
      },function(error, response, body) {
        console.log('insert into addr(walletId,bbc_addr,eth_addr,btc_addr)values(%s,%s,%s,%s)',walletId,bbc_addr,eth_addr,btc_addr);
        sql = 'insert into addr(walletId,bbc_addr,eth_addr,btc_addr)values(?,?,?,?)';
        btca_conn.query(sql,[walletId,bbc_addr,eth_addr,btc_addr],function(err,result) {
          console.log('register','Add');
          res.json({'status':'add'});
        });
      });
    } else {
      console.log('register','OK');
      res.json({'status':'OK'});
    }
  });
});


app.get('/chart', function(req, res, next) {
  console.log('chart',req.query.walletId);
  let json = [
    {'balance': '1010', 'reward': '1.8', 'user_balance': false},
    {'balance': '2000', 'reward': '2', 'user_balance': false},
    {'balance': '3000', 'reward': '3.2', 'user_balance': true},
    {'balance': '4000', 'reward': '3.5', 'user_balance': false},
    {'balance': '5000', 'reward': '3.3', 'user_balance': false},
    {'balance': '6000', 'reward': '2.1', 'user_balance': false},
  ];
  res.json(json);
});



app.get('/banners', function(req, res, next) {
  console.log('banners');
  let json = [
    {
      'id': 1,
      'type': 'test',
      'title': '测试图片1',
      'content': '正常显示350x150',
      'img': 'http://via.placeholder.com/350x150',
      'bgImg': 'http://via.placeholder.com/350x150'
    },
    {
      'id': 2,
      'type': 'test',
      'title': '测试图片2',
      'content': 'url地址错误，显示默认的sugar图片',
      'img': 'http://via.placeholder.cn/350x150',
      'bgImg': 'http://via.placeholder.cn/350x150'
    }
  ];
  res.json(json);
});


//http://127.0.0.1:7711/unspent?address=1yq024eeg375yvd3kc45swqpvfz0wcrsbpz2k9escysvq68dhy9vtqe58&symbol=BTCA
app.get('/unspent', function(req, res, next) {
  console.log('unspent',req.query.symbol);
  let fork = bbc_frok;
  if (req.query.symbol == 'BTCA') {
    fork = btca_frok;
  }
  request({
    url: url,
    method: 'POST',
    json: true,
    body: {'id':1,'method':'listunspent','jsonrpc':'2.0','params':{'address':req.query.address,'fork':fork}}
  },function (error, response, body) {
    if (body.error) {
      res.json(body.error);
    } else {
      if (body.result.addresses.length == 1) {
        res.json(body.result.addresses[0].unspents);
      } else {
        res.json([]);
      }
    }
  });
});

app.get('/transaction', function(req, res, next) {
  //http://127.0.0.1:7711/transaction?address=1yq024eeg375yvd3kc45swqpvfz0wcrsbpz2k9escysvq68dhy9vtqe58&symbol=BBC
  console.log('transaction',req.query.symbol);
  let conn = bbc_conn;
  if (req.query.symbol == 'BTCA') {
      conn = btca_conn;
  }
  let sql = 'select txid as `hash`,form as fromAddress,`to` as toAddress,transtime as `timestamp`,1 as confirmed,free as txFee, amount from Tx where (`to` = ? and n = 0) or (form = ? and n = 0) order by id desc limit 10;';
  let params = [req.query.address,req.query.address];
  conn.query(sql,params,function(err,result) {
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});


app.get('/balance', function(req, res, next) {
  //http://127.0.0.1:7711/balance?address=1yq024eeg375yvd3kc45swqpvfz0wcrsbpz2k9escysvq68dhy9vtqe58&symbol=BBC
  //77f2b1217377f62cbb34c5b72b63c6c17fdb5e9e0b6173b4edcb19d03922c0f5
  //res.json({'address': req.query.address,'symbol': req.query.symbol});
  console.log('balance',req.query.symbol);
  let fork = bbc_frok;
  if (req.query.symbol == 'BTCA') {
    fork = btca_frok;
  }
  request({
    url: url,
    method: 'POST',
    json: true,
    body: {'id':1,'method':'getbalance','jsonrpc':'2.0','params':{'address':req.query.address,'fork':fork}}
  },function (error, response, body) {
    if (body.error) {
      res.json(body.error);
    } else {
      res.json({'unconfirmed':body.result[0].unconfirmed,'balance':body.result[0].avail});
    }
  });
});

let server = app.listen(7711, function() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('http://%s:%s', host, port);
});
