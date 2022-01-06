const express = require('express');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const request = require('request')
const lib = require('./lib.js')

const app = express();
const url = 'http://127.0.0.1:9904';
//const url = "http://159.138.123.135:9904"
const conn = mysql.createConnection({
  host: '127.0.0.1',
  //host: '159.138.123.135',
  port: '3306',
  user: 'btca',
  password: '1234qwer',
  database: 'btca'
});

conn.connect();

app.use(express.static(__dirname + '/static', {index: 'help.html'}));
app.use(bodyParser.json());


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

  const ret = lib.GetTx(type,time,lockuntil,anchor,vin,sendto,amount,txfee,data);
  res.json(ret);
});

app.get('/releationByUpper/:upper', function(req, res, next) {
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

let server = app.listen(9906, function() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('http://%s:%s', host, port);
});


app.get('/listunspent/:fork/:addr', function(req, res, next) {
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

app.get('/listfork', function(req, res, next) {
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:{'id':3,'method':'listfork','jsonrpc':'2.0','params':{}}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);     
      }
    });
});

app.get('/transctions/:addr', function(req, res, next) {
  let sql = `select t.txid, t.block_hash, t.form as \`from\`, t.\`to\`, format(t.amount,4) as amount,
  format(t.free,4) as fee,
  (case when t.form =? and left(t.\`to\`,4)<>'20w0' then 2  
        when t.\`to\` =? and left(t.form,4)<>'20w0' then 4 end) as flag,
b.height,FROM_UNIXTIME(b.time,'%m-%d %H:%i:%s') as time,
  (select height from Block order by height desc limit 1) - b.height + 1 as confirm
from Tx t join Block b on b.\`hash\` = t.block_hash
where (\`to\`=? or form=?) and t.n = 0 order by t.id desc limit 10`
  let params = [req.params.addr,req.params.addr,req.params.addr,req.params.addr];
  conn.query(sql,params,function(err,result){
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});