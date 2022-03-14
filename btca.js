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
  user: 'btca',
  password: '1234qwer',
  database: 'btca'
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


let server = app.listen(7711, function() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('http://%s:%s', host, port);
});
