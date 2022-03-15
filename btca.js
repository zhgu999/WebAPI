const express = require('express');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const request = require('request')
const lib = require('./lib.js')
const browser = require('./browser.js')
const app = express();

const url = 'http://127.0.0.1:9904';
const conn = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'bbc',
  password: '1234qwer',
  database: 'bbc'
});

conn.connect();

app.use(express.static(__dirname + '/static', {index: 'help.html'}));
app.use(bodyParser.json());

browser.Load(app,conn);

app.post('/createtransaction', function(req, res, next) {
  const type = req.body.type;
  const time = req.body.time;
  const lockuntil = req.body.lockuntil;
  const anchor = req.body.anchor;
  const vin = req.body.vin;
  const sendto = req.body.sendto;
  const amount = req.body.amount;
  const txfee = req.body.txfee;
  const data = req.body.data;
  console.log("createtransaction:",type,time,lockuntil,anchor,vin,sendto,amount,txfee,data);
  const ret = lib.GetTx(type,time,lockuntil,anchor,vin,sendto,amount,txfee,data);
  res.json(ret);
});

app.get('/releationByUpper/:upper', function(req, res, next) {
  console.log("releationByUpper:",req.params.upper);
  let sql = 'select * from Relation where upper =?';
  let params = [req.params.upper];
  conn.query(sql,params,function(err,result){
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/releationByLower/:lower', function(req, res, next) {
  console.log("releationByLower:",req.params.lower);
  let sql = 'select * from Relation where lower =?';
  let params = [req.params.lower];
  conn.query(sql,params,function(err,result){
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/listunspent/:fork/:addr', function(req, res, next) {
  console.log("listunspent:",req.params.fork,req.params.addr);
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:{'id':1,'method':'listunspent','jsonrpc':'2.0','params':{'fork':req.params.fork,'address': req.params.addr,'max':0 }}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);    
      }
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
    {'tradePairId': 'SUG/USDT', 'price': 13.2,'precision':8, 'price24h': 11.5},
    {'tradePairId': 'BBC/USDT', 'price': 11,'precision':8, 'price24h': 10},
    {'tradePairId': 'BTC/USDT', 'price': 10,'precision':8, 'price24h': 10},
    {'tradePairId': 'ETH/USDT', 'price': 9, 'precision':8,'price24h': 10},
    {'tradePairId': 'TRX/USDT', 'price': 8, 'precision':8,'price24h': 10},
    {'tradePairId': 'BNB/USDT', 'price': 7,'precision':8, 'price24h': 10},
    {'tradePairId': 'XRP/USDT', 'price': 6.5,'precision':8, 'price24h': 10}
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


//http://127.0.0.1:7711/unspent?address=1yq024eeg375yvd3kc45swqpvfz0wcrsbpz2k9escysvq68dhy9vtqe58&symbol=BBC
app.get('/unspent', function(req, res, next) {
  console.log('unspent');
  if (req.query.symbol != 'BBC') {
    res.json([]);
    return;
  }
  request({
    url: url,
    method: 'POST',
    json: true,
    body: {'id':1,'method':'listunspent','jsonrpc':'2.0','params':{'address':req.query.address}}
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
  console.log('transaction');
  if (req.query.symbol != 'BBC') {
    res.json({'unconfirmed':'0','balance':0});
    return;
  }
  let sql = 'select txid as `hash`,form as fromAddress,`to` as toAddress,transtime as `timestamp`,1 as confirmed,free as txFee, amount from Tx where `to` = ? or form = ? order by id desc limit 10;';
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
  console.log('balance');
  if (req.query.symbol != 'BBC') {
    res.json({'unconfirmed':'0','balance':0});
    return;
  }
  let sql = 'select * from addr where bbc_addr = ?';
  let params = [req.query.address];
  conn.query(sql,params,function(err,result){
    if (err) {
      res.json({'error':err});
      return;
    }
    if (result.length == 0) {
       request(
        {
          url: url,
          method: 'POST',
          json: true,
          body:{'id':1,'method':'getpubkey','jsonrpc':'2.0','params':{'privkeyaddress': req.query.address}}
        },
        function(error, response, body) {
          if (body.error) {
            res.json(body.error);
          } else {
            request({
              url: url,
              method: 'POST',
              json: true,
              body:{'id':2,'method':'importpubkey','jsonrpc':'2.0','params':{'pubkey': body.result}}
            },function(error, response, body) {
              if (body.error) {
                res.json(body.error);
              } else {
                request({
                  url: url,
                  method: 'POST',
                  json: true,
                  body: {'id':3,'method':'getbalance','jsonrpc':'2.0','params':{'address':body.result}}
                },function (error, response, body) {
                  if (body.error) {
                    res.json(body.error);
                  } else {
                    sql = 'insert into addr(bbc_addr)values(?)';
                    conn.query(sql,[req.query.address],function(err,result){
                      res.json({'unconfirmed':body.result[0].unconfirmed,'balance':body.result[0].avail});
                    });
                  }
                });
              }
            });
          }
        });
    } else {
      request({
        url: url,
        method: 'POST',
        json: true,
        body: {'id':1,'method':'getbalance','jsonrpc':'2.0','params':{'address':req.query.address}}
      },function (error, response, body) {
        if (body.error) {
          res.json(body.error);
        } else {
          res.json({'unconfirmed':body.result[0].unconfirmed,'balance':body.result[0].avail});
        }
      })
    }
  });
});

let server = app.listen(7711, function() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('http://%s:%s', host, port);
});
